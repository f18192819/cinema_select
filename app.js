const STORAGE_KEY = "smartCinemaState";
const ACCESSIBILITY_STORAGE_KEY = "smartCinemaAccessibility";
const AUTH_VIEWS = ["login", "register"];
const ORDER_STATUS = {
  reserved: "reserved",
  purchased: "purchased",
  cancelled: "cancelled",
  refunded: "refunded"
};

const hallsConfig = [
  { id: "small", name: "\u5c0f\u5385", rows: 10, seatsPerRow: 10 },
  { id: "medium", name: "\u4e2d\u5385", rows: 10, seatsPerRow: 20 },
  { id: "large", name: "\u5927\u5385", rows: 10, seatsPerRow: 30 }
];

const TICKET_TYPE_CONFIG = {
  individual: {
    label: "\u4e2a\u4eba\u7968",
    fixedCount: 1,
    countLabel: "\u89c2\u4f17\u4eba\u6570"
  },
  couple: {
    label: "\u60c5\u4fa3\u7968",
    fixedCount: 2,
    countLabel: "\u89c2\u4f17\u4eba\u6570"
  },
  family: {
    label: "\u5bb6\u5ead\u7968",
    defaultCount: 3,
    min: 3,
    max: 8,
    countEditable: true,
    countLabel: "\u5bb6\u5ead\u4eba\u6570"
  },
  group: {
    label: "\u56e2\u4f53\u7968",
    defaultCount: 5,
    min: 5,
    max: 20,
    countEditable: true,
    countLabel: "\u56e2\u4f53\u4eba\u6570"
  }
};

const dom = {
  authScreen: document.getElementById("authScreen"),
  appScreen: document.getElementById("appScreen"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  authMessage: document.getElementById("authMessage"),
  authSwitchButtons: [...document.querySelectorAll("[data-auth-view]")],
  heroUserName: document.getElementById("heroUserName"),
  heroUserRole: document.getElementById("heroUserRole"),
  hallTabs: document.getElementById("hallTabs"),
  hallName: document.getElementById("hallName"),
  availableCount: document.getElementById("availableCount"),
  soldCount: document.getElementById("soldCount"),
  selectedCount: document.getElementById("selectedCount"),
  currentUserName: document.getElementById("currentUserName"),
  currentUserRole: document.getElementById("currentUserRole"),
  currentUserStatus: document.getElementById("currentUserStatus"),
  logoutBtn: document.getElementById("logoutBtn"),
  selectionReadout: document.getElementById("selectionReadout"),
  adminNote: document.getElementById("adminNote"),
  ticketTypeSelect: document.getElementById("ticketTypeSelect"),
  memberCountField: document.getElementById("memberCountField"),
  memberCountLabel: document.getElementById("memberCountLabel"),
  memberCountInput: document.getElementById("memberCountInput"),
  memberFields: document.getElementById("memberFields"),
  recommendBtn: document.getElementById("recommendBtn"),
  clearRecommendBtn: document.getElementById("clearRecommendBtn"),
  recommendStatus: document.getElementById("recommendStatus"),
  recommendSummary: document.getElementById("recommendSummary"),
  recommendReasonList: document.getElementById("recommendReasonList"),
  systemScoreValue: document.getElementById("systemScoreValue"),
  systemScoreGrade: document.getElementById("systemScoreGrade"),
  compositeScoreValue: document.getElementById("compositeScoreValue"),
  compositeScoreGrade: document.getElementById("compositeScoreGrade"),
  ratingStars: [...document.querySelectorAll(".rating-star")],
  userRatingText: document.getElementById("userRatingText"),
  scoreStatus: document.getElementById("scoreStatus"),
  experienceReasonList: document.getElementById("experienceReasonList"),
  largeTextToggle: document.getElementById("largeTextToggle"),
  highContrastToggle: document.getElementById("highContrastToggle"),
  colorblindToggle: document.getElementById("colorblindToggle"),
  voiceToggle: document.getElementById("voiceToggle"),
  voicePurchaseDemoBtn: document.getElementById("voicePurchaseDemoBtn"),
  accessibilityStatus: document.getElementById("accessibilityStatus"),
  reserveOrderBtn: document.getElementById("reserveOrderBtn"),
  purchaseOrderBtn: document.getElementById("purchaseOrderBtn"),
  orderStatus: document.getElementById("orderStatus"),
  orderCount: document.getElementById("orderCount"),
  orderList: document.getElementById("orderList"),
  canvas: document.getElementById("seatCanvas")
};

const ctx = dom.canvas.getContext("2d");

let state = loadState();
let selectedHallId = hallsConfig[0].id;
let selectedSeatKeys = [];
let recommendedSeatKeys = [];
let renderedSeats = [];
let dragSelection = createEmptyDragSelection();
let suppressCanvasClick = false;
let recommendationDraft = createDefaultRecommendationDraft("individual");
let recommendationState = createEmptyRecommendationState();
let userSeatRating = 0;
let experienceScoreState = createEmptyExperienceScoreState();
let lastSelectionSignature = "";
let accessibilityState = loadAccessibilityState();

bootstrap();

function bootstrap() {
  renderAuthSwitch("login");
  renderHallTabs();
  initializeRecommendationUI();
  initializeAccessibilityUI();
  bindEvents();
  syncScreenState();
  syncCurrentUserUI();
  renderRecommendationState();
  renderExperienceScoreState();
  renderOrderCenter();
  renderCurrentHall();
}

function bindEvents() {
  dom.authSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => renderAuthSwitch(button.dataset.authView));
  });

  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.canvas.addEventListener("mousedown", handleCanvasPointerDown);
  dom.canvas.addEventListener("mousemove", handleCanvasPointerMove);
  dom.canvas.addEventListener("mouseup", handleCanvasPointerUp);
  dom.canvas.addEventListener("mouseleave", handleCanvasPointerLeave);
  dom.canvas.addEventListener("click", handleCanvasClick);
  dom.ticketTypeSelect.addEventListener("change", handleTicketTypeChange);
  dom.memberCountInput.addEventListener("input", handleMemberCountChange);
  dom.memberFields.addEventListener("input", handleAudienceInfoChange);
  dom.recommendBtn.addEventListener("click", handleRecommendSeats);
  dom.clearRecommendBtn.addEventListener("click", handleClearRecommendation);
  dom.ratingStars.forEach((button) => {
    button.addEventListener("click", () => handleUserRating(Number(button.dataset.rating)));
  });
  dom.largeTextToggle.addEventListener("click", () => handleAccessibilityToggle("largeText"));
  dom.highContrastToggle.addEventListener("click", () => handleAccessibilityToggle("highContrast"));
  dom.colorblindToggle.addEventListener("click", () => handleAccessibilityToggle("colorblindFriendly"));
  dom.voiceToggle.addEventListener("click", () => handleAccessibilityToggle("voicePrompt"));
  dom.voicePurchaseDemoBtn.addEventListener("click", handleVoicePurchaseDemo);
  dom.reserveOrderBtn.addEventListener("click", () => handleCreateOrder(ORDER_STATUS.reserved));
  dom.purchaseOrderBtn.addEventListener("click", () => handleCreateOrder(ORDER_STATUS.purchased));
  dom.orderList.addEventListener("click", handleOrderListAction);
  window.addEventListener("smartcinema:purchase-success", handlePurchaseSuccessAnnouncement);
  window.addEventListener("resize", renderCurrentHall);
}

function initializeRecommendationUI() {
  dom.ticketTypeSelect.value = recommendationDraft.ticketType;
  renderRecommendationForm();
  renderRecommendationState();
}

function initializeAccessibilityUI() {
  applyAccessibilitySettings();
  renderAccessibilityState();
}

function handleAccessibilityToggle(settingKey) {
  accessibilityState = {
    ...accessibilityState,
    [settingKey]: !accessibilityState[settingKey]
  };
  saveAccessibilityState();
  applyAccessibilitySettings();
  renderAccessibilityState();
}

function handleVoicePurchaseDemo() {
  if (!accessibilityState.voicePrompt) {
    dom.accessibilityStatus.textContent = "语音提示当前处于关闭状态，请先开启后再体验购票成功播报。";
    return;
  }

  window.dispatchEvent(new CustomEvent("smartcinema:purchase-success"));
  renderAccessibilityState();
}

