# PRD — Pixel-Pulse 像素脉动

## 项目定位

一款**轻量级实时性能监控可视化看板**。核心目标是：

> **不是"一个页面里放了几个图表"，而是"我打开了一台正在运行的、精密的生产监控终端"。**

本质：**数据驱动的前端可视化引擎**——靠 Web Workers + ECharts + Web Crypto 三个技术点支撑，靠视觉完成度制造差距。

---

## 面试价值

| 亮点 | 面试话术方向 |
|------|-------------|
| Web Workers 多线程 | "UI 线程与计算线程分离，每秒 60 帧数据计算丢 Worker，主线程 < 16ms" |
| ECharts 实时可视化 | "自定义深色主题，面积渐变、环形图、双折线，6 个图表实时刷新" |
| Web Crypto 签名 | "SHA-256 校验上报数据完整性，模拟监控 Agent 安全传输" |
| 视觉完成度 | "不是 demo 拼凑，是统一设计系统的专业监控终端" |

---

## 技术栈

| 层 | 技术 |
|---|------|
| 框架 | Vue 3.5 + TypeScript（script setup） |
| 构建 | Vite |
| 可视化 | ECharts 5（自定义深色主题） |
| 多线程 | Web Workers API |
| 安全 | Web Crypto API（SHA-256） |
| 字体 | Space Grotesk + Inter + JetBrains Mono |
| UI 组件 | Element Plus（控制面板按钮/输入框） |

**不引入：** Pinia、Vue Router、后端、数据库、WebSocket。

---

## 视觉设计规范

见 `docs/DESIGN.md`。核心要点：

- 底色 `#060d17`（带靛蓝底，非纯黑）
- 卡片 `rgba(255,255,255,0.03)` + 1px 极细边框 + 毛玻璃
- 青蓝主色 `#4fd1ff`
- Space Grotesk 标题 + Inter 数字/正文 + JetBrains Mono Event Feed
- 仅 4 种动效：入场 stagger、呼吸点、异常脉冲、数值过渡
- hover 微位移 `-1px`，不超 1px

---

## 核心功能

### 功能 1：Hero Metric Row（4 个大数字卡片）

| 卡片 | 数据 | 单位 |
|------|------|------|
| CPU Usage | 78.4 | % |
| Latency | 18.4 | ms |
| Error Rate | 0.3 | % |
| Worker Time | 12 | ms |

标签 10px 大写 / 数值 36px 亮白 / 单位 14px 灰。  
hover 微亮，无重阴影。

---

### 功能 2：主图区（CPU 趋势图，唯一有光晕的地方）

面积折线图，`#4fd1ff` 主色，纵向渐变填充 `rgba(79,209,255,0.25)` → `rgba(79,209,255,0.01)`。  
85% 处红色虚线阈值线。  
线条 emphasis 时触发 `shadowBlur: 12, shadowColor: rgba(79,209,255,0.5)` —— 唯一有光晕的地方。

---

### 功能 3：Event Feed（实时事件流）

右侧面板，`JetBrains Mono` 等宽字体。  
新条目从底部 `card-enter` 动画进入，旧条目超出 20 条自动移除。

条目格式：
```
14:32:18  [CPU] Spike detected (91% → 68%)
14:32:16  [SIG] Signature verified: OK
14:32:15  [NET] Throughput: 342 KB/s
14:32:14  [WRK] Tick completed in 11ms
```

badge 三种色：`ok` 绿 / `warn` 黄 / `err` 红。

---

### 功能 4：辅助指标区（Network + Memory）

**Network Throughput**：双折线，上传实线 `#4fd1ff`，下载虚线 `rgba(79,209,255,0.35)`。  
**Memory Gauge**：环形进度 `radius: ['60%', '80%']`，居中大数字 `6.2 / 10 GB`。

---

### 功能 5：Status Bar（顶部状态栏）

```
PIXEL-PULSE     ● System Operational    Refresh: 1s · Window: 60 · Worker: Active
```

呼吸绿点 `animation: breathe 2s`。右侧显示当前配置状态。

---

### 功能 6：Web Workers 离线程计算

