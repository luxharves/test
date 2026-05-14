# Pixel-Pulse 最终视觉设计规范

## 设计目标

**不是"一个页面里放了几个图表"，而是"我打开了一台正在运行的、精密的生产监控终端"。**

风格基调：克制、精密、持续运行中。像 Datadog，不像暴雪战网。

---

## 1. 配色系统

```css
:root {
  /* ---- 底色 ---- */
  --bg-deep:       #060d17;   /* 最深底，页面背景 */
  --bg-elevated:   #0b1521;   /* 抬高一层，卡片背景 */
  --bg-hover:      #0f1b2b;   /* hover 态 */

  /* ---- 面板 & 边框 ---- */
  --panel-bg:      rgba(255, 255, 255, 0.03);
  --panel-border:  rgba(255, 255, 255, 0.07);
  --panel-hover:   rgba(255, 255, 255, 0.06);

  /* ---- 文字 ---- */
  --text-primary:  rgba(255, 255, 255, 0.90);
  --text-secondary:rgba(255, 255, 255, 0.58);
  --text-muted:    rgba(255, 255, 255, 0.35);

  /* ---- 语义色 ---- */
  --accent:        #4fd1ff;   /* 青蓝主色 */
  --accent-soft:   rgba(79, 209, 255, 0.16);
  --success:       #5df2a7;   /* 通过 / 正常 */
  --warning:       #f5b041;   /* 延迟 / 轻微波动 */
  --danger:        #ff6b6b;   /* 异常 / 告警 */

  /* ---- 图表专用 ---- */
  --chart-cpu:     #4fd1ff;
  --chart-memory:  #a78bfa;   /* 紫 */
  --chart-upload:  #4fd1ff;
  --chart-download:rgba(79, 209, 255, 0.35);
  --chart-danger:  #ff6b6b;
  --chart-grid:    rgba(255, 255, 255, 0.06);
}
```

### 为什么是 `#060d17` 而不是 `#050505`

纯黑底 + 高信息密度的图表 = 对比度过高，视觉疲劳。`#060d17` 带一层极淡的靛蓝底色——肉眼未必察觉，但**让上方 rgba 卡片的分层更清晰，让青蓝色 accent 有归属感**。

---

## 2. 字体体系

| 用途 | 字体 | 字重 | 说明 |
|------|------|------|------|
| 主标题（Pixel-Pulse） | Space Grotesk | 600 | 几何感，一点点科技味 |
| 卡片标题 / 标签 | Inter | 500 | 稳定清晰 |
| 数字 / 数据 / 表格 | Inter | 550 | 数字等宽感好，不会歪 |
| 控制面板文字 | Inter | 450 | 小字号仍然可读 |
| 代码 / Event Feed | JetBrains Mono | 400 | monospace，监控终端感 |

### 排版规则

- 小标签（如 `CPU USAGE`）：`font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--text-muted)`
- 大数字（如 `78.4`）：`font-size: 36px; font-weight: 550; color: var(--text-primary)`
- 主标题：`font-size: 16px; font-weight: 600; letter-spacing: -0.01em`
- Event Feed 条目：`font-size: 12px; font-family: 'JetBrains Mono'; color: var(--text-secondary)`

---

## 3. 卡片样式

```css
.monitor-card {
  background: var(--panel-bg);
  border: 1px solid var(--panel-border);
  border-radius: 16px;
  padding: 20px 22px;
  backdrop-filter: blur(12px);

  /* hover 微动 */
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              background 0.2s ease,
              border-color 0.2s ease,
              box-shadow 0.2s ease;
}

.monitor-card:hover {
  transform: translateY(-1px);
  background: var(--panel-hover);
  border-color: rgba(255, 255, 255, 0.10);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
```

**要点：**
- 不靠重阴影区分层次，靠透明度 + 极细边框
- hover 位移 `-1px`，不是 `-4px`——轻、克制
- 没有大光晕跟随鼠标，hover 就是整体微亮

---

