const STORAGE_KEY = "smartCinemaState";
const USER_STORAGE_KEY = "smartCinemaUsers";
const CURRENT_USER_STORAGE_KEY = "smartCinemaCurrentUser";
const TAB_SESSION_STORAGE_KEY = "smartCinemaTabSession";
const TAB_ID_STORAGE_KEY = "smartCinemaRealtimeTabId";
const REALTIME_CHANNEL_NAME = "smartCinemaRealtime";
const REALTIME_LOCK_NAME = "smartCinemaSeatTransaction";
const WEBSOCKET_PATH = "/ws";
const WEBSOCKET_RECONNECT_DELAY = 2000;
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
  accessibilityMenuBtn: document.getElementById("accessibilityMenuBtn"),
  accessibilityMenu: document.getElementById("accessibilityMenu"),
  accessibilityMenuCloseBtn: document.getElementById("accessibilityMenuCloseBtn"),
  userAppHeader: document.getElementById("userAppHeader"),
  userWorkspace: document.getElementById("userWorkspace"),
  orderScreen: document.getElementById("orderScreen"),
  orderPageTitle: document.getElementById("orderPageTitle"),
  backToSeatsBtn: document.getElementById("backToSeatsBtn"),
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
  viewOrdersBtn: document.getElementById("viewOrdersBtn"),
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
  adminUserList: document.getElementById("adminUserList"),
  realtimeStatuses: [...document.querySelectorAll("[data-realtime-status]")]
};

const ctx = dom.canvas.getContext("2d");
const miniMapCtx = dom.seatMiniMap ? dom.seatMiniMap.getContext("2d") : null;
const adminCtx = dom.adminCanvas ? dom.adminCanvas.getContext("2d") : null;
const realtimeTabId = getOrCreateRealtimeTabId();
const realtimeChannel = typeof BroadcastChannel === "function"
  ? new BroadcastChannel(REALTIME_CHANNEL_NAME)
  : null;
let lastRealtimeRevision = "";
let serverRevision = "";
let websocket = null;
let websocketReconnectTimer = null;
let websocketReconnectAttempts = 0;
let serverTransactionContext = null;
const pendingSocketCommits = new Map();

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
  initializeRealtimeSync();
  initializeWebSocketSync();
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
  dom.accessibilityMenuBtn.addEventListener("click", handleAccessibilityMenuToggle);
  dom.accessibilityMenuCloseBtn.addEventListener("click", () => setAccessibilityMenuOpen(false, true));
  document.addEventListener("click", handleAccessibilityDocumentClick);
  document.addEventListener("keydown", handleAccessibilityDocumentKeyDown);
  dom.viewOrdersBtn.addEventListener("click", handleOpenOrderPage);
  dom.backToSeatsBtn.addEventListener("click", handleReturnToMainPage);
  dom.reserveOrderBtn.addEventListener("click", () => void handleCreateOrder(ORDER_STATUS.reserved));
  dom.purchaseOrderBtn.addEventListener("click", () => void handleCreateOrder(ORDER_STATUS.purchased));
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

/* ================================================================
   局部放大视图（中厅/大厅专用）
   ----------------------------------------------------------------
   小厅座位少（10×10），始终显示全厅；中厅(20×10)、大厅(30×10)座位多，
   在"全局视图"和"局部放大"之间切换。局部放大时只渲染视口(viewport)内的
   座位，并用左上角缩略图(seatOverview)导航。viewport 用 0~1 的比例坐标。
   ================================================================ */

/**
 * 当前影厅是否处于局部放大模式。小厅永远返回 false。
 */
function isSeatZoomEnabled(hall) {
  return Boolean(hall && hall.id !== "small" && seatViewModes[hall.id] === "zoom");
}

/**
 * 取当前影厅的可视区域(viewport)。未放大时返回占满全厅的 {0,0,1,1}。
 * 放大时返回 seatViewports[hall.id]，如 {x:0.22, y:0.2, width:0.56, height:0.56}，
 * 表示只看左上 22%/20% 起、宽高各 56% 的那块区域。
 */
function getSeatViewport(hall) {
  if (!isSeatZoomEnabled(hall)) {
    return { x: 0, y: 0, width: 1, height: 1 };
  }

  return seatViewports[hall.id];
}

/**
 * 根据当前影厅刷新"放大/全局"按钮、缩略图显隐和提示文案。
 * 小厅不支持放大，按钮隐藏；中大厅切换按钮文案与状态样式。
 */
function renderSeatViewControls(hall) {
  if (!dom.seatViewModeBtn || !dom.seatOverview) {
    return;
  }

  const supportsZoom = hall.id !== "small"; // 小厅座位少，不需要放大
  const zoomEnabled = supportsZoom && isSeatZoomEnabled(hall);
  dom.seatViewModeBtn.hidden = !supportsZoom;
  dom.seatViewModeBtn.classList.toggle("is-zoomed", zoomEnabled);
  dom.seatViewModeBtn.setAttribute("aria-pressed", String(zoomEnabled));
  dom.seatViewModeBtn.textContent = zoomEnabled ? "切换全局视图" : "开启局部放大";
  dom.seatOverview.hidden = !zoomEnabled; // 缩略导航只在放大时出现
  dom.canvas.parentElement.classList.toggle("is-zoomed", zoomEnabled);

  if (dom.seatViewHint) {
    dom.seatViewHint.textContent = !supportsZoom
      ? "小厅座位较少，始终显示全厅"
      : zoomEnabled
        ? "局部放大模式 · 拖动左上角亮框移动区域"
        : "全局模式 · 一次查看全部座位";
  }
}

/**
 * 点击"切换全局/局部"按钮：在中大厅上翻转 seatViewModes，并清空拖拽选区。
 */
function handleSeatViewModeToggle() {
  const hall = state.halls[selectedHallId];
  if (!hall || hall.id === "small") {
    return;
  }

  seatViewModes[hall.id] = isSeatZoomEnabled(hall) ? "full" : "zoom";
  dragSelection = createEmptyDragSelection(); // 切换视图后清掉正在进行的框选
  renderCurrentHall();
}

