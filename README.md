# SmartCinema 智能影院选座系统

SmartCinema 是一个使用 `HTML5`、`CSS3`、原生 JavaScript 和 Canvas 实现的纯前端影院选座课程项目。当前运行代码集中在单文件 `index.html` 中，系统围绕“减少用户选座决策成本”设计，提供普通用户选座端与管理员后台，并使用浏览器 LocalStorage 保存数据，不依赖第三方图表库。

详细操作说明请见 [用户使用手册](USER_MANUAL.md)。课程原始要求见 [大作业说明](大作业选题一：SmartCinema智能影院选座系统（作业说明）.docx)。

## 运行方式

直接在浏览器中打开 [index.html](index.html) 即可使用。若需要通过本地静态服务运行，在项目目录执行：

```powershell
python -m http.server 8080
```

然后访问 `http://localhost:8080`。

默认管理员账号为 `admin`，密码为 `Admin@123`。普通账号只能通过注册页面创建。

### 单文件前端

当前 `index.html` 已内联全部浏览器端 HTML、CSS 和 JavaScript，可单独打开运行本地选座功能。

### WebSocket 实时协作模式

当前单文件版本使用 `BroadcastChannel + storage` 模拟同一浏览器配置文件中的多标签页座位同步。直接打开 `index.html` 或使用上述静态服务均可运行；跨设备的真实 WebSocket 服务需要额外部署后端，本项目默认不包含该服务。

## 项目结构

```text
big_homework/
├─ index.html          单文件运行入口：页面、样式、业务状态、Canvas 与交互逻辑
├─ package.json         `npm start` 启动命令（不含第三方依赖）
├─ USER_MANUAL.md      用户使用手册
├─ PHASE1_REPORT.md    第一阶段开发记录
├─ README.md           项目说明与功能代码对照
└─ 大作业选题一：SmartCinema智能影院选座系统（作业说明）.docx
```

## 设计思路

### 1. 以角色分流减少误操作

页面初始化时先加载用户与当前会话。普通用户进入选座端，管理员进入后台；注册逻辑固定生成普通用户，管理员只由 `initDefaultAdmin()` 初始化。权限判断集中在 `getCurrentUser()`、`isAdmin()` 和 `isNormalUser()`，避免把角色判断分散到页面各处。

### 2. 以单一状态源同步座位与订单

影厅座位、用户与订单集中保存在 `state` 中，任何预订、购票、取消、退票或管理员座位修改都会调用 `saveState()` 保存并重新渲染。这样普通用户端、热度边框和管理员后台读取的是同一份数据。

### 3. WebSocket 实时协作与本地降级

`server.js` 使用 Node 内置 `http`、`crypto` 和 WebSocket 协议实现实时服务，不依赖第三方包。服务端保存权威状态，并为每次提交分配版本号；`runSeatStateTransaction()` 提交预订或购票前会携带当前版本，过期提交会被服务端拒绝并回滚为最新状态，从而避免不同设备抢到同一座位。登录会话保存在 `sessionStorage`，管理员和普通用户可在不同标签页独立在线。服务未启动时，页面自动使用 `BroadcastChannel + storage` 保持本地多标签页同步。

### 4. 用 Canvas 承担视觉密度高的座位交互

<!-- 组员2负责模块导读：本节描述座位图/弧形布局/热度/选座的整体设计，
     对应代码见 app.js 的 drawSeats()、renderSeatCanvas()、handleCanvasClick()、
     getHeatSourceSeats() 等。先读这一节建立整体认识，再去看具体函数。 -->

三种影厅都由 `drawSeats()` 按行列和弧形曲线计算座位坐标，再根据状态绘制内部颜色、热度边框、推荐外圈和手动选择外圈。点击检测仍使用同一组 Canvas 坐标，保证绘制和交互一致。

### 5. 推荐与评分分别解决“怎么选”和“选得怎么样”

推荐模块先校验票型、人数与年龄约束，再搜索连续空座；选座页评分模块从距离、水平视角、周围空位和规则匹配四个维度给出座位参考分，已购票订单再结合用户的 1–5 星评分生成综合评分。

### 6. 热度基于真实座位状态缓慢扩散

<!-- 组员2负责模块导读：热度地图的设计思路。
     热源收集 → getHeatSourceSeats()；距离衰减 → getHeatInfluenceByDistance()；
     单座热度 → calculateSeatHeat()；外圈颜色 → getHeatBorderColor()。
     "用 Map 去重"指 getHeatSourceSeats 里同一座位取最大权重。 -->