function handleCreateOrder(statusCode) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    setOrderStatus("请先登录后再进行预订或购票。", "error");
    return;
  }

  if (!selectedSeatKeys.length) {
    setOrderStatus("请先选择座位，再进行预订或购票。", "error");
    return;
  }

  recommendationDraft = readRecommendationDraftFromDOM();
  const validation = validateRecommendationDraft(recommendationDraft);
  if (!validation.valid) {
    setOrderStatus(validation.message, "error");
    return;
  }

  const hall = state.halls[selectedHallId];
  const selectedSeats = selectedSeatKeys
    .map((seatKey) => findSeatByKey(hall, seatKey))
    .filter(Boolean);

  const orderCheck = validateOrderSelection(hall, validation.draft, selectedSeats);
  if (!orderCheck.valid) {
    setOrderStatus(orderCheck.message, "error");
    return;
  }

  const ticketConfig = TICKET_TYPE_CONFIG[validation.draft.ticketType];
  const seatKeys = selectedSeats.map((seat) => `${seat.row}-${seat.number}`);
  const seatStatus = statusCode === ORDER_STATUS.reserved ? "reserved" : "sold";
  selectedSeats.forEach((seat) => {
    seat.status = seatStatus;
  });

  const order = {
    orderNo: createOrderNumber(),
    userId: currentUser.id,
    username: currentUser.username,
    displayName: currentUser.displayName,
    hallId: hall.id,
    hallName: hall.name,
    ticketType: validation.draft.ticketType,
    ticketTypeLabel: ticketConfig.label,
    seatKeys,
    seats: seatKeys.map(formatSeatLabel),
    totalPeople: validation.draft.members.length,
    members: validation.draft.members.map((member) => ({ ...member })),
    statusCode,
    status: getOrderStatusLabel(statusCode),
    createdAt: new Date().toISOString()
  };

  state.orders.unshift(order);
  saveState();
  selectedSeatKeys = [];
  clearRecommendation({
    keepSelection: false,
    status: "idle",
    message: "订单已创建。如需继续选座，可重新生成推荐或手动选择可用座位。",
    summary: "暂无推荐结果。"
  });
  renderOrderCenter();
  renderCurrentHall();
  setOrderStatus(
    statusCode === ORDER_STATUS.reserved
      ? `预订成功，订单号 ${order.orderNo}，座位已锁定。`
      : `购票成功，订单号 ${order.orderNo}，座位状态已同步更新。`,
    "success"
  );

  if (statusCode === ORDER_STATUS.purchased) {
    window.dispatchEvent(new CustomEvent("smartcinema:purchase-success"));
  } else {
    speakMessage(`预订成功，已为您锁定${order.totalPeople}个座位。`);
  }
}

function validateOrderSelection(hall, draft, selectedSeats) {
  if (selectedSeats.length !== selectedSeatKeys.length || selectedSeats.some((seat) => seat.status !== "available")) {
    return {
      valid: false,
      message: "所选座位中存在已售或已预订座位，请重新选择。"
    };
  }

  if (selectedSeats.length !== draft.members.length) {
    return {
      valid: false,
      message: `当前选择了 ${selectedSeats.length} 个座位，与${TICKET_TYPE_CONFIG[draft.ticketType].label}的 ${draft.members.length} 位观众不一致。`
    };
  }

  const restriction = calculateAudienceRestriction(draft.members, hall.rows);
  if (restriction.hasMinor && selectedSeats.some((seat) => seat.row <= 3)) {
    return {
      valid: false,
      message: "订单中包含未满 15 岁观众，不能选择前三排座位。"
    };
  }

  if (restriction.hasSenior && selectedSeats.some((seat) => seat.row > hall.rows - 3)) {
    return {
      valid: false,
      message: "订单中包含 60 岁以上观众，不能选择最后三排座位。"
    };
  }

  if (draft.ticketType === "group" && !isSameRowConsecutive(selectedSeats)) {
    return {
      valid: false,
      message: "团体票必须选择同一排连续座位，当前座位不符合规则。"
    };
  }

  return { valid: true };
}

function handleOrderListAction(event) {
  const actionButton = event.target.closest("[data-order-action]");
  if (!actionButton) {
    return;
  }

  const action = actionButton.dataset.orderAction;
  const order = state.orders.find((entry) => entry.orderNo === actionButton.dataset.orderNo);
  const currentUser = getCurrentUser();

  if (!order || !currentUser || order.userId !== currentUser.id) {
    setOrderStatus("订单不存在，或当前用户无权操作该订单。", "error");
    return;
  }

  if (action === "cancel" && order.statusCode === ORDER_STATUS.reserved) {
    updateOrderStatus(order, ORDER_STATUS.cancelled);
    setOrderStatus(`已取消预订，订单号 ${order.orderNo} 的座位已释放。`, "success");
    speakMessage("预订已取消，座位已释放。");
    return;
  }

  if (action === "refund" && order.statusCode === ORDER_STATUS.purchased) {
    updateOrderStatus(order, ORDER_STATUS.refunded);
    setOrderStatus(`退票成功，订单号 ${order.orderNo} 的座位已释放。`, "success");
    speakMessage("退票成功，座位已释放。");
  }
}

function updateOrderStatus(order, nextStatusCode) {
  const hall = state.halls[order.hallId];
  const expectedSeatStatus = order.statusCode === ORDER_STATUS.reserved ? "reserved" : "sold";

  if (hall) {
    order.seatKeys.forEach((seatKey) => {
      const seat = findSeatByKey(hall, seatKey);
      if (seat && seat.status === expectedSeatStatus) {
        seat.status = "available";
      }
    });
  }

  order.statusCode = nextStatusCode;
  order.status = getOrderStatusLabel(nextStatusCode);
  order.updatedAt = new Date().toISOString();
  saveState();
  renderOrderCenter();
  renderCurrentHall();
}

function renderOrderCenter() {
  const currentUser = getCurrentUser();
  const orders = currentUser
    ? state.orders.filter((order) => order.userId === currentUser.id)
    : [];

  dom.orderCount.textContent = `${orders.length} 笔`;
  if (!orders.length) {
    dom.orderList.innerHTML = '<p class="order-empty">暂无订单。完成选座后，可在这里预订或直接购票。</p>';
    return;
  }

  dom.orderList.innerHTML = orders
    .map((order) => buildOrderCardMarkup(order))
    .join("");
}

function buildOrderCardMarkup(order) {
  const statusCode = order.statusCode || getOrderStatusCode(order.status);
  const action = statusCode === ORDER_STATUS.reserved
    ? `<button class="ghost-btn" type="button" data-order-action="cancel" data-order-no="${escapeHtml(order.orderNo)}">取消预订</button>`
    : statusCode === ORDER_STATUS.purchased
      ? `<button class="ghost-btn" type="button" data-order-action="refund" data-order-no="${escapeHtml(order.orderNo)}">退票</button>`
      : "";
  const statusLabel = getOrderStatusLabel(statusCode);
  const timeLabel = formatOrderTime(order.createdAt);

  return `
    <article class="order-card">
      <div class="order-card__top">
        <strong class="order-card__number">${escapeHtml(order.orderNo)}</strong>
        <span class="order-status-badge order-status-badge--${escapeHtml(statusCode)}">${escapeHtml(statusLabel)}</span>
      </div>
      <p class="order-card__meta">${escapeHtml(order.hallName)} · ${escapeHtml(order.ticketTypeLabel)} · ${order.totalPeople} 人</p>
      <p class="order-card__seats">${(order.seats || []).map(escapeHtml).join("、")}</p>
      <div class="order-card__footer">
        <time class="order-card__time" datetime="${escapeHtml(order.createdAt)}">${escapeHtml(timeLabel)}</time>
        ${action}
      </div>
    </article>
  `;
}

function setOrderStatus(message, status = "idle") {
  dom.orderStatus.textContent = message;
  dom.orderStatus.className = "score-status order-status";
  if (status !== "idle") {
    dom.orderStatus.classList.add(`is-${status}`);
  }
}

function resetOrderStatus() {
  setOrderStatus("请先填写观众信息并选择座位，然后进行预订或购票。");
}

function createOrderNumber() {
  return `SC${Date.now()}${Math.floor(Math.random() * 900 + 100)}`;
}

function getOrderStatusLabel(statusCode) {
  const labelMap = {
    [ORDER_STATUS.reserved]: "已预订",
    [ORDER_STATUS.purchased]: "已购票",
    [ORDER_STATUS.cancelled]: "已取消",
    [ORDER_STATUS.refunded]: "已退票"
  };
  return labelMap[statusCode] || "未知状态";
}

function getOrderStatusCode(status) {
  const statusMap = {
    "已预订": ORDER_STATUS.reserved,
    "已购票": ORDER_STATUS.purchased,
    "已取消": ORDER_STATUS.cancelled,
    "已退票": ORDER_STATUS.refunded
  };
  return statusMap[status] || "";
}

function formatOrderTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }

  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
}

function handlePurchaseSuccessAnnouncement() {
  speakMessage("购票成功，祝您观影愉快。");
}

