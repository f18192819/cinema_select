// Zero-dependency static server and WebSocket relay for SmartCinema course demos.
const fs = require("fs");
const http = require("http");
const path = require("path");
const crypto = require("crypto");

const PORT = Number(process.env.PORT || 8080);
const ROOT_DIR = __dirname;
const STATE_FILE = path.join(ROOT_DIR, "data", "smartCinemaState.json");
const clients = new Set();
let revisionCounter = 0;
let serverState = loadServerState();

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "application/javascript; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

const server = http.createServer((request, response) => {
  const requestPath = request.url === "/" ? "/index.html" : request.url.split("?")[0];
  const filePath = path.resolve(ROOT_DIR, `.${requestPath}`);
  const relativePath = path.relative(ROOT_DIR, filePath);

  if (
    relativePath.startsWith("..")
    || path.isAbsolute(relativePath)
    || relativePath === "data"
    || relativePath.startsWith(`data${path.sep}`)
    || !fs.existsSync(filePath)
    || fs.statSync(filePath).isDirectory()
  ) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Type": MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream"
  });
  fs.createReadStream(filePath).pipe(response);
});

server.on("upgrade", (request, socket) => {
  if (request.url !== "/ws" || request.headers.upgrade?.toLowerCase() !== "websocket") {
    socket.destroy();
    return;
  }

  const key = request.headers["sec-websocket-key"];
  if (!key) {
    socket.destroy();
    return;
  }

  const acceptKey = crypto
    .createHash("sha1")
    .update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`)
    .digest("base64");

  socket.write([
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "",
    ""
  ].join("\r\n"));

  const client = { socket, buffer: Buffer.alloc(0) };
  clients.add(client);
  socket.on("data", (chunk) => receiveFrames(client, chunk));
  socket.on("close", () => clients.delete(client));
  socket.on("error", () => clients.delete(client));
});

server.listen(PORT, () => {
  console.log(`SmartCinema WebSocket server: http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/ws`);
});

function receiveFrames(client, chunk) {
  client.buffer = Buffer.concat([client.buffer, chunk]);

  while (client.buffer.length >= 2) {
    const firstByte = client.buffer[0];
    const secondByte = client.buffer[1];
    const opcode = firstByte & 0x0f;
    const masked = Boolean(secondByte & 0x80);
    let payloadLength = secondByte & 0x7f;
    let offset = 2;

    if (payloadLength === 126) {
      if (client.buffer.length < offset + 2) return;
      payloadLength = client.buffer.readUInt16BE(offset);
      offset += 2;
    } else if (payloadLength === 127) {
      if (client.buffer.length < offset + 8) return;
      const high = client.buffer.readUInt32BE(offset);
      const low = client.buffer.readUInt32BE(offset + 4);
      payloadLength = high * 2 ** 32 + low;
      offset += 8;
    }

    const maskLength = masked ? 4 : 0;
    if (payloadLength > 2 * 1024 * 1024 || client.buffer.length < offset + maskLength + payloadLength) return;

    const mask = masked ? client.buffer.subarray(offset, offset + 4) : null;
    offset += maskLength;
    const payload = Buffer.from(client.buffer.subarray(offset, offset + payloadLength));
    client.buffer = client.buffer.subarray(offset + payloadLength);

    if (mask) {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] ^= mask[index % 4];
      }
    }

    if (opcode === 0x8) {
      client.socket.end();
      return;
    }
    if (opcode === 0x9) {
      sendFrame(client.socket, payload, 0xA);
      continue;
    }
    if (opcode === 0x1) {
      handleClientMessage(client, payload.toString("utf8"));
    }
  }
}

function handleClientMessage(client, rawMessage) {
  let message;
  try {
    message = JSON.parse(rawMessage);
  } catch (error) {
    sendJson(client.socket, { type: "error", message: "Invalid JSON message." });
    return;
  }

  if (message.type === "state-sync-request") {
    if (!serverState && isValidState(message.state)) {
      serverState = stampServerRevision(message.state);
      saveServerState();
    }

    sendJson(client.socket, {
      type: "state-sync",
      state: serverState,
      reason: "已连接到 WebSocket 实时座位服务。"
    });
    return;
  }

  if (message.type !== "state-commit") {
    return;
  }

  if (!isValidState(message.state)) {
    sendCommitResult(client.socket, message, false, "提交的数据格式无效。");
    return;
  }

  const expectedRevision = String(message.baseRevision || "");
  const currentRevision = String(serverState?.realtimeRevision || "");
  if (serverState && expectedRevision !== currentRevision) {
    sendCommitResult(client.socket, message, false, "座位状态已被其他用户更新，请重新选择。");
    return;
  }

  serverState = stampServerRevision(message.state);
  saveServerState();
  sendCommitResult(client.socket, message, true, "状态已同步到实时服务。");
  broadcastJson({
    type: "state-update",
    state: serverState,
    sourceId: message.sourceId || "",
    reason: message.reason || "其他用户已更新座位状态。"
  });
}

function sendCommitResult(socket, message, accepted, resultMessage) {
  sendJson(socket, {
    type: "state-commit-result",
    requestId: message.requestId,
    accepted,
    message: resultMessage,
    reason: accepted ? message.reason : "座位状态已被其他用户更新。",
    state: serverState
  });
}

function stampServerRevision(nextState) {
  revisionCounter += 1;
  return {
    ...nextState,
    currentUserId: null,
    realtimeRevision: `server-${Date.now()}-${revisionCounter}`,
    updatedAt: new Date().toISOString()
  };
}

function isValidState(candidate) {
  return Boolean(candidate
    && typeof candidate === "object"
    && !Array.isArray(candidate)
    && candidate.halls
    && typeof candidate.halls === "object"
    && Array.isArray(candidate.orders)
    && Array.isArray(candidate.users));
}

function loadServerState() {
  try {
    if (!fs.existsSync(STATE_FILE)) return null;
    const saved = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return isValidState(saved) ? saved : null;
  } catch (error) {
    console.warn("Could not read persisted SmartCinema state:", error.message);
    return null;
  }
}

function saveServerState() {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(serverState, null, 2), "utf8");
}

function broadcastJson(message) {
  clients.forEach((client) => sendJson(client.socket, message));
}

function sendJson(socket, message) {
  sendFrame(socket, Buffer.from(JSON.stringify(message), "utf8"), 0x1);
}

function sendFrame(socket, payload, opcode) {
  if (socket.destroyed) return;

  let header;
  if (payload.length < 126) {
    header = Buffer.from([0x80 | opcode, payload.length]);
  } else if (payload.length <= 0xffff) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(payload.length, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeUInt32BE(Math.floor(payload.length / 2 ** 32), 2);
    header.writeUInt32BE(payload.length >>> 0, 6);
  }

  socket.write(Buffer.concat([header, payload]));
}