/* ---- 缩略图(seatOverview)上的指针/键盘交互：拖亮框移动放大区域 ---- */

/**
 * 在缩略图上按下：开始拖动亮框(viewport)。若点在亮框内，则"抓住"亮框按偏移移动；
 * 若点在亮框外，则把亮框中心跳到点击点再开始拖。用 pointerCapture 保证移出元素仍能跟踪。
 */
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
  // 点在亮框内：记录指针相对亮框左上的偏移，后续移动保持这个偏移（像拖窗框）
  // 点在亮框外：偏移设为亮框一半，效果是亮框中心跳到指针位置
  miniMapDragOffset = startedOnViewport
    ? { x: point.x - viewport.x, y: point.y - viewport.y }
    : { x: viewport.width / 2, y: viewport.height / 2 };

  if (dom.seatOverviewMap.setPointerCapture) {
    dom.seatOverviewMap.setPointerCapture(event.pointerId);
  }
  updateSeatViewportFromOverviewPoint(hall, point);
}

/**
 * 缩略图上移动：仅处理本次按下捕获的指针，更新亮框位置并重绘 Canvas。
 */
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

/**
 * 松开：释放指针捕获，结束本次拖动。
 */
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

/**
 * 键盘方向键移动亮框（无障碍/精细调整）。Shift 加大步长。
 * clamp 保证亮框不超出 [0,1] 范围：x ∈ [0, 1-width]。
 */
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
  // 注意上限是 1 - viewport.width：亮框右边贴到 1 时就不能再往右
  viewport.x = clamp(viewport.x + direction[0] * step, 0, 1 - viewport.width);
  viewport.y = clamp(viewport.y + direction[1] * step, 0, 1 - viewport.height);
  renderSeatCanvasForCurrentView();
}

/**
 * 把鼠标客户端坐标换算成缩略图内的 0~1 比例坐标。
 */
function getSeatOverviewPoint(event) {
  const rect = dom.seatOverviewMap.getBoundingClientRect();
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1)
  };
}

/**
 * 用缩略图上的比例坐标更新亮框位置，并立刻重绘主 Canvas。
 * clamp 的上限 1-width 保证亮框不越界。
 */
function updateSeatViewportFromOverviewPoint(hall, point) {
  const viewport = seatViewports[hall.id];
  viewport.x = clamp(point.x - miniMapDragOffset.x, 0, 1 - viewport.width);
  viewport.y = clamp(point.y - miniMapDragOffset.y, 0, 1 - viewport.height);
  renderSeatCanvasForCurrentView();
}

/**
 * 用当前影厅和登录态重绘主 Canvas（放大模式下只画 viewport 内的座位）。
 */
function renderSeatCanvasForCurrentView() {
  const hall = state.halls[selectedHallId];
  const currentUser = getCurrentUser();
  renderSeatCanvas(hall, Boolean(currentUser && currentUser.role === "user"));
}

function handleAccessibilityMenuToggle() {
  setAccessibilityMenuOpen(dom.accessibilityMenu.hidden);
}

function handleAccessibilityDocumentClick(event) {
  if (
    dom.accessibilityMenu.hidden ||
    dom.accessibilityMenu.contains(event.target) ||
    dom.accessibilityMenuBtn.contains(event.target)
  ) {
    return;
  }

  setAccessibilityMenuOpen(false);
}

function handleAccessibilityDocumentKeyDown(event) {
  if (event.key !== "Escape" || dom.accessibilityMenu.hidden) {
    return;
  }

  event.preventDefault();
  setAccessibilityMenuOpen(false, true);
}