function applyAccessibilitySettings() {
  document.body.classList.toggle("mode-large-text", accessibilityState.largeText);
  document.body.classList.toggle("mode-high-contrast", accessibilityState.highContrast);
  document.body.classList.toggle("mode-colorblind", accessibilityState.colorblindFriendly);
}

function renderAccessibilityState() {
  const toggleMap = [
    [dom.largeTextToggle, accessibilityState.largeText],
    [dom.highContrastToggle, accessibilityState.highContrast],
    [dom.colorblindToggle, accessibilityState.colorblindFriendly],
    [dom.voiceToggle, accessibilityState.voicePrompt]
  ];

  toggleMap.forEach(([button, enabled]) => {
    button.classList.toggle("is-active", enabled);
    button.setAttribute("aria-pressed", String(enabled));
  });

  const activeModes = [];
  if (accessibilityState.largeText) {
    activeModes.push("大字体");
  }
  if (accessibilityState.highContrast) {
    activeModes.push("高对比度");
  }
  if (accessibilityState.colorblindFriendly) {
    activeModes.push("色盲友好");
  }

  const voiceLabel = accessibilityState.voicePrompt ? "已开启" : "未开启";
  const voiceSupport = "speechSynthesis" in window
    ? "当前浏览器支持语音播报。"
    : "当前浏览器不支持语音播报。";

  dom.accessibilityStatus.textContent = activeModes.length
    ? `当前已启用：${activeModes.join("、")}。语音提示${voiceLabel}。${voiceSupport}`
    : `当前已关闭所有无障碍增强模式。语音提示${voiceLabel}。${voiceSupport}`;

  if (!dom.appScreen.hidden) {
    renderCurrentHall();
  }
}

function speakMessage(message) {
  if (!accessibilityState.voicePrompt || !message || !("speechSynthesis" in window)) {
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "zh-CN";
  utterance.rate = 1;
  utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}

function renderAuthSwitch(activeView, options = {}) {
  const { clearMessage = true } = options;

  AUTH_VIEWS.forEach((view) => {
    const button = dom.authSwitchButtons.find((entry) => entry.dataset.authView === view);
    const form = view === "login" ? dom.loginForm : dom.registerForm;
    const isActive = view === activeView;

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
    form.classList.toggle("is-active", isActive);
  });

  if (clearMessage) {
    setAuthMessage("", "");
  }
}

function handleLogin(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const user = state.users.find(
    (entry) => entry.username === username && entry.password === password
  );

  if (!user) {
    setAuthMessage("用户名或密码错误，请重试。", "error");
    return;
  }

  state.currentUserId = user.id;
  saveState();
  selectedSeatKeys = [];
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  setAuthMessage("", "");
  event.currentTarget.reset();
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (username.length < 3 || username.length > 16) {
    setAuthMessage("用户名长度需在 3 到 16 位之间。", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("密码至少需要 6 位。", "error");
    return;
  }

  if (state.users.some((entry) => entry.username === username)) {
    setAuthMessage("该用户名已存在，请更换后重试。", "error");
    return;
  }

  const user = {
    id: `user_${Date.now()}`,
    username,
    displayName,
    password,
    role: "member",
    createdAt: new Date().toISOString()
  };

  state.users.push(user);
  state.currentUserId = user.id;
  saveState();
  selectedSeatKeys = [];
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  setAuthMessage("", "");
  event.currentTarget.reset();
}

function handleLogout() {
  state.currentUserId = null;
  saveState();
  selectedSeatKeys = [];
  renderAuthSwitch("login");
  recommendationDraft = createDefaultRecommendationDraft("individual");
  clearRecommendation({
    keepSelection: false,
    status: "idle",
    message: "选择票型并填写观众信息后，系统会在当前影厅自动推荐符合规则的空座。",
    summary: "暂无推荐结果。"
  });
  renderRecommendationForm();
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  dom.loginForm.reset();
  dom.registerForm.reset();
}

function renderHallTabs() {
  dom.hallTabs.innerHTML = "";

  hallsConfig.forEach((hall) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hall-tab${hall.id === selectedHallId ? " is-active" : ""}`;
    button.innerHTML = `${hall.name}<small>${hall.rows} 排 / 每排 ${hall.seatsPerRow} 座</small>`;
    button.addEventListener("click", () => {
      selectedHallId = hall.id;
      selectedSeatKeys = [];
      clearRecommendation({
        keepSelection: false,
        status: "idle",
        message: `已切换到${hall.name}，请重新生成推荐座位。`,
        summary: "暂无推荐结果。"
      });
      renderHallTabs();
      renderCurrentHall();
    });
    dom.hallTabs.appendChild(button);
  });
}

function renderCurrentHall() {
  const hall = state.halls[selectedHallId];
  const currentUser = getCurrentUser();
  const seats = hall.seats;
  const soldCount = seats.filter((seat) => seat.status === "sold").length;
  const availableCount = seats.filter((seat) => seat.status === "available").length;
  const selectionSignature = `${selectedHallId}:${[...selectedSeatKeys].sort().join("|")}`;

  if (selectionSignature !== lastSelectionSignature) {
    userSeatRating = 0;
    lastSelectionSignature = selectionSignature;
  }

  dom.hallName.textContent = hall.name;
  dom.availableCount.textContent = String(availableCount);
  dom.soldCount.textContent = String(soldCount);
  dom.selectedCount.textContent = String(selectedSeatKeys.length);
  dom.selectionReadout.textContent = buildSelectionSummary();
  dom.adminNote.hidden = !(currentUser && currentUser.role === "admin");
  updateExperienceScore(hall);
  renderSeatCanvas(hall, Boolean(currentUser));
}

function buildSelectionSummary() {
  if (!selectedSeatKeys.length) {
    return recommendedSeatKeys.length
      ? "系统已生成推荐座位，青色外环表示推荐结果，金色外环表示手动修改。可点击或拖拽框选继续调整。"
      : "尚未选择座位。点击可单选，按住 Ctrl 再点击可多选，也可在画布上拖拽框选。";
  }

  const seatText = selectedSeatKeys.map(formatSeatLabel).join("、");
  return recommendedSeatKeys.length
    ? `当前已选 ${selectedSeatKeys.length} 个座位：${seatText}。青色外环为系统推荐，金色外环为手动调整。`
    : `已选中 ${selectedSeatKeys.length} 个座位：${seatText}。可继续点击或拖拽框选修改。`;
}

function syncScreenState() {
  const isLoggedIn = Boolean(getCurrentUser());
  dom.authScreen.hidden = isLoggedIn;
  dom.appScreen.hidden = !isLoggedIn;
}

function getSeatPalette() {
  const styles = getComputedStyle(document.body);
  return {
    textMain: styles.getPropertyValue("--text-main").trim() || "#edf7ff",
    textSoft: styles.getPropertyValue("--text-soft").trim() || "rgba(237, 247, 255, 0.72)",
    accentStrong: styles.getPropertyValue("--accent-strong").trim() || "#00f0ff",
    seatAvailable: styles.getPropertyValue("--seat-available").trim() || "#2ddf88",
    seatSelected: styles.getPropertyValue("--seat-selected").trim() || "#f7c64c",
    seatSold: styles.getPropertyValue("--seat-sold").trim() || "#ff5f6d",
    seatReserved: styles.getPropertyValue("--seat-reserved").trim() || "#a98bff",
    seatRecommendedRing: styles.getPropertyValue("--seat-recommended-ring").trim() || "#00f0ff",
    seatManualRing: styles.getPropertyValue("--seat-manual-ring").trim() || "#ffd66b",
    selectionFill: styles.getPropertyValue("--selection-fill").trim() || "rgba(84, 210, 255, 0.12)",
    selectionStroke: styles.getPropertyValue("--selection-stroke").trim() || "rgba(84, 210, 255, 0.92)"
  };
}

function renderSeatCanvas(hall, isLoggedIn) {
  const canvas = dom.canvas;
  const containerWidth = canvas.parentElement.clientWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const logicalWidth = Math.max(320, Math.min(1240, containerWidth));
  const logicalHeight = 760;

  canvas.width = logicalWidth * pixelRatio;
  canvas.height = logicalHeight * pixelRatio;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const palette = getSeatPalette();
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  drawCanvasChrome(logicalWidth, logicalHeight, hall, isLoggedIn, palette);
  renderedSeats = drawSeats(hall, logicalWidth, isLoggedIn, palette);
  drawDragSelectionOverlay(palette);
}

function drawCanvasChrome(width, height, hall, isLoggedIn, palette) {
  const fontScale = accessibilityState.largeText ? 1.25 : 1;
  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.fillRect(0, 0, width, height);

  const screenWidth = width * 0.58;
  const screenX = (width - screenWidth) / 2;
  const screenY = 62;

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(width / 2, screenY + 10, screenWidth / 2, 44, 0, Math.PI, 0, true);
  ctx.strokeStyle = palette.accentStrong;
  ctx.lineWidth = 3;
  ctx.shadowColor = palette.accentStrong;
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = "rgba(84, 210, 255, 0.18)";
  ctx.fillRect(screenX, screenY + 10, screenWidth, 10);

  ctx.font = `700 ${16 * fontScale}px Orbitron, sans-serif`;
  ctx.fillStyle = palette.textMain;
  ctx.textAlign = "center";
  ctx.fillText(`${hall.name} / ${hall.seats.length} SEATS`, width / 2, 42);

  ctx.font = `${14 * fontScale}px 'Noto Sans SC', sans-serif`;
  ctx.fillStyle = palette.textSoft;
  ctx.fillText(
    isLoggedIn ? "已登录，可点击座位进行选择" : "请先登录后再进行选座",
    width / 2,
    height - 26
  );
}

function drawSeats(hall, width, isLoggedIn, palette) {
  const fontScale = accessibilityState.largeText ? 1.25 : 1;
  const marginX = width < 480 ? 26 : 74;
  const startY = 170;
  const rowGap = width < 480 ? 46 : 48;
  const curveStrength = width < 480 ? 18 : 24;
  const rows = hall.rows;
  const seatsPerRow = hall.seatsPerRow;
  const maxSeatWidth = width - marginX * 2;
  const seatGap = maxSeatWidth / Math.max(seatsPerRow - 1, 1);
  const seatRadius = Math.max(4, Math.min(12, seatGap * 0.3));
  const labelEnabled = seatsPerRow <= 20 && seatRadius >= 7;
  const seats = [];

  for (let row = 1; row <= rows; row += 1) {
    const rowBaseY = startY + (row - 1) * rowGap;

    ctx.font = `${12 * fontScale}px Orbitron, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(157, 182, 208, 0.86)";
    ctx.fillText(`R${String(row).padStart(2, "0")}`, 12, rowBaseY + 4);

    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber += 1) {
      const index = seatNumber - 1;
      const normalized = seatsPerRow === 1 ? 0 : index / (seatsPerRow - 1) - 0.5;
      const x = marginX + index * seatGap;
      const y = rowBaseY + curveStrength * Math.pow(normalized * 2, 2);
      const seatData = hall.seats[(row - 1) * seatsPerRow + index];
      const seatKey = `${seatData.row}-${seatData.number}`;
      const isSelected = selectedSeatKeys.includes(seatKey);
      const isRecommended = recommendedSeatKeys.includes(seatKey);
      const isManualSelected = isSelected && !isRecommended;
      const fillColor = seatData.status === "sold"
        ? palette.seatSold
        : seatData.status === "reserved"
          ? palette.seatReserved
          : isSelected
            ? palette.seatSelected
            : palette.seatAvailable;

      ctx.save();
      ctx.beginPath();
      ctx.arc(x, y, seatRadius, 0, Math.PI * 2);
      ctx.fillStyle = fillColor;
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.lineWidth = isLoggedIn ? 1.5 : 1;
      ctx.strokeStyle = isLoggedIn ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.28)";
      ctx.stroke();
      ctx.restore();

      if (isRecommended) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, seatRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = palette.seatRecommendedRing;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = palette.seatRecommendedRing;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      if (isManualSelected) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, seatRadius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = palette.seatManualRing;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = palette.seatManualRing;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      if (labelEnabled) {
        ctx.font = `${10 * fontScale}px 'Noto Sans SC', sans-serif`;
        ctx.fillStyle = "#03111f";
        ctx.textAlign = "center";
        ctx.fillText(String(seatNumber), x, y + 3.5);
      }

      seats.push({
        key: seatKey,
        status: seatData.status,
        x,
        y,
        radius: seatRadius
      });
    }
  }

  return seats;
}