```
主线程                           Worker 线程
  │                                  │
  ├─→ postMessage({ cmd: 'tick' })  →│
  │                                  ├─ 生成模拟数据（正弦波 + 随机噪声）
  │                                  ├─ 滑动窗口聚合（min/max/avg/p95）
  │                                  ├─ SHA-256 签名
  │   ← postMessage(result) ←────────┘
  │
  ├─ 更新 ECharts option
  └─ 渲染
```

**验收：** 高负载模式（数据量 10×）主线程 < 16ms/帧。

---

### 功能 7：Web Crypto 签名校验

Worker 生成数据后 `crypto.subtle.digest('SHA-256')` 签名。主线程接收后重新计算比对。

**验收：** 点"注入异常"按钮，签名不匹配，对应图表卡片红色脉冲边框闪烁 3 秒自动消失。

---

### 功能 8：控制面板

整合在 Status Bar 右侧：

- `[▶]` / `[⏸]` 开始/暂停
- 刷新频率下拉（500ms / 1s / 2s / 5s）
- 窗口大小下拉（30 / 60 / 120）
- `[🔴 注入异常]` — 模拟数据篡改
- `[⚡ 高负载]` — 数据量 10×，演示 Worker 不卡

---

## 页面布局

```
┌───────────────────────────────────────────────────────────────┐
│ PIXEL-PULSE        ● Operational     [▶][⏸] 1s▼ 60▼ [🔴][⚡] │
├───────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│ │ CPU USAGE │ │ LATENCY  │ │ ERROR %  │ │ WORKER TIME      │  │
│ │  78.4 %  │ │ 18.4 ms  │ │  0.3 %   │ │   12 ms          │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
├───────────────────────────────────────┬───────────────────────┤
│                                       │  ══ EVENT FEED ══    │
│    CPU TREND                          │  14:32:18 CPU spike  │
│    ┌─────────────────────────────┐    │  14:32:16 Sig OK     │
│    │  〰️〰️〰️〰️〰️〰️〰️〰️〰️   │    │  14:32:15 Net 342KB  │
│    │  ---- 85% threshold -----  │    │                       │
│    └─────────────────────────────┘    │                       │
├───────────────────┬───────────────────┤                       │
│  NETWORK THRU     │  MEMORY GAUGE     │                       │
│  ─── Upload       │     ◯ 62%        │                       │
│  ··· Download     │    6.2 / 10 GB   │                       │
└───────────────────┴───────────────────┴───────────────────────┘
```

### CSS Grid 声明

```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
  padding: 24px;
  height: 100vh;
}
.status-bar   { grid-column: 1 / -1; }
.hero-metrics { grid-column: 1 / -1; display: flex; gap: 16px; }
.main-chart   { grid-column: 1; }
.event-feed   { grid-column: 2; grid-row: 3 / 5; }
.bottom-grid  { grid-column: 1; display: flex; gap: 16px; }
```

---

## 数据模型

```ts
// src/types/index.ts

export interface DataPoint {
  timestamp: number
  value: number
}

export interface WindowStats {
  min: number; max: number; avg: number; p95: number
}

export interface TickPayload {
  cpu: { current: number; history: DataPoint[]; stats: WindowStats }
  memory: { used: number; total: number; percentage: number }
  network: {
    upload: number; download: number
    history: { upload: DataPoint[]; download: DataPoint[] }
  }
  errors: { total: number; byType: Record<string, number> }
  metrics: { fcp: number; lcp: number }
}

export interface SignedTick {
  payload: TickPayload
  signature: string
  timestamp: number
}

export interface WorkerCommand {
  cmd: 'tick' | 'setWindow' | 'setHighLoad'
  windowSize: number
  highLoad?: boolean
  injectAnomaly?: boolean
}

export interface EventFeedItem {
  id: string
  time: string
  badge: 'ok' | 'warn' | 'err'
  label: string
  message: string
}
```

---

## 架构设计

### 目录结构

