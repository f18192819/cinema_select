const STORAGE_KEY = "smartCinemaState";
const USER_STORAGE_KEY = "smartCinemaUsers";
const CURRENT_USER_STORAGE_KEY = "smartCinemaCurrentUser";
const ACCESSIBILITY_STORAGE_KEY = "smartCinemaAccessibility";
const AUTH_VIEWS = ["login", "register"];
const ORDER_STATUS = {
  reserved: "reserved",
  purchased: "purchased",
  cancelled: "cancelled",
  refunded: "refunded"
};
const HEAT_RADIUS = 3;

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
  adminScreen: document.getElementById("adminScreen"),
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
  heatVisibilityToggle: document.getElementById("heatVisibilityToggle"),
  heatSourceStats: document.getElementById("heatSourceStats"),
  heatStatus: document.getElementById("heatStatus"),
  seatViewHint: document.getElementById("seatViewHint"),
  seatViewModeBtn: document.getElementById("seatViewModeBtn"),
  seatOverview: document.getElementById("seatOverview"),
  seatOverviewMap: document.getElementById("seatOverviewMap"),
  seatOverviewViewport: document.getElementById("seatOverviewViewport"),
  seatMiniMap: document.getElementById("seatMiniMap"),
  canvas: document.getElementById("seatCanvas"),
  adminUserName: document.getElementById("adminUserName"),
  adminLogoutBtn: document.getElementById("adminLogoutBtn"),
  adminHallCount: document.getElementById("adminHallCount"),
  adminOrderCount: document.getElementById("adminOrderCount"),
  adminUserCount: document.getElementById("adminUserCount"),
  adminHallTabs: document.getElementById("adminHallTabs"),
  adminSeatStatusSelect: document.getElementById("adminSeatStatusSelect"),
  adminResetHallBtn: document.getElementById("adminResetHallBtn"),
  adminSeatStatus: document.getElementById("adminSeatStatus"),
  adminCanvas: document.getElementById("adminSeatCanvas"),
  adminOrderSummary: document.getElementById("adminOrderSummary"),
  adminOrderList: document.getElementById("adminOrderList"),
  adminUserSummary: document.getElementById("adminUserSummary"),
  adminUserList: document.getElementById("adminUserList")
};

const ctx = dom.canvas.getContext("2d");
const miniMapCtx = dom.seatMiniMap ? dom.seatMiniMap.getContext("2d") : null;
const adminCtx = dom.adminCanvas ? dom.adminCanvas.getContext("2d") : null;

let state = loadState();
initializeUserData();
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
let isHeatVisible = true;
const SEAT_ZOOM_VIEW_SIZE = 0.56;
const seatViewModes = { small: "full", medium: "zoom", large: "zoom" };
const seatViewports = {
  medium: { x: 0.22, y: 0.2, width: SEAT_ZOOM_VIEW_SIZE, height: SEAT_ZOOM_VIEW_SIZE },
  large: { x: 0.22, y: 0.2, width: SEAT_ZOOM_VIEW_SIZE, height: SEAT_ZOOM_VIEW_SIZE }
};
let seatCanvasLogicalSize = { width: 1200, height: 760 };
let miniMapDragPointerId = null;
let miniMapDragOffset = { x: SEAT_ZOOM_VIEW_SIZE / 2, y: SEAT_ZOOM_VIEW_SIZE / 2 };
let adminRenderedSeats = [];

bootstrap();

function bootstrap() {
  renderAuthSwitch("login");
  renderHallTabs();
  renderAdminHallTabs();
  initializeRecommendationUI();
  initializeAccessibilityUI();
  bindEvents();
  syncScreenState();
  syncCurrentUserUI();
  renderRecommendationState();
  renderExperienceScoreState();
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
}

function bindEvents() {
  dom.authSwitchButtons.forEach((button) => {
    button.addEventListener("click", () => renderAuthSwitch(button.dataset.authView));
  });

  dom.loginForm.addEventListener("submit", handleLogin);
  dom.registerForm.addEventListener("submit", handleRegister);
  dom.logoutBtn.addEventListener("click", handleLogout);
  dom.adminLogoutBtn.addEventListener("click", handleLogout);
  dom.canvas.addEventListener("mousedown", handleCanvasPointerDown);
  dom.canvas.addEventListener("mousemove", handleCanvasPointerMove);
  dom.canvas.addEventListener("mouseup", handleCanvasPointerUp);
  dom.canvas.addEventListener("mouseleave", handleCanvasPointerLeave);
  dom.canvas.addEventListener("click", handleCanvasClick);
  dom.ticketTypeSelect.addEventListener("change", handleTicketTypeChange);
  dom.memberCountInput.addEventListener("input", handleMemberCountInput);
  dom.memberCountInput.addEventListener("change", handleMemberCountChange);
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
  dom.adminCanvas.addEventListener("click", handleAdminSeatCanvasClick);
  dom.adminOrderList.addEventListener("click", handleAdminOrderAction);
  dom.adminResetHallBtn.addEventListener("click", handleAdminResetHall);
  if (dom.heatVisibilityToggle) {
    dom.heatVisibilityToggle.addEventListener("change", handleHeatVisibilityChange);
  }
  if (dom.seatViewModeBtn) {
    dom.seatViewModeBtn.addEventListener("click", handleSeatViewModeToggle);
  }
  if (dom.seatOverviewMap) {
    dom.seatOverviewMap.addEventListener("pointerdown", handleSeatOverviewPointerDown);
    dom.seatOverviewMap.addEventListener("pointermove", handleSeatOverviewPointerMove);
    dom.seatOverviewMap.addEventListener("pointerup", handleSeatOverviewPointerUp);
    dom.seatOverviewMap.addEventListener("pointercancel", handleSeatOverviewPointerUp);
  }
  if (dom.seatOverviewViewport) {
    dom.seatOverviewViewport.addEventListener("keydown", handleSeatOverviewKeyDown);
  }
  window.addEventListener("smartcinema:purchase-success", handlePurchaseSuccessAnnouncement);
  window.addEventListener("resize", () => {
    renderCurrentHall();
    renderAdminSeatCanvas();
  });
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

function handleHeatVisibilityChange(event) {
  isHeatVisible = event.currentTarget.checked;
  renderCurrentHall();
}

function isSeatZoomEnabled(hall) {
  return Boolean(hall && hall.id !== "small" && seatViewModes[hall.id] === "zoom");
}

function getSeatViewport(hall) {
  if (!isSeatZoomEnabled(hall)) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  return seatViewports[hall.id];
}

function renderSeatViewControls(hall) {
  if (!dom.seatViewModeBtn || !dom.seatOverview) {
    return;
  }

  const supportsZoom = hall.id !== "small";
  const zoomEnabled = supportsZoom && isSeatZoomEnabled(hall);
  dom.seatViewModeBtn.hidden = !supportsZoom;
  dom.seatViewModeBtn.classList.toggle("is-zoomed", zoomEnabled);
  dom.seatViewModeBtn.setAttribute("aria-pressed", String(zoomEnabled));
  dom.seatViewModeBtn.textContent = zoomEnabled ? "切换全局视图" : "开启局部放大";
  dom.seatOverview.hidden = !zoomEnabled;
  dom.canvas.parentElement.classList.toggle("is-zoomed", zoomEnabled);

  if (dom.seatViewHint) {
    dom.seatViewHint.textContent = !supportsZoom
      ? "小厅座位较少，始终显示全厅"
      : zoomEnabled
        ? "局部放大模式 · 拖动左上角亮框移动区域"
        : "全局模式 · 一次查看全部座位";
  }
}

function handleSeatViewModeToggle() {
  const hall = state.halls[selectedHallId];
  if (!hall || hall.id === "small") {
    return;
  }

  seatViewModes[hall.id] = isSeatZoomEnabled(hall) ? "full" : "zoom";
  dragSelection = createEmptyDragSelection();
  renderCurrentHall();
}

function handleSeatOverviewPointerDown(event) {
  const hall = state.halls[selectedHallId];
  if (!isSeatZoomEnabled(hall)) {
    return;
  }

  event.preventDefault();
  miniMapDragPointerId = event.pointerId;
  const point = getSeatOverviewPoint(event);
  const viewport = getSeatViewport(hall);
  const startedOnViewport = event.target === dom.seatOverviewViewport;
  miniMapDragOffset = startedOnViewport
    ? { x: point.x - viewport.x, y: point.y - viewport.y }
    : { x: viewport.width / 2, y: viewport.height / 2 };

  if (dom.seatOverviewMap.setPointerCapture) {
    dom.seatOverviewMap.setPointerCapture(event.pointerId);
  }
  updateSeatViewportFromOverviewPoint(hall, point);
}

function handleSeatOverviewPointerMove(event) {
  if (miniMapDragPointerId !== event.pointerId) {
    return;
  }

  const hall = state.halls[selectedHallId];
  if (!isSeatZoomEnabled(hall)) {
    return;
  }

  event.preventDefault();
  updateSeatViewportFromOverviewPoint(hall, getSeatOverviewPoint(event));
}

function handleSeatOverviewPointerUp(event) {
  if (miniMapDragPointerId !== event.pointerId) {
    return;
  }

  const canReleasePointer = dom.seatOverviewMap.releasePointerCapture &&
    (!dom.seatOverviewMap.hasPointerCapture || dom.seatOverviewMap.hasPointerCapture(event.pointerId));
  if (canReleasePointer) {
    dom.seatOverviewMap.releasePointerCapture(event.pointerId);
  }
  miniMapDragPointerId = null;
}

function handleSeatOverviewKeyDown(event) {
  const hall = state.halls[selectedHallId];
  if (!isSeatZoomEnabled(hall)) {
    return;
  }

  const direction = {
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
    ArrowUp: [0, -1],
    ArrowDown: [0, 1]
  }[event.key];
  if (!direction) {
    return;
  }

  event.preventDefault();
  const viewport = seatViewports[hall.id];
  const step = event.shiftKey ? 0.08 : 0.035;
  viewport.x = clamp(viewport.x + direction[0] * step, 0, 1 - viewport.width);
  viewport.y = clamp(viewport.y + direction[1] * step, 0, 1 - viewport.height);
  renderSeatCanvasForCurrentView();
}

function getSeatOverviewPoint(event) {
  const rect = dom.seatOverviewMap.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1)
  };
}