function handleCanvasClick(event) {
  if (suppressCanvasClick) {
    suppressCanvasClick = false;
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    setAuthMessage("请先登录后再进行选座。", "error");
    return;
  }

  const rect = dom.canvas.getBoundingClientRect();
  const logicalWidth = parseFloat(dom.canvas.style.width);
  const logicalHeight = parseFloat(dom.canvas.style.height);
  const pointerX = ((event.clientX - rect.left) / rect.width) * logicalWidth;
  const pointerY = ((event.clientY - rect.top) / rect.height) * logicalHeight;

  const hitSeat = renderedSeats.find((seat) => {
    const distance = Math.hypot(pointerX - seat.x, pointerY - seat.y);
    return distance <= seat.radius + 4;
  });

  if (!hitSeat || hitSeat.status !== "available") {
    return;
  }

  const previousSelection = [...selectedSeatKeys];
  if (event.ctrlKey || event.metaKey) {
    toggleSeatSelection(hitSeat.key);
  } else {
    selectedSeatKeys = selectedSeatKeys.includes(hitSeat.key) ? [] : [hitSeat.key];
  }

  renderCurrentHall();
  if (hasSeatSelectionChanged(previousSelection, selectedSeatKeys)) {
    announceSeatSelectionChange();
  }
}

function handleCanvasPointerDown(event) {
  if (!getCurrentUser()) {
    return;
  }

  const point = getCanvasPoint(event);
  dragSelection = {
    active: true,
    dragging: false,
    additive: event.ctrlKey || event.metaKey,
    startX: point.x,
    startY: point.y,
    currentX: point.x,
    currentY: point.y
  };
}

function handleCanvasPointerMove(event) {
  if (!dragSelection.active) {
    return;
  }

  const point = getCanvasPoint(event);
  dragSelection.currentX = point.x;
  dragSelection.currentY = point.y;

  const width = Math.abs(dragSelection.currentX - dragSelection.startX);
  const height = Math.abs(dragSelection.currentY - dragSelection.startY);
  dragSelection.dragging = width > 8 || height > 8;

  if (dragSelection.dragging) {
    renderCurrentHall();
  }
}

function handleCanvasPointerUp() {
  if (!dragSelection.active) {
    return;
  }

  let selectionChanged = false;
  if (dragSelection.dragging) {
    selectionChanged = applyDragSelection();
    suppressCanvasClick = true;
  }

  dragSelection = createEmptyDragSelection();
  renderCurrentHall();
  if (selectionChanged) {
    announceSeatSelectionChange();
  }
}

function handleCanvasPointerLeave() {
  if (!dragSelection.active) {
    return;
  }

  if (!dragSelection.dragging) {
    dragSelection = createEmptyDragSelection();
    return;
  }

  const selectionChanged = applyDragSelection();
  dragSelection = createEmptyDragSelection();
  suppressCanvasClick = true;
  renderCurrentHall();
  if (selectionChanged) {
    announceSeatSelectionChange();
  }
}

function applyDragSelection() {
  const previousSelection = [...selectedSeatKeys];
  const rect = getNormalizedDragRect();
  if (!rect) {
    return false;
  }

  const seatsInBox = renderedSeats
    .filter((seat) => seat.status === "available")
    .filter((seat) => (
      seat.x >= rect.left &&
      seat.x <= rect.right &&
      seat.y >= rect.top &&
      seat.y <= rect.bottom
    ))
    .map((seat) => seat.key);

  if (!seatsInBox.length) {
    if (!dragSelection.additive) {
      selectedSeatKeys = [];
    }
    return hasSeatSelectionChanged(previousSelection, selectedSeatKeys);
  }

  if (dragSelection.additive) {
    const merged = new Set(selectedSeatKeys);
    seatsInBox.forEach((seatKey) => merged.add(seatKey));
    selectedSeatKeys = [...merged];
    return hasSeatSelectionChanged(previousSelection, selectedSeatKeys);
  }

  selectedSeatKeys = seatsInBox;
  return hasSeatSelectionChanged(previousSelection, selectedSeatKeys);
}

function drawDragSelectionOverlay(palette) {
  if (!dragSelection.active || !dragSelection.dragging) {
    return;
  }

  const rect = getNormalizedDragRect();
  if (!rect) {
    return;
  }

  ctx.save();
  ctx.fillStyle = palette.selectionFill;
  ctx.strokeStyle = palette.selectionStroke;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 6]);
  ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
  ctx.strokeRect(rect.left, rect.top, rect.width, rect.height);
  ctx.restore();
}

function getNormalizedDragRect() {
  const width = dragSelection.currentX - dragSelection.startX;
  const height = dragSelection.currentY - dragSelection.startY;

  if (Math.abs(width) <= 8 && Math.abs(height) <= 8) {
    return null;
  }

  const left = Math.min(dragSelection.startX, dragSelection.currentX);
  const top = Math.min(dragSelection.startY, dragSelection.currentY);
  const right = Math.max(dragSelection.startX, dragSelection.currentX);
  const bottom = Math.max(dragSelection.startY, dragSelection.currentY);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top
  };
}