function setAccessibilityMenuOpen(isOpen, restoreFocus = false) {
  dom.accessibilityMenu.hidden = !isOpen;
  dom.accessibilityMenuBtn.setAttribute("aria-expanded", String(isOpen));

  if (isOpen) {
    window.requestAnimationFrame(() => dom.accessibilityMenuCloseBtn.focus({ preventScroll: true }));
    return;
  }

  if (restoreFocus) {
    dom.accessibilityMenuBtn.focus({ preventScroll: true });
  }
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

function resetAccessibilitySettings() {
  accessibilityState = createDefaultAccessibilityState();
  localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
  window.speechSynthesis?.cancel();
  setAccessibilityMenuOpen(false);
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

function handleOpenOrderPage() {
  if (!isNormalUser()) {
    return;
  }

  renderOrderCenter();
  setUserSubpage("orders");
}

function handleReturnToMainPage() {
  setUserSubpage("main");
}

function setUserSubpage(pageName, shouldFocus = true) {
  setAccessibilityMenuOpen(false);
  const showingOrders = pageName === "orders";
  dom.userAppHeader.hidden = showingOrders;
  dom.userWorkspace.hidden = showingOrders;
  dom.orderScreen.hidden = !showingOrders;

  if (!shouldFocus) {
    return;
  }

  window.scrollTo({ top: 0, behavior: "auto" });
  const focusTarget = showingOrders ? dom.orderPageTitle : dom.viewOrdersBtn;
  window.requestAnimationFrame(() => focusTarget.focus({ preventScroll: true }));
}


async function handleCreateOrder(statusCode) {
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
    setOrderStatus("请先选好座位，我们就能继续为你预订并完成购票。", "error");
    return;
  }

  recommendationDraft = readRecommendationDraftFromDOM();
  const validation = validateRecommendationDraft(recommendationDraft);
  if (!validation.valid) {
    setOrderStatus(validation.message, "error");
    return;
  }

  const result = await runSeatStateTransaction(() => {
    const freshUser = getCurrentUser();
    const hall = state.halls[selectedHallId];
    const selectedSeats = hall
      ? selectedSeatKeys.map((seatKey) => findSeatByKey(hall, seatKey)).filter(Boolean)
      : [];
    const orderCheck = hall
      ? validateOrderSelection(hall, validation.draft, selectedSeats)
      : { valid: false, message: "当前影厅状态已更新，请重新选择影厅后再试。" };

    if (!freshUser || !isNormalUser() || !orderCheck.valid) {
      return { success: false, message: orderCheck.message || "账号状态已变化，请重新登录后再试。" };
    }

    const ticketConfig = TICKET_TYPE_CONFIG[validation.draft.ticketType];
    const seatKeys = selectedSeats.map((seat) => `${seat.row}-${seat.number}`);
    const seatStatus = statusCode === ORDER_STATUS.reserved ? "reserved" : "sold";
    selectedSeats.forEach((seat) => {
      seat.status = seatStatus;
    });

    const order = {
      orderNo: createOrderNumber(),
      userId: freshUser.id,
      username: freshUser.username,
      displayName: freshUser.displayName,
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
    saveState("座位已被预订或购票");
    return { success: true, order };
  });

  if (!result.success) {
    clearInvalidSelectedSeats();
    renderCurrentHall();
    setOrderStatus(result.message || "抱歉，有座位刚刚被其他用户锁定，请重新选择。", "error");
    return;
  }

  const order = result.order;
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

  // 年龄规则仅用于智能推荐，手动选座后的订单不限制排数。
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
    dom.orderList.innerHTML = '<p class="order-empty">还没有订单。返回选座主页挑好座位后，就可以预订并购买。</p>';
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

  const hasActiveSettings = Boolean(
    activeModes.length || accessibilityState.voicePrompt
  );
  dom.accessibilityMenuBtn.classList.toggle("has-active-setting", hasActiveSettings);
  dom.accessibilityMenuBtn.setAttribute(
    "aria-label",
    hasActiveSettings ? "无障碍模式，已有设置开启" : "无障碍模式"
  );

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

  const storedState = readStoredState();
  if (storedState) {
    state = storedState;
  }

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
  saveState("新用户已注册");
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
  resetAccessibilitySettings();
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
  const labelEnabled = hall.id === "large" || (hall.seatsPerRow <= 20 && seatRadius >= 7);
  const labelFontSize = hall.id === "large"
    ? Math.max(4.5, Math.min(7.5, seatGap * 0.28))
    : 9;

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
        adminCtx.font = `${labelFontSize}px 'Noto Sans SC', sans-serif`;
        adminCtx.textAlign = "center";
        adminCtx.fillText(String(seatNumber), x, y + labelFontSize * 0.35);
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

/**
 * 渲染右侧"选座热度"面板：统计热源数量、同步显隐开关、给出文案说明。
 * 热源分两档：weight=55（已预订）、weight=80（已购票/已售）。
 * 注意这里只渲染面板文字，座位外圈热度颜色是在 drawSeats() 里画的。
 */
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
  setUserSubpage("main", false);
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

/**
 * 从 CSS 变量读取座位配色（空座/选中/已售/已预订/禁用/推荐外圈/手动外圈/选区）。
 * 这样 Canvas 绘制的颜色和无障碍模式切换的 CSS 变量保持一致：
 * 切换高对比度/色盲模式时，CSS 变量改变，Canvas 重绘也会自动跟上。
 */
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

/**
 * 取座位的列号（用于热度距离计算）。优先 col，回退 number。
 */
function getSeatColumn(seat) {
  return Number(seat.col || seat.number || 0);
}

/**
 * 把热度分数(0~100)映射成外圈颜色：≥55 红(热门)、≥25 黄(一般)、其余绿(冷门)。
 * 阈值与 getHeatInfluenceByDistance 的分档对应。
 */
function getHeatBorderColor(score) {
  if (score >= 55) return "#ef4444";
  if (score >= 25) return "#facc15";
  return "#22c55e";
}

/**
 * 画一个圆角矩形路径（不填充不描边，只构造路径，供后续 fill/stroke）。
 * 优先用浏览器原生 roundRect；不支持时用二次贝塞尔手画四角。
 * safeRadius 防止圆角超过宽高的一半。
 */
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

/**
 * 以 (x,y) 为中心、halfSize 为半边长画圆角方块路径（座位的形状）。
 * 圆角取半边长的 0.45 倍，让座位看起来接近参考图的圆角方凳。
 */
function drawRoundedSeatPath(context, x, y, halfSize) {
  const size = halfSize * 2;
  drawRoundedRectPath(context, x - halfSize, y - halfSize, size, size, Math.max(2, halfSize * 0.45));
}

/**
 * 点击命中检测：判断 (pointerX,pointerY) 是否落在某座位方块内。
 * padding 放大命中范围，让小座位也容易点中（体验优化，不影响绘制）。
 */
function isPointInsideSeat(pointerX, pointerY, seat, padding = 4) {
  const halfSize = seat.radius + padding;
  return Math.abs(pointerX - seat.x) <= halfSize && Math.abs(pointerY - seat.y) <= halfSize;
}

/* ================================================================
   热度地图：数据归一化 + 热源收集 + 距离扩散 + 单座热度计算
   ----------------------------------------------------------------
   思路：热度来源 = 已售/已购票/已预订的座位（"热源"）。
   每个热源按"距离分段"向周围座位扩散影响值，多个热源的影响累加，
   最后 clamp 到 0~100，用外圈颜色(红/黄/绿)呈现。
   座位内部颜色始终代表状态，外圈颜色代表热度，两者互不影响。
   ================================================================ */

/**
 * 把各种形态的座位标识归一化成 "排号-座号"（如 "3-5"）。
   接受字符串("3-5"/"3排5座")、对象(seat.id / seat.row+number / seat.label)。
   归一化是为了让订单里格式不一的座位字段也能和当前影厅座位对上号。
 */
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

/**
 * 为某影厅建 "座位id -> 座位对象" 的 Map，便于按 id 快速查座位。
 */
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

/**
 * 收集所有"有效订单"用于热度计算（兼容旧版/多键名存储）。
   会从 state.orders 以及 LocalStorage 里几个可能的旧键名读取并合并，
   再按 orderNo/id 去重，只保留有热度权重的订单（已预订/已购票，排除取消/退票）。
   兼容多种字段名是为了让旧数据也能产生热度，画面不至于全冷。
 */
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

/**
 * 订单的热度权重：已购票/已售=80，已预订=55，取消/退票=0（不产生热度）。
   兼容中英文状态字段。
 */
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

/**
 * 判断订单是否属于当前影厅（按 hallId/hallName 等多字段比对，大小写无关）。
   订单没有影厅信息时视为匹配（保守地把它的热度算进来）。
 */
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

/**
 * 从订单里取出座位条目（兼容 seatKeys/seats/seatList 等多种字段名）。
   返回数组；若只有单个座位字段则包成单元素数组。
 */
function getOrderSeatEntries(order) {
  const seatFields = [order.seatKeys, order.seats, order.seatList, order.selectedSeats, order.seatIds, order.seat];
  const entries = seatFields.find((field) => Array.isArray(field));

  if (entries) {
    return entries;
  }

  const singleEntry = seatFields.find((field) => field != null && !Array.isArray(field));
  return singleEntry == null ? [] : [singleEntry];
}

/**
 * 单个座位状态的热度权重（和订单权重一致：已售/已购票=80，已预订=55）。
 */
function getSeatHeatWeight(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (["paid", "purchased", "sold", "completed", "已购票", "已售"].includes(normalizedStatus)) {
    return 80;
  }

  return ["reserved", "booked", "已预订"].includes(normalizedStatus) ? 55 : 0;
}

/**
 * 汇总某影厅的全部"热源座位"（带权重）。
   先扫影厅自身座位状态，再扫所有匹配该厅的有效订单，
   同一座位取最大权重（购票优先于预订），返回 [{row,col,weight}]。
   这是 calculateSeatHeat 的输入。
 */
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

/**
 * 某座位到某热源的欧氏距离（行差、列差的勾股距离）。
   用行列坐标算距离，所以热度会沿"座位网格"扩散，而不是按像素。
 */
function getSeatDistance(seat, source) {
  const rowDiff = Number(seat.row) - Number(source.row);
  const colDiff = getSeatColumn(seat) - Number(source.col);
  return Math.sqrt(rowDiff * rowDiff + colDiff * colDiff);
}

/**
 * 热度随距离衰减的分档表（核心调参点）：
   - 购票热源(权重80)：本座80、相邻1格30、2格14、3格6，再远为0
   - 预订热源(权重55)：本座55、相邻1格20、2格9、3格4，再远为0
   距离越近影响越大，超过 HEAT_RADIUS(=3) 就不再扩散。
   多个热源的影响会在 calculateSeatHeat 里累加。
 */
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

/**
 * 计算单个座位的最终热度(0~100)：累加所有热源对它的影响，再 clamp 取整。
   heatSources 可传入避免重复计算（drawSeats 会复用同一份热源数组）。
 */
function calculateSeatHeat(seat, hall, heatSources = getHeatSourceSeats(hall)) {
  const heatScore = heatSources.reduce((total, source) => {
    const distance = getSeatDistance(seat, source);
    return total + getHeatInfluenceByDistance(distance, source.weight);
  }, 0);

  return Math.round(clamp(heatScore, 0, 100));
}

/* ================================================================
   Canvas 绘制主流程：renderSeatCanvas → drawCanvasChrome + drawSeats
   ----------------------------------------------------------------
   每次选座/切换影厅/开关热度都会重绘整张 Canvas。流程：
   1) 按容器宽度算逻辑尺寸，按 devicePixelRatio 设画布像素（高清不糊）
   2) 放大模式下用 ctx.scale/translate 把视口映射到全画布
   3) drawCanvasChrome 画银幕、标题、底部提示
   4) drawSeats 画所有座位（弧形坐标 + 状态填充 + 热度外圈 + 推荐/手动外圈）
   5) drawDragSelectionOverlay 画拖拽选框
   6) renderSeatMiniMap 画左上角缩略图
   ================================================================ */

/**
 * 主 Canvas 渲染入口。设置尺寸、处理放大变换、调用各绘制子函数。
   isLoggedIn 决定座位描边和提示文案（未登录时座位偏暗、提示"登录后选座"）。
 */
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
    // 放大模式：把 viewport 这块区域放大到整个画布
    // scale = 1/viewport.width（视口越窄放大越多），再平移把视口左上角对齐到画布原点
    const scale = 1 / viewport.width;
    ctx.scale(scale, scale);
    ctx.translate(-viewport.x * logicalWidth, -viewport.y * logicalHeight);
  }
  drawCanvasChrome(logicalWidth, logicalHeight, hall, isLoggedIn, palette);
  renderedSeats = drawSeats(hall, logicalWidth, isLoggedIn, palette); // 返回座位坐标供点击命中用
  drawDragSelectionOverlay(palette);
  ctx.restore();
  renderSeatMiniMap(hall, palette);
}

/**
 * 渲染左上角缩略图(seatMiniMap)：把全厅座位按比例缩成小点，
   并把当前 viewport 亮框定位到缩略图上（CSS 控制 .seat-overview__viewport 的位置）。
   只在放大模式下调用。
 */
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

/**
 * 画 Canvas 的"装饰件"：顶部银幕弧线、影厅标题、底部操作提示。
   fontScale 让大字体模式下文字同步放大。
 */
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

  const canvasHintFontSize = accessibilityState.largeText ? 26 : 14;
  ctx.font = `${canvasHintFontSize}px 'Noto Sans SC', sans-serif`;
  ctx.fillStyle = palette.textSoft;
  ctx.fillText(
    isLoggedIn ? "点击座位即可选择或调整" : "登录后即可开始选座",
    width / 2,
    height - 26
  );
}