热度来源为已售、已购票和已预订座位。系统先用 `Map` 为热源去重，再按距离分段累计影响，最后只用座位外圈的颜色和微弱发光显示热度，避免覆盖座位实际状态。购买订单会额外写入 `purchasedAt`；一周视图中，所有当前已售座位都会作为基础热源，所选日期的订单会单独统计。选座页的“显示热度·变化”逐日复用相同的距离扩散结果计算区域均热，并可点击某日让同一张 Canvas 预览对应热度边框。

### 7. 无障碍和响应式作为全局能力

大字体、高对比度、色盲友好和语音提示均通过 `body` 模式类和 `smartCinemaAccessibility` 保存当前登录期间的设置，切换后立即影响现有页面，不需要重载或额外页面；登录首页、桌面用户端和移动端顶部均可通过同一组“无障碍模式”下拉菜单打开设置。退出登录时会自动恢复默认并清除该配置。

手机端不再简单堆叠桌面模块，而是以“影厅切换 → Canvas 座位图 → 确认订单”为主路径。手动选座可直接开始；“选座信息”在同页底部抽屉中按需展开，填写方式与 PC 端一致，推荐完成后自动关闭，用户仍可继续修改已选座位。手机端和桌面端一样，确认座位、预订或购票前必须填写完整的选座信息；未填写时底栏会引导打开信息抽屉，而不会进入订单确认。热度、图例与推荐信息默认折叠，固定底栏始终显示当前选座与确认入口。桌面端保留完整工作台和左右分栏布局。

## LocalStorage 数据

| 键名 | 用途 |
|---|---|
| `smartCinemaState` | 影厅、座位、订单与实时同步版本号 |
| `smartCinemaUsers` | 统一用户列表，保存 `id`、`username`、`password`、`role`、`memberLevel`、`createdAt` 等演示数据 |
| `smartCinemaTabSession` | 当前标签页的独立登录会话，保存在 SessionStorage，不会覆盖其他标签页身份 |
| `smartCinemaAccessibility` | 当前登录期间的大字体、高对比度、色盲友好、语音提示开关；退出登录时清除 |

> 本项目为前端课程演示，密码保存在 LocalStorage 中仅用于本地功能展示，不能用于真实生产系统。

## 作业功能与代码对照

下表依据 [大作业说明](大作业选题一：SmartCinema智能影院选座系统（作业说明）.docx) 的基本功能和六个模块整理。函数名可直接在 `app.js` 中搜索。

| 作业功能 | 页面与核心代码 | 实现说明 |
|---|---|---|
| 登录、注册与管理员后台 | `index.html` 的 `#authScreen`、`#appScreen`、`#adminScreen`；`handleLogin()`、`handleRegister()`、`handleLogout()`、`initDefaultAdmin()`、`syncScreenState()` | 普通注册固定为 `user/normal`；管理员进入后台，用户进入选座端。 |
| 三个影厅与弧形座位图 | `hallsConfig`、`buildSeats()`、`renderHallTabs()`、`renderSeatCanvas()`、`drawSeats()` | 小厅 100 座、中厅 200 座、大厅 300 座，均为 10 排；Canvas 负责弧形布局和状态颜色。 |
| 座位状态与本地初始化 | `soldPatternByHall()`、`getSeatPalette()`、`loadState()`、`saveState()` | 支持空座、选中、已售、已预订、维修/禁用等状态，并持久化到 LocalStorage。 |
| 模块 1：智能推荐选座 | `handleRecommendSeats()`、`recommendSeatsForHall()`、`calculateAudienceRestriction()` 及其候选座位辅助函数 | 支持个人、情侣、家庭、团体票；处理少年、老年人、连续座位和团体同排约束，并输出推荐理由。 |
<!-- 组员2负责模块对照表：下面"模块2 手动选座"和"模块3 热度地图"两行
     列出了你负责部分的核心函数名，可在 app.js 里直接搜索跳转。 -->