function updateSeatViewportFromOverviewPoint(hall, point) {
  const viewport = seatViewports[hall.id];
  viewport.x = clamp(point.x - miniMapDragOffset.x, 0, 1 - viewport.width);
  viewport.y = clamp(point.y - miniMapDragOffset.y, 0, 1 - viewport.height);
  renderSeatCanvasForCurrentView();
}

function renderSeatCanvasForCurrentView() {
  const hall = state.halls[selectedHallId];
  const currentUser = getCurrentUser();
  renderSeatCanvas(hall, Boolean(currentUser && currentUser.role === "user"));
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
    dom.accessibilityStatus.textContent = "语音提示还未开启。开启后，就可以试听购票完成播报。";
    return;
  }

  window.dispatchEvent(new CustomEvent("smartcinema:purchase-success"));
  renderAccessibilityState();
}

function handleCreateOrder(statusCode) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    setOrderStatus("登录后，我们就能为你保留座位并完成购票。", "error");
    return;
  }

  if (!isNormalUser()) {
    setOrderStatus("管理员账号仅可管理影院数据，不能创建用户订单。", "error");
    return;
  }

  if (!selectedSeatKeys.length) {
    setOrderStatus("请先选好座位，我们就能继续为你预订或购票。", "error");
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
    message: "这次的座位已经为你保存。还想继续观影，可以重新推荐或手动选座。",
    summary: "填写同行信息后，即可为你推荐。"
  });
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
  setOrderStatus(
    statusCode === ORDER_STATUS.reserved
      ? `预订成功，已为你锁定座位。订单号：${order.orderNo}。`
      : `购票成功，座位已经为你保留。订单号：${order.orderNo}。`,
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
      message: "抱歉，有座位刚刚已售出或被预订，请重新挑选空座。"
    };
  }

  if (selectedSeats.length !== draft.members.length) {
    return {
      valid: false,
      message: `同行共 ${draft.members.length} 位，目前选了 ${selectedSeats.length} 个座位；请按人数补齐或取消多余座位。`
    };
  }

  const restriction = calculateAudienceRestriction(draft.members, hall.rows);
  if (restriction.hasMinor && selectedSeats.some((seat) => seat.row <= 3)) {
    return {
      valid: false,
      message: "同行人中有未满 15 岁的观众，为了更舒适地观影，请避开前 3 排。"
    };
  }

  if (restriction.hasSenior && selectedSeats.some((seat) => seat.row > hall.rows - 3)) {
    return {
      valid: false,
      message: "同行人中有 60 岁以上的观众，为了更舒适地观影，请避开最后 3 排。"
    };
  }

  if (draft.ticketType === "group" && !isSameRowConsecutive(selectedSeats)) {
    return {
      valid: false,
      message: "团体票需要同排连续就坐，请为大家重新选择一组连座。"
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

  if (!order || !currentUser || !isNormalUser() || order.userId !== currentUser.id) {
    setOrderStatus("没有找到这笔订单，或它不属于当前账号，请确认后再试。", "error");
    return;
  }

  if (action === "cancel" && order.statusCode === ORDER_STATUS.reserved) {
    updateOrderStatus(order, ORDER_STATUS.cancelled);
    setOrderStatus(`预订已取消，订单 ${order.orderNo} 的座位已经释放。`, "success");
    speakMessage("预订已取消，座位已释放。");
    return;
  }

  if (action === "refund" && order.statusCode === ORDER_STATUS.purchased) {
    updateOrderStatus(order, ORDER_STATUS.refunded);
    setOrderStatus(`退票已完成，订单 ${order.orderNo} 的座位已经释放。`, "success");
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
  renderAdminDashboard();
}

function renderOrderCenter() {
  const currentUser = getCurrentUser();
  const orders = isNormalUser() && currentUser
    ? state.orders.filter((order) => order.userId === currentUser.id)
    : [];

  dom.orderCount.textContent = `${orders.length} 笔`;
  if (!orders.length) {
    dom.orderList.innerHTML = '<p class="order-empty">还没有订单。选好座位后，可以在这里预订或直接购票。</p>';
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
  setOrderStatus("填好同行信息并选定座位后，就可以预订或直接购票。");
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
    ? "这个浏览器可以使用语音播报。"
    : "抱歉，这个浏览器暂不支持语音播报。";

  dom.accessibilityStatus.textContent = activeModes.length
    ? `已为你开启：${activeModes.join("、")}。语音提示${voiceLabel}。${voiceSupport}`
    : `无障碍增强模式暂未开启。语音提示${voiceLabel}。${voiceSupport}`;

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
    (entry) => entry.username === username && entry.password === password && !entry.disabled
  );

  if (!user) {
    setAuthMessage("用户名或密码不正确，请再试一次。", "error");
    return;
  }

  setCurrentUser(user);
  selectedSeatKeys = [];
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
  setAuthMessage("", "");
  event.currentTarget.reset();
}

function handleRegister(event) {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const username = String(formData.get("username") || "").trim();
  const displayName = String(formData.get("displayName") || "").trim();
  const password = String(formData.get("password") || "").trim();

  if (!username || !password || !displayName) {
    setAuthMessage("请把用户名、昵称和密码填写完整。", "error");
    return;
  }

  if (username.length < 3 || username.length > 16) {
    setAuthMessage("用户名请使用 3–16 个字符。", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("为了账号安全，密码请至少填写 6 位。", "error");
    return;
  }

  if (username.toLowerCase() === "admin") {
    setAuthMessage("admin 是影院管理专用账号，请换一个用户名。", "error");
    return;
  }

  if (state.users.some((entry) => entry.username.toLowerCase() === username.toLowerCase())) {
    setAuthMessage("这个用户名已经有人使用，请换一个再试。", "error");
    return;
  }

  const user = {
    id: `user-${Date.now()}`,
    username,
    displayName,
    password,
    role: "user",
    memberLevel: "normal",
    createdAt: new Date().toISOString()
  };

  state.users.push(user);
  setCurrentUser(user);
  selectedSeatKeys = [];
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
  setAuthMessage("", "");
  event.currentTarget.reset();
}

function handleLogout() {
  clearCurrentUser();
  saveState();
  selectedSeatKeys = [];
  renderAuthSwitch("login");
  recommendationDraft = createDefaultRecommendationDraft("individual");
  clearRecommendation({
    keepSelection: false,
    status: "idle",
    message: "选好票型并填写同行人的信息，我们会在当前影厅为你挑选合适的空座。",
    summary: "填写同行信息后，即可为你推荐。"
  });
  renderRecommendationForm();
  syncScreenState();
  syncCurrentUserUI();
  resetOrderStatus();
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
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
        message: `已经切换到${hall.name}，需要的话，我们可以按这个影厅重新为你推荐。`,
        summary: "填写同行信息后，即可为你推荐。"
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
  const recommendationIsSelected = recommendedSeatKeys.length > 0 &&
    recommendedSeatKeys.length === selectedSeatKeys.length &&
    recommendedSeatKeys.every((seatKey) => selectedSeatKeys.includes(seatKey));
  dom.selectionReadout.classList.toggle("is-recommended-selection", recommendationIsSelected);
  dom.adminNote.hidden = true;
  updateExperienceScore(hall);
  renderHeatPanel(hall);
  renderSeatViewControls(hall);
  renderSeatCanvas(hall, Boolean(currentUser && currentUser.role === "user"));
}

function renderAdminDashboard() {
  if (!isAdmin()) {
    return;
  }

  const user = getCurrentUser();
  dom.adminUserName.textContent = user.displayName || user.username;
  dom.adminHallCount.textContent = String(Object.keys(state.halls).length);
  dom.adminOrderCount.textContent = String(state.orders.length);
  dom.adminUserCount.textContent = String(state.users.length);
  renderAdminHallTabs();
  renderAdminSeatCanvas();
  renderAdminOrders();
  renderAdminUsers();
}

function renderAdminHallTabs() {
  if (!dom.adminHallTabs) {
    return;
  }

  dom.adminHallTabs.innerHTML = "";
  hallsConfig.forEach((hall) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hall-tab${hall.id === selectedHallId ? " is-active" : ""}`;
    button.innerHTML = `${hall.name}<small>${hall.rows} 排 / 每排 ${hall.seatsPerRow} 座</small>`;
    button.addEventListener("click", () => {
      if (!isAdmin()) {
        setAdminSeatStatus("无管理员权限。", "error");
        return;
      }

      selectedHallId = hall.id;
      selectedSeatKeys = [];
      recommendedSeatKeys = [];
      renderAdminDashboard();
    });
    dom.adminHallTabs.appendChild(button);
  });
}

function renderAdminSeatCanvas() {
  if (!adminCtx || !dom.adminCanvas || !isAdmin()) {
    return;
  }

  const hall = state.halls[selectedHallId];
  const containerWidth = dom.adminCanvas.parentElement.clientWidth || 920;
  const logicalWidth = Math.max(320, Math.min(920, containerWidth - 36));
  const logicalHeight = 610;
  const pixelRatio = window.devicePixelRatio || 1;
  const palette = getSeatPalette();
  const marginX = logicalWidth < 480 ? 26 : 58;
  const startY = 122;
  const rowGap = 43;
  const curveStrength = logicalWidth < 480 ? 12 : 18;
  const maxSeatWidth = logicalWidth - marginX * 2;
  const seatGap = maxSeatWidth / Math.max(hall.seatsPerRow - 1, 1);
  const seatRadius = Math.max(4, Math.min(11, seatGap * 0.3));
  const labelEnabled = hall.seatsPerRow <= 20 && seatRadius >= 7;

  dom.adminCanvas.width = logicalWidth * pixelRatio;
  dom.adminCanvas.height = logicalHeight * pixelRatio;
  dom.adminCanvas.style.width = `${logicalWidth}px`;
  dom.adminCanvas.style.height = `${logicalHeight}px`;
  adminCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  adminCtx.clearRect(0, 0, logicalWidth, logicalHeight);
  adminCtx.fillStyle = "rgba(0, 8, 20, 0.46)";
  adminCtx.fillRect(0, 0, logicalWidth, logicalHeight);
  adminCtx.fillStyle = palette.textMain;
  adminCtx.font = "700 15px Orbitron, sans-serif";
  adminCtx.textAlign = "center";
  adminCtx.fillText(`${hall.name} / SEAT STATUS`, logicalWidth / 2, 34);
  adminCtx.fillStyle = palette.textSoft;
  adminCtx.font = "13px 'Noto Sans SC', sans-serif";
  adminCtx.fillText("选择状态后点击座位，即可保存并同步到用户端", logicalWidth / 2, 58);

  adminRenderedSeats = [];
  for (let row = 1; row <= hall.rows; row += 1) {
    const rowBaseY = startY + (row - 1) * rowGap;
    adminCtx.fillStyle = palette.textSoft;
    adminCtx.font = "11px Orbitron, sans-serif";
    adminCtx.textAlign = "left";
    adminCtx.fillText(`R${String(row).padStart(2, "0")}`, 10, rowBaseY + 4);

    for (let seatNumber = 1; seatNumber <= hall.seatsPerRow; seatNumber += 1) {
      const index = seatNumber - 1;
      const normalized = hall.seatsPerRow === 1 ? 0 : index / (hall.seatsPerRow - 1) - 0.5;
      const x = marginX + index * seatGap;
      const y = rowBaseY + curveStrength * Math.pow(normalized * 2, 2);
      const seat = hall.seats[(row - 1) * hall.seatsPerRow + index];
      const fillColor = seat.status === "sold"
        ? palette.seatSold
        : seat.status === "reserved"
          ? palette.seatReserved
          : seat.status === "disabled"
            ? palette.seatDisabled
            : palette.seatAvailable;

      adminCtx.save();
      drawRoundedSeatPath(adminCtx, x, y, seatRadius);
      adminCtx.fillStyle = fillColor;
      adminCtx.shadowColor = fillColor;
      adminCtx.shadowBlur = 7;
      adminCtx.fill();
      adminCtx.shadowBlur = 0;
      adminCtx.strokeStyle = "rgba(255,255,255,0.56)";
      adminCtx.lineWidth = 1;
      adminCtx.stroke();
      adminCtx.restore();

      if (labelEnabled) {
        adminCtx.fillStyle = "#03111f";
        adminCtx.font = "9px 'Noto Sans SC', sans-serif";
        adminCtx.textAlign = "center";
        adminCtx.fillText(String(seatNumber), x, y + 3);
      }

      adminRenderedSeats.push({
        key: `${seat.row}-${seat.number}`,
        x,
        y,
        radius: seatRadius
      });
    }
  }
}

function handleAdminSeatCanvasClick(event) {
  if (!isAdmin()) {
    setAdminSeatStatus("无管理员权限。", "error");
    return;
  }

  const rect = dom.adminCanvas.getBoundingClientRect();
  const logicalWidth = parseFloat(dom.adminCanvas.style.width);
  const logicalHeight = parseFloat(dom.adminCanvas.style.height);
  const pointerX = ((event.clientX - rect.left) / rect.width) * logicalWidth;
  const pointerY = ((event.clientY - rect.top) / rect.height) * logicalHeight;
  const hitSeat = adminRenderedSeats.find((seat) => isPointInsideSeat(pointerX, pointerY, seat));

  if (!hitSeat) {
    return;
  }

  const hall = state.halls[selectedHallId];
  const seat = findSeatByKey(hall, hitSeat.key);
  const nextStatus = dom.adminSeatStatusSelect.value;
  if (!seat || !nextStatus) {
    return;
  }

  closeConflictingOrdersForAdminSeat(hall, hitSeat.key, nextStatus);
  seat.status = nextStatus;
  selectedSeatKeys = selectedSeatKeys.filter((seatKey) => seatKey !== hitSeat.key);
  recommendedSeatKeys = recommendedSeatKeys.filter((seatKey) => seatKey !== hitSeat.key);
  saveState();
  setAdminSeatStatus(`${formatSeatLabel(hitSeat.key)} 已更新为${getSeatStatusLabel(nextStatus)}，用户端已同步。`, "success");
  renderCurrentHall();
  renderAdminDashboard();
}

function closeConflictingOrdersForAdminSeat(hall, seatKey, nextStatus) {
  state.orders.forEach((order) => {
    const statusCode = order.statusCode || getOrderStatusCode(order.status);
    const isActive = statusCode === ORDER_STATUS.reserved || statusCode === ORDER_STATUS.purchased;
    const includesSeat = order.hallId === hall.id && (order.seatKeys || []).includes(seatKey);
    const shouldKeepPurchasedOrder = nextStatus === "sold" && statusCode === ORDER_STATUS.purchased;

    if (!isActive || !includesSeat || shouldKeepPurchasedOrder) {
      return;
    }

    order.statusCode = statusCode === ORDER_STATUS.reserved ? ORDER_STATUS.cancelled : ORDER_STATUS.refunded;
    order.status = getOrderStatusLabel(order.statusCode);
    order.updatedAt = new Date().toISOString();
  });
}

function handleAdminResetHall() {
  if (!isAdmin()) {
    setAdminSeatStatus("无管理员权限。", "error");
    return;
  }

  const hall = state.halls[selectedHallId];
  state.orders.forEach((order) => {
    if (order.hallId !== hall.id) {
      return;
    }

    const statusCode = order.statusCode || getOrderStatusCode(order.status);
    if (statusCode === ORDER_STATUS.reserved || statusCode === ORDER_STATUS.purchased) {
      order.statusCode = statusCode === ORDER_STATUS.reserved ? ORDER_STATUS.cancelled : ORDER_STATUS.refunded;
      order.status = getOrderStatusLabel(order.statusCode);
      order.updatedAt = new Date().toISOString();
    }
  });
  hall.seats = buildSeats(hall.rows, hall.seatsPerRow, hall.id);
  selectedSeatKeys = [];
  recommendedSeatKeys = [];
  saveState();
  setAdminSeatStatus(`${hall.name}已重置为初始座位状态，关联的有效订单已关闭。`, "success");
  renderCurrentHall();
  renderAdminDashboard();
}

function renderAdminOrders() {
  const orders = state.orders;
  dom.adminOrderSummary.textContent = `${orders.length} 笔`;
  if (!orders.length) {
    dom.adminOrderList.innerHTML = '<p class="order-empty">暂无订单记录。</p>';
    return;
  }

  dom.adminOrderList.innerHTML = orders.map((order) => {
    const statusCode = order.statusCode || getOrderStatusCode(order.status);
    const action = statusCode === ORDER_STATUS.reserved
      ? `<button class="ghost-btn" type="button" data-admin-order-action="cancel" data-order-no="${escapeHtml(order.orderNo)}">取消预订</button>`
      : statusCode === ORDER_STATUS.purchased
        ? `<button class="ghost-btn" type="button" data-admin-order-action="refund" data-order-no="${escapeHtml(order.orderNo)}">退票</button>`
        : "";
    return `
      <article class="order-card admin-order-card">
        <div class="order-card__top">
          <strong class="order-card__number">${escapeHtml(order.orderNo)}</strong>
          <span class="order-status-badge order-status-badge--${escapeHtml(statusCode)}">${escapeHtml(getOrderStatusLabel(statusCode))}</span>
        </div>
        <p class="order-card__meta">${escapeHtml(order.username || "未知用户")} · ${escapeHtml(order.hallName || "未知影厅")}</p>
        <p class="order-card__seats">${(order.seats || []).map(escapeHtml).join("、") || "座位信息缺失"}</p>
        <div class="order-card__footer">
          <time class="order-card__time">${escapeHtml(formatOrderTime(order.createdAt))}</time>
          ${action}
        </div>
      </article>
    `;
  }).join("");
}

function handleAdminOrderAction(event) {
  const actionButton = event.target.closest("[data-admin-order-action]");
  if (!actionButton || !isAdmin()) {
    return;
  }

  const order = state.orders.find((entry) => entry.orderNo === actionButton.dataset.orderNo);
  if (!order) {
    return;
  }

  if (actionButton.dataset.adminOrderAction === "cancel" && order.statusCode === ORDER_STATUS.reserved) {
    updateOrderStatus(order, ORDER_STATUS.cancelled);
    setAdminSeatStatus(`已取消预订订单 ${order.orderNo}，座位已释放。`, "success");
  }

  if (actionButton.dataset.adminOrderAction === "refund" && order.statusCode === ORDER_STATUS.purchased) {
    updateOrderStatus(order, ORDER_STATUS.refunded);
    setAdminSeatStatus(`已退票订单 ${order.orderNo}，座位已释放。`, "success");
  }
}

function renderAdminUsers() {
  const users = state.users.filter((user) => user.role === "user");
  dom.adminUserSummary.textContent = `${users.length} 人`;
  if (!users.length) {
    dom.adminUserList.innerHTML = '<p class="order-empty">暂无普通用户。</p>';
    return;
  }

  dom.adminUserList.innerHTML = users.map((user) => `
    <article class="admin-user-card">
      <strong>${escapeHtml(user.displayName || user.username)}</strong>
      <p>用户名：${escapeHtml(user.username)}</p>
      <p>会员等级：${escapeHtml(user.memberLevel || "normal")}</p>
      <time datetime="${escapeHtml(user.createdAt)}">注册时间：${escapeHtml(formatOrderTime(user.createdAt))}</time>
    </article>
  `).join("");
}

function setAdminSeatStatus(message, status = "idle") {
  dom.adminSeatStatus.textContent = message;
  dom.adminSeatStatus.className = "admin-status";
  if (status !== "idle") {
    dom.adminSeatStatus.classList.add(`is-${status}`);
  }
}

function getSeatStatusLabel(status) {
  const labels = {
    available: "空座",
    sold: "已售",
    reserved: "已预订",
    disabled: "维修 / 禁用"
  };
  return labels[status] || "未知状态";
}

function renderHeatPanel(hall) {
  if (!dom.heatVisibilityToggle || !dom.heatSourceStats || !dom.heatStatus) {
    return;
  }

  const heatSources = getHeatSourceSeats(hall);
  const reservedCount = heatSources.filter((source) => source.weight === 55).length;
  const purchasedCount = heatSources.filter((source) => source.weight === 80).length;

  dom.heatVisibilityToggle.checked = isHeatVisible;
  dom.heatSourceStats.innerHTML = `
    <article class="heat-source-stat">
      <span>附近已预订</span>
      <strong>${reservedCount} 个</strong>
    </article>
    <article class="heat-source-stat">
      <span>附近已购票</span>
      <strong>${purchasedCount} 个</strong>
    </article>
  `;
  dom.heatStatus.textContent = heatSources.length
    ? `${hall.name}有 ${heatSources.length} 个已预订或已购票座位；外围热度会参考它们，并向相邻 ${HEAT_RADIUS} 个座位逐渐减弱。`
    : "这里还没有预订或购票记录；产生记录后，外围热度会随之显示。";
}

function buildSelectionSummary() {
  const adjustmentHint = "点击可更换座位；需要多选时，请按住 Ctrl（Mac 可按 Command）再依次点击，也可以直接拖拽框选。";
  const recommendationIsSelected = recommendedSeatKeys.length > 0 &&
    recommendedSeatKeys.length === selectedSeatKeys.length &&
    recommendedSeatKeys.every((seatKey) => selectedSeatKeys.includes(seatKey));

  if (!selectedSeatKeys.length) {
    return recommendedSeatKeys.length
      ? `已为你标出推荐座位：青色外环是推荐结果，金色外环是手动调整。${adjustmentHint}`
      : `还没选座。点击可选择一个座位；需要多选时，请按住 Ctrl 再依次点击。`;
  }

  const seatText = selectedSeatKeys.map(formatSeatLabel).join("、");
  if (recommendationIsSelected) {
    return `已为你直接选中 ${selectedSeatKeys.length} 个推荐座位：${seatText}。不满意可以继续调整。`;
  }

  return recommendedSeatKeys.length
    ? `当前已选 ${selectedSeatKeys.length} 个座位：${seatText}。青色外环是推荐座位，金色外环是你手动调整的座位。${adjustmentHint}`
    : `当前已选 ${selectedSeatKeys.length} 个座位：${seatText}。${adjustmentHint}`;
}
function syncScreenState() {
  const user = getCurrentUser();
  if (!user) {
    showLoginView();
    return;
  }

  if (isAdmin()) {
    showAdminView();
    return;
  }

  showUserAppView();
}

function showLoginView() {
  dom.authScreen.hidden = false;
  dom.appScreen.hidden = true;
  dom.adminScreen.hidden = true;
}

function showUserAppView() {
  dom.authScreen.hidden = true;
  dom.appScreen.hidden = false;
  dom.adminScreen.hidden = true;
}

function showAdminView() {
  if (!isAdmin()) {
    setAuthMessage("无管理员权限。", "error");
    showLoginView();
    return;
  }

  dom.authScreen.hidden = true;
  dom.appScreen.hidden = true;
  dom.adminScreen.hidden = false;
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
    seatDisabled: styles.getPropertyValue("--seat-disabled").trim() || "#62758a",
    seatRecommendedRing: styles.getPropertyValue("--seat-recommended-ring").trim() || "#00f0ff",
    seatManualRing: styles.getPropertyValue("--seat-manual-ring").trim() || "#ffd66b",
    selectionFill: styles.getPropertyValue("--selection-fill").trim() || "rgba(84, 210, 255, 0.12)",
    selectionStroke: styles.getPropertyValue("--selection-stroke").trim() || "rgba(84, 210, 255, 0.92)"
  };
}

function getSeatColumn(seat) {
  return Number(seat.col || seat.number || 0);
}

function getHeatBorderColor(score) {
  if (score >= 55) return "#ef4444";
  if (score >= 25) return "#facc15";
  return "#3b82f6";
}

function drawRoundedRectPath(context, left, top, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(radius, width / 2, height / 2));
  context.beginPath();

  if (typeof context.roundRect === "function") {
    context.roundRect(left, top, width, height, safeRadius);
    return;
  }

  context.moveTo(left + safeRadius, top);
  context.lineTo(left + width - safeRadius, top);
  context.quadraticCurveTo(left + width, top, left + width, top + safeRadius);
  context.lineTo(left + width, top + height - safeRadius);
  context.quadraticCurveTo(left + width, top + height, left + width - safeRadius, top + height);
  context.lineTo(left + safeRadius, top + height);
  context.quadraticCurveTo(left, top + height, left, top + height - safeRadius);
  context.lineTo(left, top + safeRadius);
  context.quadraticCurveTo(left, top, left + safeRadius, top);
  context.closePath();
}

function drawRoundedSeatPath(context, x, y, halfSize) {
  const size = halfSize * 2;
  drawRoundedRectPath(context, x - halfSize, y - halfSize, size, size, Math.max(2, halfSize * 0.45));
}

function isPointInsideSeat(pointerX, pointerY, seat, padding = 4) {
  const halfSize = seat.radius + padding;
  return Math.abs(pointerX - seat.x) <= halfSize && Math.abs(pointerY - seat.y) <= halfSize;
}

function normalizeSeatId(seat) {
  if (typeof seat === "string") {
    const match = seat.match(/(\d+)\D+(\d+)/);
    return match ? `${Number(match[1])}-${Number(match[2])}` : null;
  }

  if (!seat || typeof seat !== "object") {
    return null;
  }

  if (seat.seatId || seat.id) {
    return normalizeSeatId(seat.seatId || seat.id);
  }

  const row = Number(seat.row);
  const column = Number(seat.col || seat.number);
  if (Number.isInteger(row) && Number.isInteger(column) && row > 0 && column > 0) {
    return `${row}-${column}`;
  }

  return seat.label ? normalizeSeatId(seat.label) : null;
}

function buildSeatMap(hall) {
  const seatMap = new Map();
  hall.seats.forEach((seat) => {
    const seatId = normalizeSeatId(seat);
    if (seatId) {
      seatMap.set(seatId, seat);
    }
  });
  return seatMap;
}

function getValidOrdersForHeat() {
  const orderCollections = [Array.isArray(state.orders) ? state.orders : []];
  [STORAGE_KEY, "orders", "smartCinemaOrders", "cinemaOrders"].forEach((key) => {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        orderCollections.push(parsed);
      } else if (Array.isArray(parsed.orders)) {
        orderCollections.push(parsed.orders);
      }
    } catch (error) {
      // Ignore unrelated or malformed local storage without affecting seat selection.
    }
  });

  const seenOrders = new Set();
  return orderCollections
    .flat()
    .filter((order, index) => {
      const orderKey = order?.orderNo || order?.id || `heat-order-${index}-${JSON.stringify(order)}`;
      if (seenOrders.has(orderKey)) {
        return false;
      }
      seenOrders.add(orderKey);
      return getOrderHeatWeight(order) > 0;
    });
}

function getOrderHeatWeight(order) {
  const statuses = [order?.status, order?.statusCode]
    .filter(Boolean)
    .map((status) => String(status).trim().toLowerCase());
  const invalidStatuses = ["cancelled", "canceled", "refunded", "已取消", "已退票"];
  const purchasedStatuses = ["paid", "purchased", "sold", "completed", "已购票", "已售"];
  const reservedStatuses = ["reserved", "booked", "已预订"];

  if (statuses.some((status) => invalidStatuses.includes(status))) {
    return 0;
  }

  if (statuses.some((status) => purchasedStatuses.includes(status))) {
    return 80;
  }

  return statuses.some((status) => reservedStatuses.includes(status)) ? 55 : 0;
}

function doesOrderMatchHall(order, hall) {
  const orderHallValues = [order.hallId, order.hallName, order.hall, order.roomId, order.roomName]
    .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
    .map((value) => String(value).trim().toLowerCase());

  if (!orderHallValues.length) {
    return true;
  }

  const hallValues = [hall.id, hall.name, hall.type]
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());
  return orderHallValues.some((value) => hallValues.includes(value));
}

function getOrderSeatEntries(order) {
  const seatFields = [order.seatKeys, order.seats, order.seatList, order.selectedSeats, order.seatIds, order.seat];
  const entries = seatFields.find((field) => Array.isArray(field));

  if (entries) {
    return entries;
  }

  const singleEntry = seatFields.find((field) => field != null && !Array.isArray(field));
  return singleEntry == null ? [] : [singleEntry];
}

function getSeatHeatWeight(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (["paid", "purchased", "sold", "completed", "已购票", "已售"].includes(normalizedStatus)) {
    return 80;
  }

  return ["reserved", "booked", "已预订"].includes(normalizedStatus) ? 55 : 0;
}

function getHeatSourceSeats(hall) {
  const seatMap = buildSeatMap(hall);
  const sourceWeights = new Map();

  hall.seats.forEach((seat) => {
    const seatId = normalizeSeatId(seat);
    const weight = getSeatHeatWeight(seat.status);
    if (seatId && weight) {
      sourceWeights.set(seatId, weight);
    }
  });

  getValidOrdersForHeat()
    .filter((order) => doesOrderMatchHall(order, hall))
    .forEach((order) => {
      const weight = getOrderHeatWeight(order);
      getOrderSeatEntries(order).forEach((entry) => {
        const seatId = normalizeSeatId(entry);
        if (seatId && seatMap.has(seatId)) {
          sourceWeights.set(seatId, Math.max(sourceWeights.get(seatId) || 0, weight));
        }
      });
    });

  return [...sourceWeights.entries()]
    .map(([seatId, weight]) => {
      const seat = seatMap.get(seatId);
      return {
        row: Number(seat.row),
        col: getSeatColumn(seat),
        weight
      };
    })
    .filter((source) => source.row > 0 && source.col > 0);
}

function getSeatDistance(seat, source) {
  const rowDiff = Number(seat.row) - Number(source.row);
  const colDiff = getSeatColumn(seat) - Number(source.col);
  return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
}

function getHeatInfluenceByDistance(distance, sourceWeight) {
  const isPaidSource = sourceWeight >= 80;

  if (isPaidSource) {
    if (distance === 0) return 80;
    if (distance <= 1) return 30;
    if (distance <= 2) return 14;
    if (distance <= HEAT_RADIUS) return 6;
    return 0;
  }

  if (distance === 0) return 55;
  if (distance <= 1) return 20;
  if (distance <= 2) return 9;
  if (distance <= HEAT_RADIUS) return 4;
  return 0;
}

function calculateSeatHeat(seat, hall, heatSources = getHeatSourceSeats(hall)) {
  const heatScore = heatSources.reduce((total, source) => {
    const distance = getSeatDistance(seat, source);
    return total + getHeatInfluenceByDistance(distance, source.weight);
  }, 0);

  return Math.round(clamp(heatScore, 0, 100));
}

function renderSeatCanvas(hall, isLoggedIn) {
  const canvas = dom.canvas;
  const containerWidth = canvas.parentElement.clientWidth;
  const pixelRatio = window.devicePixelRatio || 1;
  const logicalWidth = Math.max(320, Math.min(1240, containerWidth));
  const logicalHeight = 760;
  const viewport = getSeatViewport(hall);
  const zoomEnabled = isSeatZoomEnabled(hall);

  seatCanvasLogicalSize = { width: logicalWidth, height: logicalHeight };
  canvas.width = logicalWidth * pixelRatio;
  canvas.height = logicalHeight * pixelRatio;
  canvas.style.width = `${logicalWidth}px`;
  canvas.style.height = `${logicalHeight}px`;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const palette = getSeatPalette();
  ctx.clearRect(0, 0, logicalWidth, logicalHeight);
  ctx.save();
  if (zoomEnabled) {
    const scale = 1 / viewport.width;
    ctx.scale(scale, scale);
    ctx.translate(-viewport.x * logicalWidth, -viewport.y * logicalHeight);
  }
  drawCanvasChrome(logicalWidth, logicalHeight, hall, isLoggedIn, palette);
  renderedSeats = drawSeats(hall, logicalWidth, isLoggedIn, palette);
  drawDragSelectionOverlay(palette);
  ctx.restore();
  renderSeatMiniMap(hall, palette);
}

function renderSeatMiniMap(hall, palette) {
  if (!miniMapCtx || !dom.seatMiniMap || !dom.seatOverviewViewport || !isSeatZoomEnabled(hall)) {
    return;
  }

  const pixelRatio = window.devicePixelRatio || 1;
  const logicalWidth = Math.max(110, dom.seatMiniMap.clientWidth || 128);
  const logicalHeight = Math.max(42, dom.seatMiniMap.clientHeight || 48);
  dom.seatMiniMap.width = logicalWidth * pixelRatio;
  dom.seatMiniMap.height = logicalHeight * pixelRatio;
  miniMapCtx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  miniMapCtx.clearRect(0, 0, logicalWidth, logicalHeight);
  miniMapCtx.fillStyle = "#101722";
  miniMapCtx.fillRect(0, 0, logicalWidth, logicalHeight);

  const screenWidth = logicalWidth * 0.52;
  miniMapCtx.strokeStyle = "rgba(111, 231, 255, 0.7)";
  miniMapCtx.lineWidth = 1;
  miniMapCtx.beginPath();
  miniMapCtx.moveTo((logicalWidth - screenWidth) / 2, 7);
  miniMapCtx.lineTo((logicalWidth + screenWidth) / 2, 7);
  miniMapCtx.stroke();

  const seatWidth = hall.seatsPerRow >= 30 ? 2.1 : 2.7;
  const seatHeight = 2.2;
  renderedSeats.forEach((seat) => {
    const isSelected = selectedSeatKeys.includes(seat.key);
    const isRecommended = recommendedSeatKeys.includes(seat.key);
    const fillColor = seat.status === "sold"
      ? palette.seatSold
      : seat.status === "reserved"
        ? palette.seatReserved
        : seat.status === "disabled"
          ? palette.seatDisabled
          : isSelected
            ? palette.seatSelected
            : isRecommended
              ? palette.seatRecommendedRing
              : palette.seatAvailable;
    const x = (seat.x / seatCanvasLogicalSize.width) * logicalWidth;
    const y = (seat.y / seatCanvasLogicalSize.height) * logicalHeight;
    miniMapCtx.fillStyle = fillColor;
    drawRoundedRectPath(miniMapCtx, x - seatWidth / 2, y - seatHeight / 2, seatWidth, seatHeight, 0.8);
    miniMapCtx.fill();
  });

  const viewport = getSeatViewport(hall);
  dom.seatOverviewViewport.style.left = `${viewport.x * 100}%`;
  dom.seatOverviewViewport.style.top = `${viewport.y * 100}%`;
  dom.seatOverviewViewport.style.width = `${viewport.width * 100}%`;
  dom.seatOverviewViewport.style.height = `${viewport.height * 100}%`;
}

function drawCanvasChrome(width, height, hall, isLoggedIn, palette) {
  const fontScale = accessibilityState.largeText ? 1.4 : 1;
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
    isLoggedIn ? "点击座位即可选择或调整" : "登录后即可开始选座",
    width / 2,
    height - 26
  );
}

function drawSeats(hall, width, isLoggedIn, palette) {
  const fontScale = accessibilityState.largeText ? 1.4 : 1;
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
  const heatSources = getHeatSourceSeats(hall);

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
      const heatScore = calculateSeatHeat(seatData, hall, heatSources);
      const heatBorderColor = getHeatBorderColor(heatScore);
      const fillColor = seatData.status === "sold"
        ? palette.seatSold
        : seatData.status === "reserved"
          ? palette.seatReserved
          : seatData.status === "disabled"
            ? palette.seatDisabled
          : isSelected
            ? palette.seatSelected
            : palette.seatAvailable;

      ctx.save();
      drawRoundedSeatPath(ctx, x, y, seatRadius);
      ctx.fillStyle = fillColor;
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isHeatVisible) {
        drawRoundedSeatPath(ctx, x, y, seatRadius + 1.2);
        ctx.strokeStyle = heatBorderColor;
        ctx.lineWidth = Math.max(1, Math.min(2, seatRadius * 0.2));
        ctx.shadowColor = heatBorderColor;
        ctx.shadowBlur = heatScore >= 55 ? 4 : 2;
      } else {
        drawRoundedSeatPath(ctx, x, y, seatRadius);
        ctx.strokeStyle = isLoggedIn ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.28)";
        ctx.lineWidth = isLoggedIn ? 1.5 : 1;
      }
      ctx.stroke();
      ctx.restore();

      if (isRecommended) {
        ctx.save();
        drawRoundedSeatPath(ctx, x, y, seatRadius + 4);
        ctx.strokeStyle = palette.seatRecommendedRing;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = palette.seatRecommendedRing;
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();
      }

      if (isManualSelected) {
        ctx.save();
        drawRoundedSeatPath(ctx, x, y, seatRadius + 4);
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
    setAuthMessage("登录后即可开始选座。", "error");
    return;
  }

  if (!isNormalUser()) {
    return;
  }

  const { x: pointerX, y: pointerY } = getCanvasPoint(event);

  const hitSeat = renderedSeats.find((seat) => isPointInsideSeat(pointerX, pointerY, seat));

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
  if (!isNormalUser()) {
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
  const displayX = ((event.clientX - rect.left) / rect.width) * logicalWidth;
  const displayY = ((event.clientY - rect.top) / rect.height) * logicalHeight;
  const hall = state.halls[selectedHallId];
  const viewport = getSeatViewport(hall);

  return {
    x: viewport.x * logicalWidth + displayX * viewport.width,
    y: viewport.y * logicalHeight + displayY * viewport.height
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
    message: "票型已更换，补全同行信息后，我们再为你挑选座位。",
    summary: "填写同行信息后，即可为你推荐。"
  });
  renderRecommendationForm();
  renderCurrentHall();
}

function handleMemberCountInput() {
  const rawValue = dom.memberCountInput.value.trim();
  if (rawValue === "") {
    return;
  }

  const config = TICKET_TYPE_CONFIG[dom.ticketTypeSelect.value];
  const nextCount = Number(rawValue);
  if (!Number.isInteger(nextCount) || nextCount < config.min || nextCount > config.max) {
    return;
  }

  handleMemberCountChange();
}

function handleMemberCountChange() {
  const config = TICKET_TYPE_CONFIG[dom.ticketTypeSelect.value];
  const rawValue = dom.memberCountInput.value.trim();
  const nextCount = rawValue === "" ? config.defaultCount : Number(rawValue);
  const currentDraft = readRecommendationDraftFromDOM();
  recommendationDraft = normalizeRecommendationDraft({
    ...currentDraft,
    memberCount: nextCount
  });
  clearRecommendation({
    keepSelection: true,
    status: "idle",
    message: "同行人数已更新，重新推荐后会按新人数为你选座。",
    summary: "填写同行信息后，即可为你推荐。"
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
    setAuthMessage("登录后即可开始选座。", "error");
    return;
  }

  if (!isNormalUser()) {
    setAuthMessage("管理员账号请在后台管理座位和订单。", "error");
    return;
  }

  recommendationDraft = readRecommendationDraftFromDOM();
  const validation = validateRecommendationDraft(recommendationDraft);

  if (!validation.valid) {
    recommendationState = {
      status: "error",
      message: validation.message,
      summary: "这次还没能为你推荐座位。",
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
      summary: "暂时没找到合适的连座，可以换个影厅或调整同行人数。",
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
  speakMessage(`已经为你们挑好${result.seatKeys.length}个座位。`);
}

function handleClearRecommendation() {
  const recommendedKeys = new Set(recommendedSeatKeys);
  selectedSeatKeys = selectedSeatKeys.filter((seatKey) => !recommendedKeys.has(seatKey));

  clearRecommendation({
    keepSelection: true,
    status: "idle",
    message: "推荐已清空，你可以重新推荐，也可以继续手动选座。",
    summary: "填写同行信息后，即可为你推荐。"
  });
  renderCurrentHall();
}

function handleUserRating(rating) {
  if (!isNormalUser()) {
    return;
  }

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

  const usesScrollableMembers = recommendationDraft.members.length > 3;
  dom.memberFields.classList.toggle("is-scrollable", usesScrollableMembers);
  dom.memberFields.setAttribute(
    "aria-label",
    usesScrollableMembers ? "同行成员信息，可上下滚动" : "同行成员信息"
  );
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
    message: "选好票型并填写同行人的信息，我们会在当前影厅为你挑选合适的空座。",
    summary: "填写同行信息后，即可为你推荐。",
    reasons: []
  };
}

function clearRecommendation(options = {}) {
  const {
    keepSelection = true,
    status = "idle",
    message = "选好票型并填写同行人的信息，我们会在当前影厅为你挑选合适的空座。",
    summary = "填写同行信息后，即可为你推荐。",
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
    message: "选好座位后，我们会从距离、视角、周边空位和同行规则四方面提供观影参考。",
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
    dom.userRatingText.textContent = "选好座位后，就可以留下你的观影期待评分。";
    return;
  }

  dom.userRatingText.textContent = userSeatRating
    ? `你的评分是 ${userSeatRating} / 5 星，综合结果已为你更新。`
    : "还没有你的评分，先为你展示座位参考分。";
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
        ? `综合结果已加入你的 ${userSeatRating} / 5 星评分。`
        : "还没有你的评分，综合结果暂按座位参考分展示。"
    ]
  };
}

function calculateDistanceMetric(hall, selectedSeats) {
  const idealRow = Math.round(hall.rows * 0.6);
  const averageRow = selectedSeats.reduce((sum, seat) => sum + seat.row, 0) / selectedSeats.length;
  const maxDiff = Math.max(idealRow - 1, hall.rows - idealRow, 1);
  const diff = Math.abs(averageRow - idealRow);
  const score = clamp(Math.round(35 * (1 - diff / maxDiff)), 0, 35);

  let reason = "这组座位离银幕远近适中，大多数观众看起来会比较舒适。";
  if (averageRow <= hall.rows * 0.35) {
    reason = "这组座位比较靠前，临场感更强，长时间观看可能更容易疲劳。";
  } else if (averageRow >= hall.rows * 0.8) {
    reason = "这组座位比较靠后，画面更完整，不过沉浸感会稍弱。";
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

  let reason = "这组座位靠近影厅中间，观看视角比较居中。";
  if (averageCenterDistance > hall.seatsPerRow * 0.22) {
    reason = "这组座位稍微偏向一侧，观看时左右视角会有一点倾斜。";
  } else if (averageCenterDistance > hall.seatsPerRow * 0.12) {
    reason = "这组座位横向位置比较均衡，整体接近中间。";
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

  let reason = "这组座位周围空位较多，观影时会更宽松。";
  if (ratio < 0.3) {
    reason = "这组座位周边空位较少，观影时可能会稍显拥挤。";
  } else if (ratio < 0.55) {
    reason = "这组座位周边还有一些空位，宽松程度适中。";
  }

  return { score, reason };
}

function calculateRuleMatchMetric(hall, selectedSeats, audienceContext) {
  if (!audienceContext.valid) {
    return {
      score: 12,
      status: "warning",
      reason: `同行信息还没填完整，我们暂按普通成人观影情况提供参考。${audienceContext.message}`
    };
  }

  const draft = audienceContext.draft;
  const restriction = calculateAudienceRestriction(draft.members, hall.rows);
  const issues = [];
  let score = 20;

  if (selectedSeats.length !== draft.members.length) {
    issues.push("座位数量和同行人数还没有对应。");
    score -= 8;
  }

  if (restriction.hasMinor && selectedSeats.some((seat) => seat.row <= 3)) {
    issues.push("同行人中有未满 15 岁的观众，请避开前 3 排。");
    score -= 8;
  }

  if (restriction.hasSenior && selectedSeats.some((seat) => seat.row > hall.rows - 3)) {
    issues.push("同行人中有 60 岁以上的观众，请避开最后 3 排。");
    score -= 8;
  }

  const arrangementCheck = evaluateTicketArrangement(draft.ticketType, selectedSeats);
  score -= arrangementCheck.penalty;
  issues.push(...arrangementCheck.issues);

  if (!issues.length) {
    return {
      score,
      status: "success",
      reason: "这组座位符合同行人的年龄安排和票型要求。"
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
      issues.push("个人票请保留 1 个座位。");
      penalty += 10;
    }
    return { issues, penalty };
  }

  if (ticketType === "couple") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("情侣票推荐同排连座，这两个座位还没有相连。");
      penalty += 10;
    }
    return { issues, penalty };
  }

  if (ticketType === "family") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("家庭同行推荐连座，这组座位还没有全部相连。");
      penalty += 5;
    }

    const averageRow = sortedSeats.reduce((sum, seat) => sum + seat.row, 0) / sortedSeats.length;
    if (averageRow < 5) {
      issues.push("家庭观影更推荐中后排，这组座位稍微靠前。");
      penalty += 3;
    }

    return { issues, penalty };
  }

  if (ticketType === "group") {
    if (!isSameRowConsecutive(sortedSeats)) {
      issues.push("团体票需要同排连座，这组座位还没有全部相连。");
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
    return `座位参考分为 ${score} / 100（${grade}）。同行信息尚未填全，目前先按普通成人观影情况计算；补充后会立即更新。`;
  }

  if (userRating) {
    return `座位参考分为 ${score} / 100（${grade}），并已结合你的 ${userRating} 星评分更新综合结果。`;
  }

  return `座位参考分为 ${score} / 100（${grade}）。你也可以给出 1–5 星评分，看看更贴近自己的综合结果。`;
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
        message: `${config.label}支持 ${config.min}–${config.max} 人同行，请在这个范围内填写人数。`
      };
    }
  }

  if (normalizedDraft.members.length !== expectedCount) {
    return {
      valid: false,
      message: "同行信息和票型人数没有对应，请核对后再试。"
    };
  }

  for (const [index, member] of normalizedDraft.members.entries()) {
    if (!member.name) {
      return {
        valid: false,
        message: `请补充${getMemberLabel(normalizedDraft.ticketType, index)}的姓名，方便我们为每位观众安排座位。`
      };
    }

    const age = Number(member.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      return {
        valid: false,
        message: `请填写${getMemberLabel(normalizedDraft.ticketType, index)}的年龄（1–120 岁），我们会据此避开不合适的排数。`
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
      message: `${hall.name}每排最多 ${hall.seatsPerRow} 个座位，暂时无法让这组同行人坐在同一排；可以换个影厅或调整人数。`,
      reasons: []
    };
  }

  if (restriction.minRow > restriction.maxRow) {
    return {
      success: false,
      message: "同行人的年龄安排暂时找不到都合适的排数，可以调整同行组合或换个影厅。",
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
    message: `已在${hall.name}为你找到符合${ticketConfig.label}要求的座位，并在座位图中标亮。`,
    summary: `为你推荐：${seatLabels.join("、")}`,
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
    reasons.push("为你挑了距离银幕适中、视角更稳定的单人座位。");
  }

  if (ticketType === "couple") {
    reasons.push("为你们挑了靠近中间区域的连续双座，方便并排观影。");
  }

  if (ticketType === "family") {
    reasons.push("为家人挑了中后排连座，既方便坐在一起，也兼顾观影视野。");
  }

  if (ticketType === "group") {
    reasons.push("这组座位同排相连，同行成员可以坐在一起。");
  }

  if (restriction.hasMinor) {
    reasons.push("同行人中有未满 15 岁的观众，已为你避开前 3 排。");
  }

  if (restriction.hasSenior) {
    reasons.push("同行人中有 60 岁以上的观众，已为你避开最后 3 排。");
  }

  reasons.push(`推荐位于第 ${candidate.row} 排，${rowTone}。`);
  reasons.push(centerTone);
  reasons.push("推荐座位已经标亮；如果不合心意，直接点击座位就能调整。");

  return reasons;
}

function buildRestrictionReasons(ticketType, restriction) {
  const reasons = [];

  if (ticketType === "couple") {
    reasons.push("情侣票需要连续双座，我们会优先为你寻找中间区域。");
  }

  if (ticketType === "family") {
    reasons.push("家庭票优先安排连座，方便家人坐在一起。");
  }

  if (ticketType === "group") {
    reasons.push("团体票需要同排连续就坐，不能拆分到不同排或区域。");
  }

  if (restriction.hasMinor) {
    reasons.push("同行人中有未满 15 岁的观众，请避开前 3 排。");
  }

  if (restriction.hasSenior) {
    reasons.push("同行人中有 60 岁以上的观众，请避开最后 3 排。");
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

  return `抱歉，${hall.name}暂时没有适合${ticketLabel}${audienceCount}人的${continuityText}座位${ruleSuffix}。可以换个影厅或调整人数，我们再帮你找找。`;
}

function describeRowTone(row, totalRows) {
  const ratio = row / totalRows;

  if (ratio <= 0.4) {
    return "距离银幕稍近，但仍在可选范围内";
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
    return "座位靠近影厅中间，观看视角会比较舒服。";
  }

  if (centerDistance <= seatsPerRow * 0.22) {
    return "座位横向位置比较均衡，视野和舒适度都照顾到了。";
  }

  return "位置不在正中心，但优先为同行人保留了连座并满足相应要求。";
}

function syncCurrentUserUI() {
  const user = getCurrentUser();
  dom.currentUserName.textContent = user ? user.displayName : "未登录";
  dom.currentUserRole.textContent = user ? roleLabel(user.role) : "访客";
  dom.currentUserStatus.textContent = isNormalUser() ? "已解锁选座台" : "请先登录";
  dom.heroUserName.textContent = user ? user.displayName : "未登录";
  dom.heroUserRole.textContent = user ? roleLabel(user.role) : "访客";
  dom.adminUserName.textContent = isAdmin() ? (user.displayName || user.username) : "管理员";
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
  const session = readCurrentUserSession();
  const sessionUser = session
    ? state.users.find((user) => user.id === session.id && user.role === session.role)
    : null;

  if (sessionUser && !sessionUser.disabled) {
    return sessionUser;
  }

  const legacyUser = state.users.find((user) => user.id === state.currentUserId && !user.disabled) || null;
  if (legacyUser) {
    persistCurrentUserSession(legacyUser);
  }

  return legacyUser;
}

function isAdmin() {
  const user = getCurrentUser();
  return Boolean(user && user.role === "admin");
}

function isNormalUser() {
  const user = getCurrentUser();
  return Boolean(user && user.role === "user");
}

function setCurrentUser(user) {
  state.currentUserId = user.id;
  persistCurrentUserSession(user);
  saveState();
}

function clearCurrentUser() {
  state.currentUserId = null;
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

function persistCurrentUserSession(user) {
  localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify({
    id: user.id,
    username: user.username,
    role: user.role,
    memberLevel: user.memberLevel,
    loginAt: new Date().toISOString()
  }));
}

function readCurrentUserSession() {
  try {
    const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    return null;
  }
}

function roleLabel(role) {
  return role === "admin" ? "管理员" : "普通会员";
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
    users: Array.isArray(savedState.users) ? savedState.users.map(normalizeUser) : [],
    orders: normalizedOrders
  };
}

function saveState() {
  state.users = state.users.map(normalizeUser);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.users));
}

function initializeUserData() {
  const storedUsers = readStoredUsers();
  state.users = mergeUsers(state.users, storedUsers);
  initDefaultAdmin();

  const legacyCurrentUser = state.users.find((user) => user.id === state.currentUserId);
  if (!readCurrentUserSession() && legacyCurrentUser) {
    persistCurrentUserSession(legacyCurrentUser);
  }

  saveState();
}

function readStoredUsers() {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    const users = saved ? JSON.parse(saved) : [];
    return Array.isArray(users) ? users.map(normalizeUser) : [];
  } catch (error) {
    return [];
  }
}

function mergeUsers(...collections) {
  const usersByUsername = new Map();

  collections.flat().filter(Boolean).forEach((entry) => {
    const user = normalizeUser(entry);
    if (!user.username) {
      return;
    }

    usersByUsername.set(user.username.toLowerCase(), user);
  });

  return [...usersByUsername.values()];
}

function normalizeUser(user) {
  const username = String(user?.username || "").trim();
  const role = user?.role === "admin" ? "admin" : "user";
  const isLegacyDefaultAdmin = username === "admin"
    && role === "admin"
    && user?.id === "admin_001"
    && user?.password === "admin123";

  return {
    id: isLegacyDefaultAdmin ? "admin-001" : String(user?.id || `user-${Date.now()}`),
    username,
    displayName: String(user?.displayName || (role === "admin" ? "系统管理员" : username)),
    password: isLegacyDefaultAdmin ? "Admin@123" : String(user?.password || ""),
    role,
    memberLevel: role === "admin" ? "admin" : (user?.memberLevel === "vip" ? "vip" : "normal"),
    createdAt: user?.createdAt || new Date().toISOString(),
    disabled: Boolean(user?.disabled)
  };
}

function initDefaultAdmin() {
  const adminUser = state.users.find((user) => user.username.toLowerCase() === "admin");
  if (adminUser && adminUser.role === "admin") {
    return;
  }

  if (adminUser) {
    Object.assign(adminUser, {
      id: "admin-001",
      displayName: "系统管理员",
      password: "Admin@123",
      role: "admin",
      memberLevel: "admin",
      disabled: false
    });
    return;
  }

  state.users.push({
    id: "admin-001",
    username: "admin",
    displayName: "系统管理员",
    password: "Admin@123",
    role: "admin",
    memberLevel: "admin",
    createdAt: new Date().toISOString(),
    disabled: false
  });
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
    users: [],
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