function getCanvasPoint(event) {
  const rect = dom.canvas.getBoundingClientRect();
  const logicalWidth = parseFloat(dom.canvas.style.width);
  const logicalHeight = parseFloat(dom.canvas.style.height);

  return {
    x: ((event.clientX - rect.left) / rect.width) * logicalWidth,
    y: ((event.clientY - rect.top) / rect.height) * logicalHeight
  };
}

function toggleSeatSelection(seatKey) {
  if (selectedSeatKeys.includes(seatKey)) {
    selectedSeatKeys = selectedSeatKeys.filter((entry) => entry !== seatKey);
    return;
  }

  selectedSeatKeys = [...selectedSeatKeys, seatKey];
}

function hasSeatSelectionChanged(previousSelection, nextSelection) {
  if (previousSelection.length !== nextSelection.length) {
    return true;
  }

  const previousSignature = [...previousSelection].sort().join("|");
  const nextSignature = [...nextSelection].sort().join("|");
  return previousSignature !== nextSignature;
}

function announceSeatSelectionChange() {
  if (!selectedSeatKeys.length) {
    speakMessage("已取消当前选座。");
    return;
  }

  const labels = selectedSeatKeys.slice(0, 4).map(formatSeatLabel).join("，");
  const moreText = selectedSeatKeys.length > 4 ? `，共${selectedSeatKeys.length}个座位` : "";
  speakMessage(`当前已选择${selectedSeatKeys.length}个座位：${labels}${moreText}。`);
}

function handleTicketTypeChange() {
  const currentDraft = readRecommendationDraftFromDOM();
  const nextType = dom.ticketTypeSelect.value;
  const config = TICKET_TYPE_CONFIG[nextType];

  recommendationDraft = normalizeRecommendationDraft({
    ticketType: nextType,
    memberCount: config.fixedCount || config.defaultCount,
    members: currentDraft.members
  });

  clearRecommendation({
    keepSelection: true,
    status: "idle",
    message: "票型已切换，请补充观众信息后重新生成推荐。",
    summary: "暂无推荐结果。"
  });
  renderRecommendationForm();
  renderCurrentHall();
}

function handleMemberCountChange() {
  const currentDraft = readRecommendationDraftFromDOM();
  recommendationDraft = normalizeRecommendationDraft({
    ...currentDraft,
    memberCount: Number(dom.memberCountInput.value)
  });
  clearRecommendation({
    keepSelection: true,
    status: "idle",
    message: "人数已更新，请重新生成推荐。",
    summary: "暂无推荐结果。"
  });
  renderRecommendationForm();
  renderCurrentHall();
}

function handleAudienceInfoChange() {
  recommendationDraft = readRecommendationDraftFromDOM();
  renderCurrentHall();
}

function handleRecommendSeats() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    setAuthMessage("请先登录后再进行选座。", "error");
    return;
  }

  recommendationDraft = readRecommendationDraftFromDOM();
  const validation = validateRecommendationDraft(recommendationDraft);

  if (!validation.valid) {
    recommendationState = {
      status: "error",
      message: validation.message,
      summary: "未生成推荐结果。",
      reasons: []
    };
    recommendedSeatKeys = [];
    renderRecommendationState();
    renderCurrentHall();
    return;
  }

  const result = recommendSeatsForHall(state.halls[selectedHallId], validation.draft);

  if (!result.success) {
    recommendationState = {
      status: "error",
      message: result.message,
      summary: "当前没有找到符合条件的推荐座位。",
      reasons: result.reasons
    };
    recommendedSeatKeys = [];
    renderRecommendationState();
    renderCurrentHall();
    return;
  }

  recommendedSeatKeys = [...result.seatKeys];
  selectedSeatKeys = [...result.seatKeys];
  recommendationState = {
    status: "success",
    message: result.message,
    summary: result.summary,
    reasons: result.reasons
  };
  renderRecommendationState();
  renderCurrentHall();
  speakMessage(`推荐成功，已为当前观众安排${result.seatKeys.length}个座位。`);
}

function handleClearRecommendation() {
  clearRecommendation({
    keepSelection: true,
    status: "idle",
    message: "已清空推荐结果，可重新生成推荐或继续手动选座。",
    summary: "暂无推荐结果。"
  });
  renderCurrentHall();
}

function handleUserRating(rating) {
  userSeatRating = userSeatRating === rating ? 0 : rating;
  updateExperienceScore(state.halls[selectedHallId]);
}

function createDefaultRecommendationDraft(ticketType) {
  const config = TICKET_TYPE_CONFIG[ticketType];
  const memberCount = config.fixedCount || config.defaultCount;

  return {
    ticketType,
    memberCount,
    members: Array.from({ length: memberCount }, () => ({ name: "", age: "" }))
  };
}

function normalizeRecommendationDraft(draft) {
  const config = TICKET_TYPE_CONFIG[draft.ticketType];
  const min = config.fixedCount || config.min || config.defaultCount;
  const max = config.fixedCount || config.max || config.defaultCount;
  const memberCount = clamp(Number(draft.memberCount) || min, min, max);

  return {
    ticketType: draft.ticketType,
    memberCount,
    members: Array.from({ length: memberCount }, (_, index) => {
      const currentMember = draft.members?.[index] || {};
      return {
        name: String(currentMember.name || ""),
        age: String(currentMember.age || "")
      };
    })
  };
}

function renderRecommendationForm() {
  recommendationDraft = normalizeRecommendationDraft(recommendationDraft);
  const config = TICKET_TYPE_CONFIG[recommendationDraft.ticketType];
  const hasEditableCount = Boolean(config.countEditable);

  dom.ticketTypeSelect.value = recommendationDraft.ticketType;
  dom.memberCountField.hidden = !hasEditableCount;

  if (hasEditableCount) {
    dom.memberCountLabel.textContent = config.countLabel;
    dom.memberCountInput.min = String(config.min);
    dom.memberCountInput.max = String(config.max);
    dom.memberCountInput.value = String(recommendationDraft.memberCount);
  }

  dom.memberFields.innerHTML = recommendationDraft.members
    .map((member, index) => buildMemberFieldMarkup(recommendationDraft.ticketType, member, index))
    .join("");
}

function buildMemberFieldMarkup(ticketType, member, index) {
  const memberLabel = getMemberLabel(ticketType, index);
  const namePlaceholder = `${memberLabel}姓名`;
  const agePlaceholder = `${memberLabel}年龄`;

  return `
    <label class="field">
      <span>${memberLabel}姓名</span>
      <input
        type="text"
        value="${escapeHtml(member.name)}"
        placeholder="${namePlaceholder}"
        data-member-name="${index}"
      />
    </label>
    <label class="field">
      <span>${memberLabel}年龄</span>
      <input
        type="number"
        min="1"
        max="120"
        step="1"
        value="${escapeHtml(member.age)}"
        placeholder="${agePlaceholder}"
        data-member-age="${index}"
      />
    </label>
  `;
}

function getMemberLabel(ticketType, index) {
  if (ticketType === "individual") {
    return "\u89c2\u4f17";
  }

  if (ticketType === "couple") {
    return index === 0 ? "\u89c2\u4f17A" : "\u89c2\u4f17B";
  }

  return `\u6210\u5458${index + 1}`;
}

function readRecommendationDraftFromDOM() {
  const ticketType = dom.ticketTypeSelect.value;
  const config = TICKET_TYPE_CONFIG[ticketType];
  const memberCount = config.fixedCount || Number(dom.memberCountInput.value) || config.defaultCount;
  const members = Array.from({ length: memberCount }, (_, index) => {
    const nameInput = dom.memberFields.querySelector(`[data-member-name="${index}"]`);
    const ageInput = dom.memberFields.querySelector(`[data-member-age="${index}"]`);

    return {
      name: nameInput ? nameInput.value.trim() : "",
      age: ageInput ? ageInput.value.trim() : ""
    };
  });

  return normalizeRecommendationDraft({
    ticketType,
    memberCount,
    members
  });
}

function createEmptyRecommendationState() {
  return {
    status: "idle",
    message: "选择票型并填写观众信息后，系统会在当前影厅自动推荐符合规则的空座。",
    summary: "暂无推荐结果。",
    reasons: []
  };
}

function clearRecommendation(options = {}) {
  const {
    keepSelection = true,
    status = "idle",
    message = "选择票型并填写观众信息后，系统会在当前影厅自动推荐符合规则的空座。",
    summary = "暂无推荐结果。",
    reasons = []
  } = options;

  recommendedSeatKeys = [];
  recommendationState = { status, message, summary, reasons };

  if (!keepSelection) {
    selectedSeatKeys = [];
  }

  renderRecommendationState();
}