## 4. 毛玻璃

只加在**主图区域**那张卡上（不是所有卡片）：

```css
.card-hero {
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

普通卡片不要 blur——加太多 blur 会降低文字锐度，看起来像"没加载完"。

### Fallback

```css
@supports not (backdrop-filter: blur(1px)) {
  .card-hero {
    background: rgba(11, 21, 33, 0.95);
  }
}
```

---

## 5. ECharts 图表主题

### 全局

```js
{
  backgroundColor: 'transparent',
  textStyle: { color: 'rgba(255,255,255,0.58)' },
  grid: {
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 0.5,
  },
  tooltip: {
    backgroundColor: 'rgba(11,21,33,0.95)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderRadius: 10,
    textStyle: { color: 'rgba(255,255,255,0.9)', fontSize: 12 },
  },
}
```

### CPU 面积图（主图，唯一有光晕的地方）

```js
series: [{
  type: 'line',
  smooth: true,
  symbol: 'none',
  lineStyle: { width: 2, color: '#4fd1ff' },
  areaStyle: {
    color: {
      type: 'linear',
      x: 0, y: 0, x2: 0, y2: 1,
      colorStops: [
        { offset: 0, color: 'rgba(79,209,255,0.25)' },
        { offset: 1, color: 'rgba(79,209,255,0.01)' },
      ],
    },
  },
  // 光晕效果 —— 用 ECharts 的 blur 模拟
  emphasis: {
    lineStyle: { shadowBlur: 12, shadowColor: 'rgba(79,209,255,0.5)' },
  },
}]
```

### 阈值线

```js
markLine: {
  silent: true,
  symbol: 'none',
  lineStyle: { type: 'dashed', color: '#ff6b6b', width: 1, opacity: 0.6 },
  label: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },
  data: [{ yAxis: 85, name: '85%' }],
}
```

### 网络双折线

```js
series: [
  { name: '上传', type: 'line', lineStyle: { width: 1.5, color: '#4fd1ff' } },
  { name: '下载', type: 'line', lineStyle: { width: 1.5, color: 'rgba(79,209,255,0.35)', type: 'dashed' } },
]
```

### 错误环形图

```js
series: [{
  type: 'pie',
  radius: ['60%', '80%'],  // 环形
  center: ['50%', '50%'],
  label: { show: false },
  emphasis: { scale: false },  // 不放大，防止抖动
  itemStyle: {
    borderColor: 'transparent',
    borderWidth: 0,
  },
}]
```

---

## 6. 动效规范

### 仅 4 种动效，不加第六种

**1. 页面入场（一次性）**

```css
@keyframes card-enter {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}

.monitor-card {
  animation: card-enter 0.5s ease both;
}
.monitor-card:nth-child(1) { animation-delay: 0ms; }
.monitor-card:nth-child(2) { animation-delay: 80ms; }
.monitor-card:nth-child(3) { animation-delay: 160ms; }
/* ... */
```

**2. 呼吸状态点**

```css
@keyframes breathe {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.4; }
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--success);
  animation: breathe 2s ease-in-out infinite;
}
```

**3. 异常脉冲（触发式，3 秒自动消失）**

```css
@keyframes alert-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4); }
  50%      { box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
}