```
src/
├── workers/
│   └── dataWorker.ts          # Worker：数据生成 + 聚合 + 签名
├── composables/
│   ├── useMonitor.ts          # tick → Worker → 接收 → 分发
│   └── useCrypto.ts           # SHA-256 sign/verify
├── components/
│   ├── StatusBar.vue          # 顶部状态栏
│   ├── MetricCard.vue         # Hero 大数字卡片
│   ├── CpuChart.vue           # CPU 趋势主图（唯一有光晕）
│   ├── EventFeed.vue          # 实时事件流
│   ├── NetworkChart.vue       # 网络双折线
│   ├── MemoryGauge.vue        # 环形内存仪表
│   └── ControlButtons.vue     # 控制按钮组
├── types/
│   └── index.ts
├── App.vue                    # 根布局
└── main.ts
```

### 组件树

```
App.vue
├── StatusBar
│   ├── Brand
│   ├── SystemStatus (呼吸点)
│   └── ControlButtons
├── Hero Metrics (4 × MetricCard)
├── Main Chart (CpuChart)
├── EventFeed
└── Bottom Grid
    ├── NetworkChart
    └── MemoryGauge
```

---

## 分阶段开发

### S1：布局骨架 + 静态 Mock（1 天）

- [ ] Vite + Vue3 + TS 初始化
- [ ] 全局 CSS 变量（颜色/字体系统）
- [ ] CSS Grid 布局：Status Bar + Hero ×4 + 主图 + Event Feed + 底部
- [ ] MetricCard、StatusBar、EventFeed 组件（全 mock 数据）
- [ ] 四种卡片入场 stagger 动画
- [ ] Inter + Space Grotesk + JetBrains Mono 字体引入

**验收：** 打开页面，布局正确、颜色统一、字体正确、4 张卡片 stagger 入场。

---

### S2：ECharts 集成 + 自定义主题（1 天）

- [ ] ECharts 全局深色主题注册
- [ ] CpuChart：面积图 + 光晕 + 85% 阈值线
- [ ] NetworkChart：双折线（实线/虚线）
- [ ] MemoryGauge：环形进度
- [ ] EventFeed：假数据滚动动画
- [ ] MetricCard 接入数字过渡（transition color）

**验收：** 6 个区域全部渲染，视觉统一，不像拼凑 demo。主图面积渐变和阈值线清晰。

---

### S3：Web Workers + 实时数据（1 天）

- [ ] `dataWorker.ts`：正弦波 + 随机噪声 + 滑动窗口 + 聚合 + 签名
- [ ] `useMonitor.ts`：tick 循环 → Worker 通信
- [ ] 图表从 mock 切换到 Worker 数据
- [ ] 高负载按钮：数据量 10×，验 Worker 不卡
- [ ] Status Bar 实时显示 Worker Status / FPS

**验收：** Chrome Performance 面板确认主线程 < 16ms/帧。高负载模式图表依然流畅。

---

### S4：Crypto + 异常注入（0.5-1 天）

- [ ] `useCrypto.ts`：sign/verify
- [ ] Worker 生成签名，主线程校验
- [ ] 注入异常 → 签名失败 → CPU 图卡片红框脉冲
- [ ] Event Feed 显示异常事件
- [ ] 3 秒后自动恢复正常

**验收：** 点"注入异常" → 卡片闪红 → Event Feed 有记录 → 3 秒自动恢复。

---

### S5：收尾打磨（0.5 天）

- [ ] 所有 hover 微位移统一
- [ ] 数值更新过渡调平滑
- [ ] 字号/间距/对齐检查
- [ ] 毛玻璃 fallback 测试

**验收：** 项目可演示，30 秒内让面试官相信"这是真监控产品"。

---

## 技术决策

| 决策 | 原因 |
|------|------|
| 不引入 Pinia | 数据只在 App 内流转，`ref/reactive` 足够 |
| 不引入 Vue Router | 单页应用 |
| ECharts 而非手写 Canvas | 重点在 Worker + Crypto，不在图形学 |
| SHA-256 而非 MD5 | 面试可讨论"为什么 SHA-256 更适合完整性校验" |
| 模拟数据而非真实 API | 可控、可复现、可注入异常 |
| 主图光晕 + 普通图不光晕 | 视觉主次分明，一张图一个记忆点 |