function createEmptyExperienceScoreState() {
  return {
    score: null,
    grade: "待评估",
    compositeScore: null,
    compositeGrade: "待评估",
    status: "idle",
    message: "选择座位后，系统会根据距离、视角、周围空位和规则匹配情况自动计算观影体验评分。",
    reasons: []
  };
}

function updateExperienceScore(hall) {
  if (!selectedSeatKeys.length) {
    experienceScoreState = createEmptyExperienceScoreState();
    renderExperienceScoreState();
    return;
  }

  const selectedSeats = selectedSeatKeys
    .map((seatKey) => findSeatByKey(hall, seatKey))
    .filter(Boolean);

  if (!selectedSeats.length) {
    experienceScoreState = createEmptyExperienceScoreState();
    renderExperienceScoreState();
    return;
  }

  const audienceContext = getAudienceContextForScoring();
  const systemScore = calculateSystemExperienceScore(hall, selectedSeats, audienceContext);
  const compositeScore = calculateCompositeScore(systemScore.totalScore, userSeatRating);

  experienceScoreState = {
    score: systemScore.totalScore,
    grade: getExperienceGrade(systemScore.totalScore),
    compositeScore,
    compositeGrade: getExperienceGrade(compositeScore),
    status: systemScore.status,
    message: systemScore.message,
    reasons: systemScore.reasons
  };

  renderExperienceScoreState();
}

function renderExperienceScoreState() {
  dom.systemScoreValue.textContent = experienceScoreState.score == null
    ? "-- / 100"
    : `${experienceScoreState.score} / 100`;
  dom.systemScoreGrade.textContent = experienceScoreState.grade;
  dom.compositeScoreValue.textContent = experienceScoreState.compositeScore == null
    ? "-- / 100"
    : `${experienceScoreState.compositeScore} / 100`;
  dom.compositeScoreGrade.textContent = experienceScoreState.compositeGrade;
  dom.scoreStatus.textContent = experienceScoreState.message;
  dom.scoreStatus.className = "score-status";

  if (experienceScoreState.status === "success") {
    dom.scoreStatus.classList.add("is-success");
  }

  if (experienceScoreState.status === "warning") {
    dom.scoreStatus.classList.add("is-warning");
  }

  dom.experienceReasonList.innerHTML = experienceScoreState.reasons
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join("");

  renderUserRatingState();
}

function renderUserRatingState() {
  dom.ratingStars.forEach((button) => {
    const rating = Number(button.dataset.rating);
    button.classList.toggle("is-active", rating <= userSeatRating);
  });

  if (!selectedSeatKeys.length) {
    dom.userRatingText.textContent = "请先选择座位，再进行观众手动评分。";
    return;
  }

  dom.userRatingText.textContent = userSeatRating
    ? `观众手动评分：${userSeatRating} / 5 星，系统评分与用户评分已综合计算。`
    : "尚未评分，综合结果暂以系统评分为主。";
}

function getAudienceContextForScoring() {
  const draft = readRecommendationDraftFromDOM();
  const validation = validateRecommendationDraft(draft);

  if (validation.valid) {
    return {
      valid: true,
      draft: validation.draft
    };
  }

  return {
    valid: false,
    message: validation.message
  };
}

function calculateSystemExperienceScore(hall, selectedSeats, audienceContext) {
  const distance = calculateDistanceMetric(hall, selectedSeats);
  const horizontal = calculateHorizontalMetric(hall, selectedSeats);
  const surrounding = calculateSurroundingMetric(hall, selectedSeats);
  const ruleMatch = calculateRuleMatchMetric(hall, selectedSeats, audienceContext);
  const totalScore = clamp(
    Math.round(distance.score + horizontal.score + surrounding.score + ruleMatch.score),
    0,
    100
  );

  return {
    totalScore,
    status: ruleMatch.status,
    message: buildScoreMessage(totalScore, audienceContext, userSeatRating),
    reasons: [
      distance.reason,
      horizontal.reason,
      surrounding.reason,
      ruleMatch.reason,
      userSeatRating
        ? `综合结果已纳入观众手动评分 ${userSeatRating} / 5 星。`
        : "当前尚未提供手动评分，综合结果暂以系统评分为主。"
    ]
  };
}

function calculateDistanceMetric(hall, selectedSeats) {
  const idealRow = Math.round(hall.rows * 0.6);
  const averageRow = selectedSeats.reduce((sum, seat) => sum + seat.row, 0) / selectedSeats.length;
  const maxDiff = Math.max(idealRow - 1, hall.rows - idealRow, 1);
  const diff = Math.abs(averageRow - idealRow);
  const score = clamp(Math.round(35 * (1 - diff / maxDiff)), 0, 35);

  let reason = "与银幕距离适中，对大多数观众来说观影舒适。";
  if (averageRow <= hall.rows * 0.35) {
    reason = "当前座位整体偏前，临场感较强，但长时间观影会更累。";
  } else if (averageRow >= hall.rows * 0.8) {
    reason = "当前座位整体偏后，视野完整，但沉浸感略弱。";
  }

  return { score, reason };
}

function calculateHorizontalMetric(hall, selectedSeats) {
  const hallCenter = (hall.seatsPerRow + 1) / 2;
  const averageCenterDistance = selectedSeats.reduce((sum, seat) => {
    return sum + Math.abs(seat.number - hallCenter);
  }, 0) / selectedSeats.length;
  const maxCenterDistance = Math.max((hall.seatsPerRow - 1) / 2, 1);
  const score = clamp(Math.round(25 * (1 - averageCenterDistance / maxCenterDistance)), 0, 25);

  let reason = "横向位置接近影厅中心区，视角较为居中。";
  if (averageCenterDistance > hall.seatsPerRow * 0.22) {
    reason = "横向位置偏侧，观看时左右视角会略有倾斜。";
  } else if (averageCenterDistance > hall.seatsPerRow * 0.12) {
    reason = "横向位置较为均衡，中心感良好。";
  }

  return { score, reason };
}

function calculateSurroundingMetric(hall, selectedSeats) {
  const seatMap = new Map(hall.seats.map((seat) => [`${seat.row}-${seat.number}`, seat]));
  const selectedSet = new Set(selectedSeatKeys);
  let availableNeighborCount = 0;
  let totalNeighborCount = 0;

  selectedSeats.forEach((seat) => {
    const neighborOffsets = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];

    neighborOffsets.forEach(([rowOffset, seatOffset]) => {
      const neighborKey = `${seat.row + rowOffset}-${seat.number + seatOffset}`;
      const neighborSeat = seatMap.get(neighborKey);
      if (!neighborSeat) {
        return;
      }

      totalNeighborCount += 1;
      if (neighborSeat.status === "available" && !selectedSet.has(neighborKey)) {
        availableNeighborCount += 1;
      }
    });
  });

  const ratio = totalNeighborCount ? availableNeighborCount / totalNeighborCount : 0.5;
  const score = clamp(Math.round(ratio * 20), 0, 20);

  let reason = "周围空位较多，观影时更宽松舒适。";
  if (ratio < 0.3) {
    reason = "周边空位较少，拥挤感会更明显。";
  } else if (ratio < 0.55) {
    reason = "周边空位情况一般，舒适度中等。";
  }

  return { score, reason };
}

function calculateRuleMatchMetric(hall, selectedSeats, audienceContext) {
  if (!audienceContext.valid) {
    return {
      score: 12,
      status: "warning",
      reason: `观众信息未填写完整，年龄与票型规则先按普通成人场景估算。${audienceContext.message}`
    };
  }

  const draft = audienceContext.draft;
  const restriction = calculateAudienceRestriction(draft.members, hall.rows);
  const issues = [];
  let score = 20;

  if (selectedSeats.length !== draft.members.length) {
    issues.push("当前选座数量与票型人数不一致。");
    score -= 8;
  }

  if (restriction.hasMinor && selectedSeats.some((seat) => seat.row <= 3)) {
    issues.push("当前选择中包含未满 15 岁观众，但座位落在前 3 排。");
    score -= 8;
  }

  if (restriction.hasSenior && selectedSeats.some((seat) => seat.row > hall.rows - 3)) {
    issues.push("当前选择中包含 60 岁以上观众，但座位落在最后 3 排。");
    score -= 8;
  }

  const arrangementCheck = evaluateTicketArrangement(draft.ticketType, selectedSeats);
  score -= arrangementCheck.penalty;
  issues.push(...arrangementCheck.issues);

  if (!issues.length) {
    return {
      score,
      status: "success",
      reason: "当前选座符合年龄限制与票型规则。"
    };
  }

  return {
    score: clamp(score, 0, 20),
    status: "warning",
    reason: issues.join("")
  };
}