.card-alert {
  animation: alert-pulse 1s ease 3;
}
```

**4. 数值平滑过渡**

```css
.metric-value {
  transition: color 0.4s ease;
}
```

不算"动效"但是必要的：hover 微位移 `-1px`（已在卡片样式中）。

### 不做

- ❌ 鼠标跟随大高光
- ❌ 卡片位移超过 1px
- ❌ 夸张发光阴影
- ❌ 粒子背景
- ❌ 3D 透视

---

## 7. 页面布局

```
┌───────────────────────────────────────────────────────────────┐
│ PIXEL-PULSE           ● System Operational    1s ▼  60 ▼     │  ← Status Bar
├───────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│ │ CPU USAGE │ │ LATENCY  │ │ ERROR %  │ │ WORKER TIME      │  │  ← Hero Metric ×4
│ │  78.4 %  │ │ 18.4 ms  │ │  0.3 %   │ │   12 ms          │  │
│ └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
├───────────────────────────────────────┬───────────────────────┤
│                                       │  ══ EVENT FEED ══    │
│    CPU TREND (主图 · 50%)              │  14:32:18 CPU spike  │
│    ┌─────────────────────────────┐    │  14:32:16 Sig OK     │
│    │  〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️   │    │  14:32:15 Net 342KB  │
│    │  ---- 85% threshold -----  │    │  14:32:14 Tick 11ms  │
│    │  〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️〰️   │    │  14:32:13 Sig OK     │
│    └─────────────────────────────┘    │                       │
│                                       │                       │
├───────────────────┬───────────────────┤                       │
│  NETWORK THRU     │  MEMORY GAUGE     │                       │
│  ─── Upload       │     ◯ 62%        │                       │
│  ··· Download     │    6.2 / 10 GB   │                       │
└───────────────────┴───────────────────┴───────────────────────┘
```

### 各区域 CSS Grid

```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr 280px;   /* 主图 + Event Feed */
  grid-template-rows: auto auto 1fr auto;
  gap: 16px;
  padding: 24px;
  height: 100vh;
}

.status-bar    { grid-column: 1 / -1; }                    /* 全宽 */
.hero-metrics  { grid-column: 1 / -1; display: flex; gap: 16px; }
.main-chart    { grid-column: 1; }                         /* 主图 */
.event-feed    { grid-column: 2; grid-row: 3 / 5; }        /* 右侧跨两行 */
.bottom-left   { grid-column: 1; display: flex; gap: 16px; } /* Network + Memory */
```

---

## 8. 组件细节规范

### Status Bar

```html
<div class="status-bar">
  <span class="brand">PIXEL-PULSE</span>
  <span class="system-status">
    <span class="status-dot"></span>
    System Operational
  </span>
  <span class="status-info">
    Refresh: 1s  ·  Window: 60  ·  Worker: Active
  </span>
</div>
```

高度 44px，背景 `rgba(255,255,255,0.02)`，底边 `1px solid rgba(255,255,255,0.05)`。

### Hero Metric Card

```html
<div class="metric-card">
  <span class="metric-label">CPU USAGE</span>
  <span class="metric-value">78.4</span>
  <span class="metric-unit">%</span>
</div>
```

标签 10px / 大写 / 字距 1.2px / `--text-muted`  
数值 36px / 550 字重 / `--text-primary`  
单位 14px / `--text-secondary`，跟在数值后面

### Event Feed

```html
<div class="event-feed">
  <div class="feed-header">EVENT FEED</div>
  <div class="feed-list">
    <div class="feed-item">
      <span class="feed-time">14:32:18</span>
      <span class="feed-badge warn">CPU</span>
      <span class="feed-msg">Spike detected (91% → 68%)</span>
    </div>
    <!-- ... -->
  </div>
</div>
```

条目间 `1px solid rgba(255,255,255,0.04)` 分隔  
新条目从底部出现，`animation: card-enter 0.3s ease`  
feed-badge 三种：`ok`（绿）、`warn`（黄）、`err`（红）  
最多显示 20 条，超出自动移除最旧

### 控制面板

不单独做一行——整合到 Status Bar 右侧 + Hero Metric 上方。  
`[▶] [⏸] [🔴异常] [⚡高负载]` 四个按钮，两个模式切换（异常/高负载）为 toggle 样式。

---

## 9. 不做清单（防过度设计）

- ❌ 纯黑底 `#050505`
- ❌ 卡片重阴影
- ❌ 鼠标跟随高光
- ❌ 每个图表都加光晕（只主图有）
- ❌ 粒子 / 网格 / 扫描线背景
- ❌ 第三方字体过多（Space Grotesk + Inter + JetBrains Mono = 够）
- ❌ 暗色模式之外的亮色主题