/**
 * 画全部座位并返回每个座位的画布坐标（供点击命中检测用）。
 *
 * 【弧形布局原理】（作业要求：座位必须呈弧形排列）
 *  - 每排座位在同一水平基线 rowBaseY 上，但每个座位的 y 会按"距排中心的程度"下沉：
 *      normalized = 座位在排内的归一化位置(-0.5 ~ +0.5)，排中心为0
 *      y = rowBaseY + curveStrength * (normalized*2)^2
 *    (normalized*2)^2 是个 U 形抛物线：排中心为0不下沉，越靠两端下沉越多 → 形成弧形
 *  - curveStrength 控制弧度大小（窄屏18、宽屏24）
 *
 * 【绘制层次】每个座位从内到外画三层：
 *  1) 填充色：按状态(空座/选中/已售/已预订/禁用)取色，带发光
 *  2) 外圈：开热度时画热度色(红/黄/绿)；关热度时画白色细圈
 *  3) 推荐外圈(青)/手动外圈(白)：比座位大一圈，标识推荐或手动选择
 *  大厅也始终绘制座号；字体会随座位间距缩小，保证 1-30 座都有标记。
 */
function drawSeats(hall, width, isLoggedIn, palette) {
  const fontScale = accessibilityState.largeText ? 1.4 : 1;
  const marginX = width < 480 ? 26 : 74; // 座位区左右留白
  const startY = 170;                    // 第一排的起始 y
  const rowGap = width < 480 ? 46 : 48;   // 排间距
  const curveStrength = width < 480 ? 18 : 24; // 弧度强度，越大越弯
  const rows = hall.rows;
  const seatsPerRow = hall.seatsPerRow;
  const maxSeatWidth = width - marginX * 2;
  const seatGap = maxSeatWidth / Math.max(seatsPerRow - 1, 1); // 同排相邻座位 x 间距
  const seatRadius = Math.max(4, Math.min(12, seatGap * 0.3)); // 座位半边长，随密度自适应
  const labelEnabled = hall.id === "large" || (seatsPerRow <= 20 && seatRadius >= 7);
  const labelFontSize = hall.id === "large"
    ? Math.max(4.5, Math.min(7.5, seatGap * 0.28))
    : 10 * fontScale;
  const seats = [];
  const heatSources = getHeatSourceSeats(hall); // 本厅热源，复用给所有座位避免重复算

  for (let row = 1; row <= rows; row += 1) {
    const rowBaseY = startY + (row - 1) * rowGap; // 该排的水平基线 y

    // 画排号 R01/R02...
    ctx.font = `${12 * fontScale}px Orbitron, sans-serif`;
    ctx.textAlign = "left";
    ctx.fillStyle = "rgba(157, 182, 208, 0.86)";
    ctx.fillText(`R${String(row).padStart(2, "0")}`, 12, rowBaseY + 4);

    for (let seatNumber = 1; seatNumber <= seatsPerRow; seatNumber += 1) {
      const index = seatNumber - 1;
      // 归一化到 -0.5~+0.5（排中心为0），用于算弧形下沉量
      const normalized = seatsPerRow === 1 ? 0 : index / (seatsPerRow - 1) - 0.5;
      const x = marginX + index * seatGap; // x 按等间距排列
      // 弧形：靠两端的座位 y 更大（更靠下），呈微笑形弧线
      const y = rowBaseY + curveStrength * Math.pow(normalized * 2, 2);
      const seatData = hall.seats[(row - 1) * seatsPerRow + index];
      const seatKey = `${seatData.row}-${seatData.number}`;
      const isSelected = selectedSeatKeys.includes(seatKey);
      const isRecommended = recommendedSeatKeys.includes(seatKey);
      const isManualSelected = isSelected && !isRecommended; // 选中但非推荐 = 手动改的
      const heatScore = calculateSeatHeat(seatData, hall, heatSources);
      const heatBorderColor = getHeatBorderColor(heatScore);
      // 填充色优先按状态，状态为空座时再看是否选中
      const fillColor = seatData.status === "sold"
        ? palette.seatSold
        : seatData.status === "reserved"
          ? palette.seatReserved
          : seatData.status === "disabled"
            ? palette.seatDisabled
          : isSelected
            ? palette.seatSelected
            : palette.seatAvailable;

      // 第1层：填充座位本体（带发光）
      ctx.save();
      drawRoundedSeatPath(ctx, x, y, seatRadius);
      ctx.fillStyle = fillColor;
      ctx.shadowColor = fillColor;
      ctx.shadowBlur = 14;
      ctx.fill();
      ctx.shadowBlur = 0;

      // 第2层：外圈——热度色 或 白色细圈
      if (isHeatVisible) {
        drawRoundedSeatPath(ctx, x, y, seatRadius + 1.2);
        ctx.strokeStyle = heatBorderColor;
        ctx.lineWidth = Math.max(1, Math.min(2, seatRadius * 0.2));
        ctx.shadowColor = heatBorderColor;
        ctx.shadowBlur = heatScore >= 55 ? 4 : 2; // 热门座位发光更强
      } else {
        drawRoundedSeatPath(ctx, x, y, seatRadius);
        ctx.strokeStyle = isLoggedIn ? "rgba(255,255,255,0.68)" : "rgba(255,255,255,0.28)";
        ctx.lineWidth = isLoggedIn ? 1.5 : 1;
      }
      ctx.stroke();
      ctx.restore();

      // 第3层(可选)：推荐外圈——青色，比座位大一圈
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

      // 第3层(可选)：手动选择外圈——金色/白色
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

      // 大厅每个座位都标注座号，窄屏时自动使用更小字号。
      if (labelEnabled) {
        ctx.font = `${labelFontSize}px 'Noto Sans SC', sans-serif`;
        ctx.fillStyle = "#03111f";
        ctx.textAlign = "center";
        ctx.fillText(String(seatNumber), x, y + labelFontSize * 0.35);
      }

      // 记录坐标和半径，handleCanvasClick 用它做命中检测
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

/* ================================================================
   手动选座 + 拖拽框选：Canvas 上的鼠标交互
   ----------------------------------------------------------------
   交互规则（见 USER_MANUAL 3.2）：
   - 单击空座：选中/取消（单选，再点已选的会清空）
   - Ctrl/⌘ + 单击：多选切换（加/减一个）
   - 空白处按下拖动：框选矩形内所有空座（拖拽选座，加分项）
   - 已售/已预订/禁用座位不可选
   拖拽和点击会冲突：拖拽结束后用 suppressCanvasClick 屏蔽随后的 click 事件。
   ================================================================ */

/**
 * Canvas 单击处理：单选 / Ctrl多选。拖拽刚结束时会因 suppressCanvasClick 直接返回。
 */
function handleCanvasClick(event) {
  if (suppressCanvasClick) {
    suppressCanvasClick = false; // 拖拽产生的 click，吞掉
    return;
  }

  const currentUser = getCurrentUser();
  if (!currentUser) {
    setAuthMessage("登录后即可开始选座。", "error");
    return;
  }

  if (!isNormalUser()) {
    return; // 管理员不在 Canvas 上选座
  }

  const { x: pointerX, y: pointerY } = getCanvasPoint(event); // 屏幕坐标→画布逻辑坐标

  const hitSeat = renderedSeats.find((seat) => isPointInsideSeat(pointerX, pointerY, seat));

  if (!hitSeat || hitSeat.status !== "available") {
    return; // 没点中座位，或点的是不可选座位
  }

  const previousSelection = [...selectedSeatKeys];
  if (event.ctrlKey || event.metaKey) {
    toggleSeatSelection(hitSeat.key); // Ctrl：切换该座位的选中状态
  } else {
    // 普通单击：点已选的→清空；点新的→只选这个
    selectedSeatKeys = selectedSeatKeys.includes(hitSeat.key) ? [] : [hitSeat.key];
  }

  renderCurrentHall();
  if (hasSeatSelectionChanged(previousSelection, selectedSeatKeys)) {
    announceSeatSelectionChange(); // 无障碍语音播报选座变化
  }
}

/**
 * 鼠标按下：开始一次可能的拖拽。先记下起点，dragging 标记还是 false
   （要移动超过 8px 才算真拖拽，避免抖动误触）。additive 记录是否按了 Ctrl。
 */
function handleCanvasPointerDown(event) {
  if (!isNormalUser()) {
    return;
  }

  const point = getCanvasPoint(event);
  dragSelection = {
    active: true,
    dragging: false,
    additive: event.ctrlKey || event.metaKey, // Ctrl 拖拽 = 在已有选区上追加
    startX: point.x,
    startY: point.y,
    currentX: point.x,
    currentY: point.y
  };
}

/**
 * 鼠标移动：更新当前点，判断是否超过 8px 阈值成为真拖拽。
   真拖拽时重绘 Canvas（drawDragSelectionOverlay 会画选框）。
 */
function handleCanvasPointerMove(event) {
  if (!dragSelection.active) {
    return;
  }

  const point = getCanvasPoint(event);
  dragSelection.currentX = point.x;
  dragSelection.currentY = point.y;

  const width = Math.abs(dragSelection.currentX - dragSelection.startX);
  const height = Math.abs(dragSelection.currentY - dragSelection.startY);
  dragSelection.dragging = width > 8 || height > 8; // 阈值，防抖动

  if (dragSelection.dragging) {
    renderCurrentHall();
  }
}

/**
 * 鼠标松开：若是真拖拽，应用选区并屏蔽随后的 click 事件。
   重置 dragSelection 并重绘。
 */
function handleCanvasPointerUp() {
  if (!dragSelection.active) {
    return;
  }

  let selectionChanged = false;
  if (dragSelection.dragging) {
    selectionChanged = applyDragSelection();
    suppressCanvasClick = true; // 阻止 mouseup 后的 click 又选一次座位
  }

  dragSelection = createEmptyDragSelection();
  renderCurrentHall();
  if (selectionChanged) {
    announceSeatSelectionChange();
  }
}

/**
 * 鼠标移出 Canvas：若正在拖拽则结算选区；若只是按下没拖则取消。
 */
function handleCanvasPointerLeave() {
  if (!dragSelection.active) {
    return;
  }

  if (!dragSelection.dragging) {
    dragSelection = createEmptyDragSelection(); // 没拖起来，直接取消
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
  const issues = [];
  let score = 20;

  if (selectedSeats.length !== draft.members.length) {
    issues.push("座位数量和同行人数还没有对应。");
    score -= 8;
  }

  const arrangementCheck = evaluateTicketArrangement(draft.ticketType, selectedSeats);
  score -= arrangementCheck.penalty;
  issues.push(...arrangementCheck.issues);

  if (!issues.length) {
    return {
      score,
      status: "success",
      reason: "这组座位符合当前票型与同行人数的安排要求。"
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
  const hasSenior = audience.some((member) => member.age >= 60);

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
    reasons.push("同行人中有 60 岁及以上的观众，已为你避开最后 3 排。");
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
    reasons.push("同行人中有 60 岁及以上的观众，请避开最后 3 排。");
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
  const headerUserName = user ? user.username : "未登录";
  const headerRole = user ? roleLabel(user.role) : "访客";

  dom.currentUserName.textContent = user ? user.displayName : "未登录";
  dom.currentUserRole.textContent = headerRole;
  dom.currentUserStatus.textContent = isNormalUser() ? "已解锁选座台" : "请先登录";
  dom.heroUserName.textContent = headerUserName;
  dom.heroUserName.title = headerUserName;
  dom.heroUserName.setAttribute("aria-label", `用户名：${headerUserName}`);
  dom.heroUserRole.textContent = headerRole;
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

  return sessionUser && !sessionUser.disabled ? sessionUser : null;
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
  persistCurrentUserSession(user);
}

function clearCurrentUser() {
  try {
    sessionStorage.removeItem(TAB_SESSION_STORAGE_KEY);
  } catch (error) {
    // 无法使用 sessionStorage 时仅清理当前页面的内存会话。
  }
  delete window.__smartCinemaTabSession;
}

function persistCurrentUserSession(user) {
  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    memberLevel: user.memberLevel,
    loginAt: new Date().toISOString()
  };

  try {
    sessionStorage.setItem(TAB_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    window.__smartCinemaTabSession = session;
  }
}

function readCurrentUserSession() {
  try {
    const saved = sessionStorage.getItem(TAB_SESSION_STORAGE_KEY);
    return saved ? JSON.parse(saved) : (window.__smartCinemaTabSession || null);
  } catch (error) {
    return window.__smartCinemaTabSession || null;
  }
}

function roleLabel(role) {
  return role === "admin" ? "管理员" : "普通会员";
}

function loadState() {
  const storedState = readStoredState();
  if (!storedState) {
    const initialState = createInitialState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
    return initialState;
  }

  return storedState;
}

function readStoredState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }
    const normalizedState = normalizeState(JSON.parse(saved));
    return normalizedState;
  } catch (error) {
    return null;
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

function saveState(reason = "影院数据已更新") {
  state.users = state.users.map(normalizeUser);
  state.currentUserId = null;
  state.realtimeRevision = `${Date.now()}-${realtimeTabId}-${Math.random().toString(36).slice(2, 8)}`;
  state.updatedAt = new Date().toISOString();
  lastRealtimeRevision = state.realtimeRevision;

  if (serverTransactionContext) {
    serverTransactionContext.reason = reason;
    return;
  }

  if (hasWebSocketConnection()) {
    submitStateToServer(reason).then((result) => {
      if (!result.accepted) {
        renderRealtimeStatus("服务端拒绝了过期数据，已恢复最新座位状态。");
      }
    });
    return;
  }

  persistStateLocally();
  publishRealtimeUpdate(reason);
}

function persistStateLocally() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(state.users));
}

function initializeUserData() {
  const storedUsers = readStoredUsers();
  state.users = mergeUsers(state.users, storedUsers);
  initDefaultAdmin();
  migrateLegacyCurrentUserSession();
  saveState("用户数据已初始化");
}

function migrateLegacyCurrentUserSession() {
  if (readCurrentUserSession()) {
    state.currentUserId = null;
    return;
  }

  let legacySession = null;
  try {
    const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
    legacySession = saved ? JSON.parse(saved) : null;
  } catch (error) {
    legacySession = null;
  }

  const legacyUserId = legacySession?.id || state.currentUserId;
  const legacyUser = state.users.find((user) => user.id === legacyUserId && !user.disabled);
  if (legacyUser) {
    persistCurrentUserSession(legacyUser);
  }

  state.currentUserId = null;
  localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
}

function getOrCreateRealtimeTabId() {
  try {
    const existingId = sessionStorage.getItem(TAB_ID_STORAGE_KEY);
    if (existingId) {
      return existingId;
    }

    const tabId = `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    sessionStorage.setItem(TAB_ID_STORAGE_KEY, tabId);
    return tabId;
  } catch (error) {
    return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function initializeRealtimeSync() {
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY && event.newValue) {
      syncStateFromSharedStorage("已收到其他在线用户的座位更新。");
    }
  });

  if (realtimeChannel) {
    realtimeChannel.addEventListener("message", (event) => {
      const message = event.data;
      if (message?.type === "state-updated" && message.sourceTabId !== realtimeTabId) {
        syncStateFromSharedStorage(message.reason || "已收到其他在线用户的座位更新。");
      }
    });
  }

  renderRealtimeStatus();
}

function publishRealtimeUpdate(reason) {
  if (!realtimeChannel || hasWebSocketConnection()) {
    return;
  }

  realtimeChannel.postMessage({
    type: "state-updated",
    sourceTabId: realtimeTabId,
    revision: state.realtimeRevision,
    reason
  });
}

function syncStateFromSharedStorage(message) {
  const storedState = readStoredState();
  applySynchronizedState(storedState, message, false);
}

function clearInvalidSelectedSeats() {
  const hall = state.halls[selectedHallId];
  if (!hall) {
    selectedSeatKeys = [];
    recommendedSeatKeys = [];
    return [];
  }

  const unavailableSelectedSeats = selectedSeatKeys.filter((seatKey) => {
    return findSeatByKey(hall, seatKey)?.status !== "available";
  });
  selectedSeatKeys = selectedSeatKeys.filter((seatKey) => !unavailableSelectedSeats.includes(seatKey));
  recommendedSeatKeys = recommendedSeatKeys.filter((seatKey) => findSeatByKey(hall, seatKey)?.status === "available");
  return unavailableSelectedSeats;
}

function renderRealtimeStatus(message = getDefaultRealtimeStatus()) {
  dom.realtimeStatuses.forEach((element) => {
    element.textContent = message;
    element.classList.toggle("is-updated", message !== getDefaultRealtimeStatus());
  });
}

async function runSeatStateTransaction(mutate) {
  const performTransaction = async () => {
    const storedState = readStoredState();
    if (!storedState) {
      return { success: false, message: "无法读取最新座位数据，请刷新页面后再试。" };
    }

    state = storedState;
    const useWebSocket = hasWebSocketConnection();
    serverTransactionContext = useWebSocket ? { reason: "座位状态已更新" } : null;
    const result = mutate();
    const transaction = serverTransactionContext;
    serverTransactionContext = null;

    if (!result?.success || !useWebSocket) {
      return result;
    }

    const commitResult = await submitStateToServer(transaction.reason);
    if (!commitResult.accepted) {
      return {
        success: false,
        message: "该座位刚刚被其他用户预订或购票，请重新选择。"
      };
    }

    return result;
  };

  if (navigator.locks?.request) {
    return navigator.locks.request(REALTIME_LOCK_NAME, { mode: "exclusive" }, performTransaction);
  }

  return performTransaction();
}

function initializeWebSocketSync() {
  const websocketUrl = getWebSocketUrl();
  if (!websocketUrl) {
    renderRealtimeStatus("本地多标签页同步已连接（WebSocket 未启动）");
    return;
  }

  connectWebSocket(websocketUrl);
}

function getWebSocketUrl() {
  if (typeof WebSocket !== "function" || window.location.protocol === "file:") {
    return null;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}${WEBSOCKET_PATH}`;
}

function connectWebSocket(websocketUrl) {
  try {
    websocket = new WebSocket(websocketUrl);
  } catch (error) {
    scheduleWebSocketReconnect(websocketUrl);
    return;
  }

  websocket.addEventListener("open", () => {
    websocketReconnectAttempts = 0;
    sendWebSocketMessage({
      type: "state-sync-request",
      sourceId: realtimeTabId,
      revision: serverRevision || state.realtimeRevision || "",
      state: createStateSnapshot()
    });
    renderRealtimeStatus("WebSocket 实时同步已连接");
  });

  websocket.addEventListener("message", (event) => {
    try {
      handleWebSocketMessage(JSON.parse(event.data));
    } catch (error) {
      renderRealtimeStatus("收到无法识别的实时同步数据。");
    }
  });

  websocket.addEventListener("close", () => {
    websocket = null;
    renderRealtimeStatus("WebSocket 已断开，已切换为本地同步。");
    scheduleWebSocketReconnect(websocketUrl);
  });

  websocket.addEventListener("error", () => {
    websocket?.close();
  });
}

function scheduleWebSocketReconnect(websocketUrl) {
  if (websocketReconnectTimer || window.location.protocol === "file:") {
    return;
  }

  websocketReconnectAttempts += 1;
  const delay = Math.min(WEBSOCKET_RECONNECT_DELAY * websocketReconnectAttempts, 10000);
  websocketReconnectTimer = window.setTimeout(() => {
    websocketReconnectTimer = null;
    connectWebSocket(websocketUrl);
  }, delay);
}

function hasWebSocketConnection() {
  return Boolean(websocket && websocket.readyState === WebSocket.OPEN);
}

function sendWebSocketMessage(message) {
  if (!hasWebSocketConnection()) {
    return false;
  }

  websocket.send(JSON.stringify(message));
  return true;
}

function createStateSnapshot() {
  return JSON.parse(JSON.stringify(state));
}

function submitStateToServer(reason) {
  if (!hasWebSocketConnection()) {
    persistStateLocally();
    publishRealtimeUpdate(reason);
    return Promise.resolve({ accepted: true, fallback: true });
  }

  const requestId = `commit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return new Promise((resolve) => {
    const timeoutId = window.setTimeout(() => {
      pendingSocketCommits.delete(requestId);
      resolve({ accepted: false, message: "实时服务响应超时，请重试。" });
    }, 5000);

    pendingSocketCommits.set(requestId, { resolve, timeoutId });
    const sent = sendWebSocketMessage({
      type: "state-commit",
      requestId,
      sourceId: realtimeTabId,
      baseRevision: serverRevision || "",
      reason,
      state: createStateSnapshot()
    });

    if (!sent) {
      window.clearTimeout(timeoutId);
      pendingSocketCommits.delete(requestId);
      persistStateLocally();
      publishRealtimeUpdate(reason);
      resolve({ accepted: true, fallback: true });
    }
  });
}

function handleWebSocketMessage(message) {
  if (!message || typeof message !== "object") {
    return;
  }

  if (message.type === "state-sync" || message.type === "state-update") {
    applySynchronizedState(message.state, message.reason || "已收到其他设备的座位更新。", true);
    return;
  }

  if (message.type === "state-commit-result") {
    const pendingCommit = pendingSocketCommits.get(message.requestId);
    if (pendingCommit) {
      window.clearTimeout(pendingCommit.timeoutId);
      pendingSocketCommits.delete(message.requestId);
    }

    applySynchronizedState(
      message.state,
      message.accepted ? (message.reason || "座位状态已同步到实时服务。") : "座位状态已被其他用户更新。",
      true,
      !message.accepted
    );
    pendingCommit?.resolve({ accepted: Boolean(message.accepted), message: message.message || "" });
  }
}

function applySynchronizedState(nextState, message, shouldPersist, force = false) {
  if (!nextState) {
    return false;
  }

  const normalizedState = normalizeState(nextState);
  const revision = normalizedState.realtimeRevision || "";
  if (!force && revision && revision === lastRealtimeRevision) {
    return false;
  }

  state = normalizedState;
  lastRealtimeRevision = revision;
  serverRevision = revision || serverRevision;
  if (shouldPersist) {
    persistStateLocally();
  }

  const unavailableSelectedSeats = clearInvalidSelectedSeats();
  syncScreenState();
  syncCurrentUserUI();
  renderOrderCenter();
  renderCurrentHall();
  renderAdminDashboard();
  renderRealtimeStatus(message);

  if (unavailableSelectedSeats.length && isNormalUser()) {
    setOrderStatus(`座位 ${unavailableSelectedSeats.map(formatSeatLabel).join("、")} 已被其他用户锁定，请重新选择。`, "error");
  }

  return true;
}

function getDefaultRealtimeStatus() {
  return hasWebSocketConnection()
    ? "WebSocket 实时同步已连接"
    : "本地多标签页同步已连接（WebSocket 未启动）";
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

/**
 * 生成某个影厅的全部座位数据（弧形布局的"数据源"，绘制时再按行列算坐标）。
 * @param {number} rows        - 排数（三个厅都是 10 排）
 * @param {number} seatsPerRow - 每排座位数（小厅10/中厅20/大厅30）
 * @param {string} hallId      - 影厅 id，用来取该厅的"初始已售"图案
 * @returns {Array<{row:number,number:number,status:string}>} 座位数组，按"行优先"排列
 *
 * 座位状态取值：available 空座 / sold 已售 / reserved 已预订 / disabled 维修
 * 这里只初始化 available 与 sold 两种（sold 来自 soldPatternByHall 的预设图案）。
 */
function buildSeats(rows, seatsPerRow, hallId) {
  const soldPattern = soldPatternByHall(hallId); // 预设的"已售座位"集合，让画面一开始就不空
  const seats = [];

  for (let row = 1; row <= rows; row += 1) {
    for (let number = 1; number <= seatsPerRow; number += 1) {
      const key = `${row}-${number}`; // 座位唯一标识："排号-座号"，全项目用它定位座位
      seats.push({
        row,
        number,
        // 命中预设图案的记为已售，其余为空座
        status: soldPattern.has(key) ? "sold" : "available"
      });
    }
  }

  return seats;
}

/**
 * 各影厅"初始已售座位"的预设图案（纯演示用，让热度图一开始就有热源可看）。
 * 返回一个 Set，成员形如 "3-5"（第3排第5座）。
 * 真实订单产生后，热度会以订单/座位状态为准重新计算，这里只负责初始画面。
 */
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