function evaluateTicketArrangement(ticketType, selectedSeats) {
  const sortedSeats = [...selectedSeats].sort((left, right) => {
    if (left.row !== right.row) {
      return left.row - right.row;
    }
    return left.number - right.number;
  });

  const issues = [];
  let penalty = 0;

  if (ticketType === "individual") {
    if (sortedSeats.length !== 1) {
      issues.push("个人票应对应 1 个座位。");
      penalty += 10;
    }
    return { issues, penalty };
  }

  if (ticketType === "couple") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("情侣票更适合连续双座，当前选座未保持同排连续。");
      penalty += 10;
    }
    return { issues, penalty };
  }

  if (ticketType === "family") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("家庭票优先连续就坐，当前选座连续性一般。");
      penalty += 5;
    }

    const averageRow = sortedSeats.reduce((sum, seat) => sum + seat.row, 0) / sortedSeats.length;
    if (averageRow < 5) {
      issues.push("家庭票更适合中后排，当前排位略靠前。");
      penalty += 3;
    }

    return { issues, penalty };
  }

  if (ticketType === "group") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("团体票要求同排连续，当前选座不满足整组连续。");
      penalty += 12;
    }
  }

  return { issues, penalty };
}

function isSameRowConsecutive(seats) {
  if (!seats.length) {
    return false;
  }

  const baseRow = seats[0].row;
  return seats.every((seat, index) => {
    if (seat.row !== baseRow) {
      return false;
    }

    if (index === 0) {
      return true;
    }

    return seat.number === seats[index - 1].number + 1;
  });
}

function calculateCompositeScore(systemScore, userRating) {
  if (!userRating) {
    return systemScore;
  }

  const userScore = userRating * 20;
  return clamp(Math.round(systemScore * 0.7 + userScore * 0.3), 0, 100);
}

function getExperienceGrade(score) {
  if (score == null) {
    return "待评估";
  }

  if (score >= 90) {
    return "极佳";
  }

  if (score >= 75) {
    return "优秀";
  }

  return "一般";
}

function buildScoreMessage(score, audienceContext, userRating) {
  const grade = getExperienceGrade(score);
  if (!audienceContext.valid) {
    return `系统评分 ${score} / 100，等级为${grade}。由于观众信息不完整，年龄与票型规则按普通成人场景估算。`;
  }

  if (userRating) {
    return `系统评分 ${score} / 100，等级为${grade}。已结合观众 ${userRating} 星手动评分生成综合结果。`;
  }

  return `系统评分 ${score} / 100，等级为${grade}。你还可以补充 1-5 星手动评分，查看综合结果。`;
}

function findSeatByKey(hall, seatKey) {
  const [row, number] = seatKey.split("-").map(Number);
  return hall.seats.find((seat) => seat.row === row && seat.number === number) || null;
}

function createEmptyDragSelection() {
  return {
    active: false,
    dragging: false,
    additive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0
  };
}

function renderRecommendationState() {
  dom.recommendStatus.textContent = recommendationState.message;
  dom.recommendStatus.className = "recommend-status";

  if (recommendationState.status === "success") {
    dom.recommendStatus.classList.add("is-success");
  }

  if (recommendationState.status === "error") {
    dom.recommendStatus.classList.add("is-error");
  }

  dom.recommendSummary.textContent = recommendationState.summary;
  dom.recommendReasonList.innerHTML = recommendationState.reasons
    .map((reason) => `<li>${escapeHtml(reason)}</li>`)
    .join("");
}

function validateRecommendationDraft(draft) {
  const config = TICKET_TYPE_CONFIG[draft.ticketType];
  const normalizedDraft = normalizeRecommendationDraft(draft);
  const expectedCount = config.fixedCount || normalizedDraft.memberCount;

  if (config.countEditable) {
    if (normalizedDraft.memberCount < config.min || normalizedDraft.memberCount > config.max) {
      return {
        valid: false,
        message: `${config.label}人数需在 ${config.min} 到 ${config.max} 人之间。`
      };
    }
  }

  if (normalizedDraft.members.length !== expectedCount) {
    return {
      valid: false,
      message: "观众信息数量与票型要求不一致，请检查后重试。"
    };
  }

  for (const [index, member] of normalizedDraft.members.entries()) {
    if (!member.name) {
      return {
        valid: false,
        message: `请填写${getMemberLabel(normalizedDraft.ticketType, index)}的姓名。`
      };
    }

    const age = Number(member.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return {
        valid: false,
        message: `请填写${getMemberLabel(normalizedDraft.ticketType, index)}的有效年龄。`
      };
    }
  }

  return {
    valid: true,
    draft: {
      ...normalizedDraft,
      members: normalizedDraft.members.map((member) => ({
        name: member.name,
        age: Number(member.age)
      }))
    }
  };
}

function recommendSeatsForHall(hall, draft) {
  const audience = draft.members;
  const ticketConfig = TICKET_TYPE_CONFIG[draft.ticketType];
  const restriction = calculateAudienceRestriction(audience, hall.rows);

  if (audience.length > hall.seatsPerRow) {
    return {
      success: false,
      message: `${hall.name}每排最多只有 ${hall.seatsPerRow} 个座位，无法容纳当前票型人数。`,
      reasons: []
    };
  }

  if (restriction.minRow > restriction.maxRow) {
    return {
      success: false,
      message: "当前年龄限制冲突，系统无法找到同时满足规则的排数。",
      reasons: []
    };
  }

  const candidates = findSeatCandidates(hall, draft.ticketType, audience.length, restriction);

  if (!candidates.length) {
    return {
      success: false,
      message: buildNoSeatMessage(hall, ticketConfig.label, audience.length, restriction),
      reasons: buildRestrictionReasons(draft.ticketType, restriction)
    };
  }

  candidates.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (left.row !== right.row) {
      return left.row - right.row;
    }

    return left.startSeat - right.startSeat;
  });

  const bestCandidate = candidates[0];
  const seatLabels = bestCandidate.seatKeys.map(formatSeatLabel);

  return {
    success: true,
    seatKeys: bestCandidate.seatKeys,
    message: `已在${hall.name}找到符合${ticketConfig.label}规则的推荐座位，并自动高亮显示。`,
    summary: `推荐座位：${seatLabels.join("、")}`,
    reasons: buildRecommendationReasons(hall, draft.ticketType, bestCandidate, restriction)
  };
}

function calculateAudienceRestriction(audience, totalRows) {
  const hasMinor = audience.some((member) => member.age < 15);
  const hasSenior = audience.some((member) => member.age > 60);

  return {
    hasMinor,
    hasSenior,
    minRow: hasMinor ? 4 : 1,
    maxRow: hasSenior ? totalRows - 3 : totalRows
  };
}

function findSeatCandidates(hall, ticketType, seatCount, restriction) {
  const candidates = [];

  for (let row = restriction.minRow; row <= restriction.maxRow; row += 1) {
    const rowSeats = hall.seats.filter((seat) => seat.row === row);

    for (let startIndex = 0; startIndex <= rowSeats.length - seatCount; startIndex += 1) {
      const seatBlock = rowSeats.slice(startIndex, startIndex + seatCount);

      if (!isAvailableSequentialBlock(seatBlock)) {
        continue;
      }

      candidates.push({
        row,
        startSeat: seatBlock[0].number,
        seatKeys: seatBlock.map((seat) => `${seat.row}-${seat.number}`),
        score: scoreSeatBlock(hall, ticketType, rowSeats, seatBlock, startIndex)
      });
    }
  }

  return candidates;
}

function isAvailableSequentialBlock(seatBlock) {
  return seatBlock.every((seat, index) => {
    if (seat.status !== "available") {
      return false;
    }

    if (index === 0) {
      return true;
    }

    return seat.number === seatBlock[index - 1].number + 1;
  });
}

function scoreSeatBlock(hall, ticketType, rowSeats, seatBlock, startIndex) {
  const seatCount = seatBlock.length;
  const blockCenter = seatBlock[0].number + (seatCount - 1) / 2;
  const horizontalCenter = (hall.seatsPerRow + 1) / 2;
  const centerDistance = Math.abs(blockCenter - horizontalCenter);
  const idealRow = getIdealRowForTicketType(ticketType, hall.rows);
  const leftNeighbor = rowSeats[startIndex - 1];
  const rightNeighbor = rowSeats[startIndex + seatCount];
  const hasLeftBuffer = leftNeighbor ? leftNeighbor.status === "available" : false;
  const hasRightBuffer = rightNeighbor ? rightNeighbor.status === "available" : false;

  let score = 220;
  score -= centerDistance * 12;
  score -= Math.abs(seatBlock[0].row - idealRow) * 11;
  score += hasLeftBuffer ? 4 : 0;
  score += hasRightBuffer ? 4 : 0;

  if (ticketType === "individual") {
    score += centerDistance <= hall.seatsPerRow * 0.15 ? 10 : 0;
  }

  if (ticketType === "couple") {
    score += centerDistance <= hall.seatsPerRow * 0.12 ? 28 : 0;
    score += seatBlock[0].row >= Math.ceil(hall.rows * 0.5) && seatBlock[0].row <= Math.ceil(hall.rows * 0.7)
      ? 12
      : 0;
  }

  if (ticketType === "family") {
    score += seatBlock[0].row >= Math.ceil(hall.rows * 0.6)
      ? 20
      : seatBlock[0].row >= Math.ceil(hall.rows * 0.5)
        ? 10
        : 0;
    score += centerDistance <= hall.seatsPerRow * 0.2 ? 8 : 0;
  }

  if (ticketType === "group") {
    score += seatBlock[0].row >= Math.ceil(hall.rows * 0.5) && seatBlock[0].row <= Math.ceil(hall.rows * 0.7)
      ? 16
      : 0;
    score += centerDistance <= hall.seatsPerRow * 0.22 ? 10 : 0;
  }

  return score;
}