| 模块 2：手动选座 | `handleCanvasClick()`、`handleCanvasPointerDown()`、`handleCanvasPointerMove()`、`handleCanvasPointerUp()` | 桌面端支持单选、`Ctrl` 多选与拖拽框选；手机端连续点击可多选，再次点击可取消，推荐后仍可手动修改。 |
| 模块 3：影院热度地图 | `getHeatSourceSeats()`、`getHeatInfluenceByDistance()`、`calculateSeatHeat()`、`getHeatBorderColor()`、`renderHeatPanel()`、`getWeeklyHeatData()`、`renderHeatTrendModal()`；Canvas 的 `drawSeats()` | 热度由预订/购票/已售座位按距离分段扩散并累加，只绘制外圈边框；购票记录按 `purchasedAt` 统计，可在“显示热度·变化”窗口中查看并预览本周每日热度。 |
| 模块 4：观影体验评分 | `updateExperienceScore()`、`calculateSystemExperienceScore()`、`getOrderScoreSummary()`、`calculateCompositeScore()`、`renderExperienceScoreState()` | 选座页仅显示座位参考分、等级和理由；已购票订单由用户评分后显示订单专属综合结果。 |
| 模块 5：无障碍模式 | `handleAccessibilityToggle()`、`resetAccessibilitySettings()`、`applyAccessibilitySettings()`、`renderAccessibilityState()`、`speakMessage()`；`style.css` 的 `mode-large-text`、`mode-high-contrast`、`mode-colorblind` | 支持大字体、高对比度、色盲友好和 SpeechSynthesis 语音提示；退出登录时恢复默认配置。 |
| 模块 6：订单中心 | `handleCreateOrder()`、`validateOrderSelection()`、`handleOrderListAction()`、`updateOrderStatus()`、`renderOrderCenter()` | 支持预订、取消预订、购票、退票和已购票订单 1–5 星评分；订单状态会同步更新座位。 |
| 加分项：多人实时座位更新 | `server.js`、`initializeWebSocketSync()`、`submitStateToServer()`、`runSeatStateTransaction()`、`sessionStorage` 会话函数 | WebSocket 服务端保存权威状态并按版本拒绝过期提交，支持不同浏览器或设备的实时同步；服务未启动时自动降级为本地多标签页同步。 |
| 管理员扩展 | `renderAdminDashboard()`、`renderAdminSeatCanvas()`、`handleAdminSeatCanvasClick()`、`handleAdminCanvasPan()`、`handleAdminOrderAction()`、`handleAdminResetHall()`、`renderAdminUsers()` | 管理员可查看概览、修改座位、重置影厅、管理全部订单和查看普通用户；手机端中厅和大厅支持画布上下左右移动；不展示用户密码。 |

## 作业要求完成情况

| 项目 | 当前状态 |
|---|---|
| 原生 HTML、CSS、JavaScript | 已完成 |
| Canvas 弧形座位布局 | 已完成 |
| Canvas 热度边框 | 已完成 |
| LocalStorage 数据保存 | 已完成 |
| PC、平板、手机响应式布局 | 已完成：桌面保留完整工作台；手机端使用座位图优先、抽屉式推荐和固定确认栏。 |
| AI 问答式观影顾问 | 未单独实现；当前为表单式智能推荐 |
| 一周热度变化 | 已完成查看与按日预览：在“显示热度·变化”中查看当前影厅一周内每天的购票热度，点击日期即可在现有 Canvas 预览对应热度边框 |
| WebSocket 多人实时更新 | 已完成：`server.js` 提供零依赖 WebSocket 服务；跨浏览器/设备访问同一服务地址即可实时同步，未启动服务时保留本地同步降级。 |

## 验证建议

1. 使用管理员账号登录，检查后台概览、座位状态修改、订单列表和普通用户列表。
2. 退出后注册普通用户，检查进入选座端且无法进入后台。
3. 输入观众信息生成推荐，确认推荐外圈、理由和座位数量正确。
4. 桌面端测试单选、`Ctrl` 多选与拖拽框选；手机端测试连续点击多选与再次点击取消；已售、预订、禁用座位不可选。
5. 预订、取消预订、购票和退票后刷新页面，确认座位、订单与热度边框仍同步。
6. 逐个开启无障碍模式，确认样式立即变化；退出登录后确认所有模式恢复默认。

## 已知边界

- WebSocket 实时模式使用本地 Node 服务与 JSON 文件保存演示数据，不含真实支付、鉴权或生产级安全策略。
- 清除浏览器站点数据会重置本地状态。
- 管理员用户管理目前提供普通用户信息展示，不提供删除用户功能。