function getIdealRowForTicketType(ticketType, totalRows) {
  const rowTargets = {
    individual: 0.6,
    couple: 0.6,
    family: 0.7,
    group: 0.6
  };

  return Math.round(totalRows * rowTargets[ticketType]);
}

function buildRecommendationReasons(hall, ticketType, candidate, restriction) {
  const reasons = [];
  const rowTone = describeRowTone(candidate.row, hall.rows);
  const centerTone = describeCenterTone(candidate.startSeat, candidate.seatKeys.length, hall.seatsPerRow);

  if (ticketType === "individual") {
    reasons.push("优先选择了视角更稳定、距离银幕适中的单人座位。");
  }

  if (ticketType === "couple") {
    reasons.push("优先选择中间区域连续双座，方便情侣并排观影。");
  }

  if (ticketType === "family") {
    reasons.push("优先选择中后排连续座位，方便家庭成员坐在一起并兼顾视野。");
  }

  if (ticketType === "group") {
    reasons.push("已满足团体票同排连续就坐要求，整组成员无需分开。");
  }

  if (restriction.hasMinor) {
    reasons.push("已避开前 3 排，确保未满 15 岁观众不被安排在前区。");
  }

  if (restriction.hasSenior) {
    reasons.push("已避开最后 3 排，照顾 60 岁以上观众的观影舒适度。");
  }

  reasons.push(`推荐位于第 ${candidate.row} 排，${rowTone}。`);
  reasons.push(centerTone);
  reasons.push("推荐座位已自动高亮，如需调整仍可继续手动修改。");

  return reasons;
}

function buildRestrictionReasons(ticketType, restriction) {
  const reasons = [];

  if (ticketType === "couple") {
    reasons.push("情侣票需要连续双座，系统会优先寻找中间区域。");
  }

  if (ticketType === "family") {
    reasons.push("家庭票优先推荐连续座位，方便成员同行就坐。");
  }

  if (ticketType === "group") {
    reasons.push("团体票必须同排连续，无法拆分到多排或多个区域。");
  }

  if (restriction.hasMinor) {
    reasons.push("当前组合包含未满 15 岁观众，前 3 排不可用。");
  }

  if (restriction.hasSenior) {
    reasons.push("当前组合包含 60 岁以上观众，最后 3 排不可用。");
  }

  return reasons;
}

function buildNoSeatMessage(hall, ticketLabel, audienceCount, restriction) {
  const ageRuleText = [];

  if (restriction.hasMinor) {
    ageRuleText.push("避开前 3 排");
  }

  if (restriction.hasSenior) {
    ageRuleText.push("避开最后 3 排");
  }

  const ruleSuffix = ageRuleText.length ? `，并同时满足${ageRuleText.join("、")}` : "";
  const continuityText = audienceCount > 1 ? "同排连续" : "单人可用";

  return `${hall.name}当前没有满足${ticketLabel}${audienceCount}人${continuityText}空座${ruleSuffix}的推荐方案，请切换影厅或调整人数后重试。`;
}

function describeRowTone(row, totalRows) {
  const ratio = row / totalRows;

  if (ratio <= 0.4) {
    return "距离银幕偏近，但仍处于规则允许范围内";
  }

  if (ratio <= 0.7) {
    return "距离银幕适中，视角更平衡";
  }

  return "位于中后排区域，更适合多人稳定观影";
}

function describeCenterTone(startSeat, seatCount, seatsPerRow) {
  const blockCenter = startSeat + (seatCount - 1) / 2;
  const horizontalCenter = (seatsPerRow + 1) / 2;
  const centerDistance = Math.abs(blockCenter - horizontalCenter);

  if (centerDistance <= seatsPerRow * 0.1) {
    return "横向位置接近影厅中心区，视角较好。";
  }

  if (centerDistance <= seatsPerRow * 0.22) {
    return "横向位置较为均衡，兼顾视野与舒适度。";
  }

  return "虽然不在绝对中心，但仍优先保证连续性和规则匹配。";
}

function syncCurrentUserUI() {
  const user = getCurrentUser();
  dom.currentUserName.textContent = user ? user.displayName : "未登录";
  dom.currentUserRole.textContent = user ? roleLabel(user.role) : "访客";
  dom.currentUserStatus.textContent = user ? "已解锁选座台" : "请先登录";
  dom.heroUserName.textContent = user ? user.displayName : "未登录";
  dom.heroUserRole.textContent = user ? roleLabel(user.role) : "访客";
}

function setAuthMessage(message, type) {
  dom.authMessage.textContent = message;
  dom.authMessage.className = "auth-message";
  if (type) {
    dom.authMessage.classList.add(`is-${type}`);
  }
}

function formatSeatLabel(seatKey) {
  const [row, seatNumber] = seatKey.split("-");
  return `${row}排${seatNumber}座`;
}

function getCurrentUser() {
  return state.users.find((user) => user.id === state.currentUserId) || null;
}

function roleLabel(role) {
  return role === "admin" ? "管理员" : "会员";
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);

  if (!saved) {
    const initialState = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    const normalizedState = normalizeState(JSON.parse(saved));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedState));
    return normalizedState;
  } catch (error) {
    const fallbackState = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackState));
    return fallbackState;
  }
}

function normalizeState(savedState) {
  const normalizedOrders = Array.isArray(savedState.orders)
    ? savedState.orders.map((order) => {
      const statusCode = order.statusCode || getOrderStatusCode(order.status);
      return {
        ...order,
        seatKeys: Array.isArray(order.seatKeys) ? order.seatKeys : [],
        seats: Array.isArray(order.seats) ? order.seats : [],
        statusCode,
        status: getOrderStatusLabel(statusCode)
      };
    })
    : [];

  return {
    ...savedState,
    orders: normalizedOrders
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadAccessibilityState() {
  const saved = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);

  if (!saved) {
    return createDefaultAccessibilityState();
  }

  try {
    return {
      ...createDefaultAccessibilityState(),
      ...JSON.parse(saved)
    };
  } catch (error) {
    return createDefaultAccessibilityState();
  }
}

function saveAccessibilityState() {
  localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(accessibilityState));
}

function createDefaultAccessibilityState() {
  return {
    largeText: false,
    highContrast: false,
    colorblindFriendly: false,
    voicePrompt: false
  };
}

function createInitialState() {
  return {
    currentUserId: null,
    users: [
      {
        id: "admin_001",
        username: "admin",
        displayName: "系统管理员",
        password: "admin123",
        role: "admin",
        createdAt: "2026-07-21T00:00:00.000Z"
      }
    ],
    orders: [],
    halls: hallsConfig.reduce((accumulator, hall) => {
      accumulator[hall.id] = {
        ...hall,
        seats: buildSeats(hall.rows, hall.seatsPerRow, hall.id)
      };
      return accumulator;
    }, {})
  };
}

function buildSeats(rows, seatsPerRow, hallId) {
  const soldPattern = soldPatternByHall(hallId);
  const seats = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let number = 1; number <= seatsPerRow; number += 1) {
      const key = `${row}-${number}`;
      seats.push({
        row,
        number,
        status: soldPattern.has(key) ? "sold" : "available"
      });
    }
  }

  return seats;
}

function soldPatternByHall(hallId) {
  const patterns = {
    small: ["3-4", "3-5", "4-5", "4-6", "6-3", "7-8", "8-2", "9-9"],
    medium: ["2-9", "2-10", "3-10", "3-11", "4-8", "4-9", "5-12", "6-13", "7-7", "8-15", "9-6", "9-7"],
    large: ["2-14", "2-15", "3-13", "3-14", "3-15", "4-16", "4-17", "5-11", "5-12", "5-18", "6-19", "7-20", "7-21", "8-9", "8-10", "9-23", "9-24", "10-15"]
  };

  return new Set(patterns[hallId] || []);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
