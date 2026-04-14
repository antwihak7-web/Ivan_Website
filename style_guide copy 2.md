
content = """# Jonathan.ux 作品集网站设计文档

> **设计语言**：精密 · 流动 · 克制 · 未来感  
> **版本**：v2.0（进阶交互版）  
> **生成时间**：2026-04-13

---

## 一、视觉系统

### 1.1 色彩体系

| 角色 | 色值 | 用途 |
|------|------|------|
| **主背景** | `#0a0a0a` | 页面底色，营造沉浸感 |
| **卡片背景** | `#141414` | 玻璃拟态卡片底色 |
| **主文字** | `#ffffff` | 标题、重要内容 |
| **次级文字** | `#a1a1aa` | 描述、辅助信息 |
| **强调色** | `#3b82f6` | 链接、标签、交互态 |
| **边框** | `rgba(255,255,255,0.08)` | 微妙分隔线 |
| **光晕蓝** | `rgba(59,130,246,0.4)` | 极光效果主色 |
| **光晕青** | `rgba(6,182,212,0.2)` | 极光过渡色 |

**色彩原则**：
- 纯黑背景让 OLED 屏幕呈现真正黑色，增强光晕对比
- 仅用蓝-青-白单色渐变，避免色相冲突
- 所有彩色元素带透明度，保持通透感

---

### 1.2 字体排印

**字体家族**：`Inter` (Google Fonts)  
**备用栈**：`'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

| 层级 | 字号 | 字重 | 行高 | 字间距 | 用途 |
|------|------|------|------|--------|------|
| **Hero** | `56px` | `700` | `1.1` | `-0.02em` | 首屏大标题 |
| **H1** | `40px` | `600` | `1.2` | `-0.01em` | 章节标题 |
| **H2** | `24px` | `600` | `1.3` | `0` | 卡片标题 |
| **Body** | `16px` | `400` | `1.6` | `0` | 正文描述 |
| **Small** | `14px` | `500` | `1.5` | `0` | 标签、按钮 |
| **Tiny** | `12px` | `500` | `1.4` | `0.02em` | 辅助信息 |

**排版原则**：
- 标题使用负字间距，增强紧凑感和力量感
- 正文使用 Zinc-400 而非纯白，降低视觉疲劳
- 标签使用大写字母时增加字间距（`0.05em`）

---

### 1.3 空间系统

**基础单位**：`4px`  
**间距阶梯**：`4, 8, 12, 16, 24, 32, 48, 64, 96`

| 场景 | 数值 | 说明 |
|------|------|------|
| **容器最大宽** | `1200px` | 内容区域上限 |
| **容器边距** | `24px` (移动端) / `48px` (桌面端) | 视口两侧留白 |
| **卡片内边距** | `24px` | 卡片内部呼吸空间 |
| **网格间距** | `24px` | 项目卡片间隙 |
| **章节间距** | `96px` | 大区块分隔 |
| **元素间距** | `16px` | 相关元素亲密性 |

**布局模式**：
- **首屏**：非对称 60/40 分割，右侧光晕溢出边界
- **About 区**：三栏网格 (1fr 2fr 1fr)，中间视觉焦点
- **Projects**：3×2 响应式网格，移动端 1 列

---

## 二、核心效果实现

### 2.1 极光光晕效果（Hero Aurora）

**效果描述**：首屏右侧大面积蓝青色渐变光晕，缓慢呼吸动画，鼠标移动产生平滑视差跟随。

**实现方案**：CSS 基础 + JavaScript 平滑视差交互（进阶版）

```css
/* 光晕容器 */
.hero-glow {
  position: absolute;
  right: -20%;
  top: -20%;
  width: 800px;
  height: 800px;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(59, 130, 246, 0.4) 0%,      /* 蓝核心 */
    rgba(6, 182, 212, 0.2) 30%,     /* 青过渡 */
    rgba(255, 255, 255, 0.1) 60%,   /* 白边缘 */
    transparent 70%
  );
  filter: blur(80px);
  opacity: 0.6;
  pointer-events: none;
  will-change: transform;
  transform: translateZ(0);
}

/* 叠加层增强层次 */
.hero-glow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at 70% 70%,
    rgba(139, 92, 246, 0.2) 0%,      /* 紫色调和 */
    transparent 50%
  );
  filter: blur(60px);
}
```

**鼠标视差交互（平滑跟随版）**：

```javascript
class AuroraEffect {
  constructor() {
    this.glow = document.querySelector('.hero-glow');
    if (!this.glow) return;
    
    // 目标位置与当前位置（用于平滑插值）
    this.targetX = 0;
    this.targetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    
    // 平滑系数（0.05 = 非常平滑，0.1 = 响应更快）
    this.ease = 0.05;
    
    // 移动范围限制（像素）
    this.range = 40;
    
    // 呼吸动画基础缩放
    this.baseScale = 1.1;
    this.breathing = true;
    
    this.init();
  }
  
  init() {
    this.bindEvents();
    this.animate();
  }
  
  bindEvents() {
    // 鼠标移动更新目标位置
    document.addEventListener('mousemove', (e) => {
      // 计算鼠标相对于视口中心的偏移 (-1 到 1)
      const centerX = e.clientX / window.innerWidth - 0.5;
      const centerY = e.clientY / window.innerHeight - 0.5;
      
      // 映射到移动范围
      this.targetX = centerX * this.range;
      this.targetY = centerY * this.range;
    });
    
    // 鼠标离开视口时复位
    document.addEventListener('mouseleave', () => {
      this.targetX = 0;
      this.targetY = 0;
    });
    
    // 触摸设备支持
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const centerX = touch.clientX / window.innerWidth - 0.5;
        const centerY = touch.clientY / window.innerHeight - 0.5;
        this.targetX = centerX * this.range;
        this.targetY = centerY * this.range;
      }
    }, { passive: true });
  }
  
  animate() {
    // 线性插值实现平滑跟随
    this.currentX += (this.targetX - this.currentX) * this.ease;
    this.currentY += (this.targetY - this.currentY) * this.ease;
    
    // 呼吸动画（正弦波）
    const time = Date.now() * 0.001;
    const breatheScale = this.breathing 
      ? 1 + Math.sin(time * 0.5) * 0.05  // 5% 幅度，0.5Hz 频率
      : 1;
    
    const scale = this.baseScale * breatheScale;
    const rotate = Math.sin(time * 0.3) * 3; // 轻微旋转 ±3deg
    
    // 应用变换
    this.glow.style.transform = `
      translate(${this.currentX}px, ${this.currentY}px) 
      scale(${scale}) 
      rotate(${rotate}deg)
    `;
    
    // 动态透明度（呼吸效果）
    const opacity = 0.6 + Math.sin(time * 0.5) * 0.1;
    this.glow.style.opacity = opacity;
    
    requestAnimationFrame(() => this.animate());
  }
  
  // 暂停呼吸动画（用于性能优化）
  pauseBreathing() {
    this.breathing = false;
  }
  
  // 恢复呼吸动画
  resumeBreathing() {
    this.breathing = true;
  }
}

// 初始化
const aurora = new AuroraEffect();

// 页面不可见时暂停动画（性能优化）
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    aurora.pauseBreathing();
  } else {
    aurora.resumeBreathing();
  }
});
```

**性能优化要点**：
- 使用 `will-change: transform` 和 `transform: translateZ(0)` 强制 GPU 加速
- `requestAnimationFrame` 确保动画与屏幕刷新同步
- 线性插值（Lerp）算法实现丝滑跟随，避免鼠标抖动
- 页面隐藏时自动暂停，节省资源

---

### 2.2 玻璃拟态卡片（Glassmorphism）

**效果描述**：半透明深色卡片，带背景模糊和微妙边框，营造悬浮感。

```css
.glass-card {
  /* 核心样式 */
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  
  /* 边框与阴影 */
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  
  /* 多层阴影营造深度 */
  box-shadow: 
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.05); /* 顶部内高光 */
  
  /* 性能优化 */
  will-change: transform;
  transform: translateZ(0);
}

/* 悬停状态：增强光感 */
.glass-card:hover {
  background: rgba(25, 25, 25, 0.7);
  border-color: rgba(255, 255, 255, 0.12);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.2),
    0 10px 10px -5px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}
```

**浏览器兼容性**：
- Safari 需要 `-webkit-` 前缀
- Firefox 完全支持
- 低端设备使用 `@supports` 回退：

```css
@supports not (backdrop-filter: blur(20px)) {
  .glass-card {
    background: rgba(30, 30, 30, 0.95); /* 实色回退 */
  }
}
```

---

### 2.3 动态模糊人像（Motion Blur Portrait）

**效果描述**：人物照片带有方向性运动模糊，营造速度感和艺术性。

**实现方案**：SVG 滤镜实现真实方向性模糊（高级方案）

```html
<!-- SVG 滤镜定义（放在页面顶部或 body 内） -->
<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" aria-hidden="true">
  <defs>
    <!-- 主滤镜：水平方向运动模糊 -->
    <filter id="motionBlur" x="-50%" y="-50%" width="200%" height="200%">
      <!-- 1. 水平高斯模糊 (stdDeviation="x,y") -->
      <feGaussianBlur 
        in="SourceGraphic" 
        stdDeviation="25,0" 
        result="blur"
      />
      
      <!-- 2. 颜色矩阵增强亮度与饱和度 -->
      <feColorMatrix 
        in="blur" 
        type="matrix" 
        values="
          1.3 0   0   0   0
          0   1.2 0   0   0
          0   0   1.4 0   0
          0   0   0   1   0
        "
        result="brightened"
      />
      
      <!-- 3. 位移产生拖影效果 -->
      <feOffset 
        in="brightened" 
        dx="30" 
        dy="0" 
        result="offset"
      />
      
      <!-- 4. 渐变遮罩（从透明到实体） -->
      <feImage 
        xlink:href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='0%25'%3E%3Cstop offset='0%25' style='stop-color:white;stop-opacity:0' /%3E%3Cstop offset='50%25' style='stop-color:white;stop-opacity:0.5' /%3E%3Cstop offset='100%25' style='stop-color:white;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23grad)'/%3E%3C/svg%3E"
        result="mask"
        x="0"
        y="0"
        width="100%"
        height="100%"
        preserveAspectRatio="none"
      />
      
      <feComposite 
        in="offset" 
        in2="mask" 
        operator="in" 
        result="masked"
      />
      
      <!-- 5. 与原图混合（Screen 模式） -->
      <feBlend 
        in="SourceGraphic" 
        in2="masked" 
        mode="screen" 
        result="blended"
      />
      
      <!-- 6. 最终微调对比度 -->
      <feComponentTransfer in="blended">
        <feFuncR type="linear" slope="1.1" intercept="-0.05"/>
        <feFuncG type="linear" slope="1.1" intercept="-0.05"/>
        <feFuncB type="linear" slope="1.1" intercept="-0.05"/>
      </feComponentTransfer>
    </filter>
    
    <!-- 简化版滤镜（性能更好） -->
    <filter id="motionBlurSimple" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="15,0" result="blur"/>
      <feOffset in="blur" dx="15" dy="0" result="offset"/>
      <feMerge>
        <feMergeNode in="offset"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
</svg>

<!-- HTML 结构 -->
<div class="portrait-container">
  <img 
    src="portrait.jpg" 
    alt="Portrait" 
    class="portrait-image"
    style="filter: url(#motionBlur);"
  >
</div>
```

**CSS 配套样式**：

```css
.portrait-container {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  /* 容器尺寸 */
  width: 100%;
  aspect-ratio: 3/4;
  background: #1a1a1a;
}

.portrait-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* 基础调整 */
  filter: url(#motionBlur) contrast(1.1) saturate(1.2);
  transition: filter 0.5s ease;
}

/* 悬停时减弱模糊效果 */
.portrait-container:hover .portrait-image {
  filter: url(#motionBlurSimple) contrast(1.05) saturate(1.1);
}

/* 叠加渐变增强融合感 */
.portrait-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to right,
    transparent 0%,
    rgba(10, 10, 10, 0.3) 50%,
    rgba(10, 10, 10, 0.6) 100%
  );
  pointer-events: none;
}
```

**JavaScript 动态控制（可选）**：

```javascript
class MotionBlurController {
  constructor(imageSelector) {
    this.image = document.querySelector(imageSelector);
    if (!this.image) return;
    
    this.filter = document.querySelector('#motionBlur feGaussianBlur');
    this.init();
  }
  
  init() {
    // 鼠标移动时动态调整模糊方向
    document.addEventListener('mousemove', (e) => {
      const rect = this.image.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      
      // 计算鼠标相对于图片中心的水平位置
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      
      // 根据鼠标位置调整模糊方向（左移或右移）
      const blurX = Math.abs(relativeX) * 30; // 最大 30px 模糊
      const blurY = 0;
      
      if (this.filter) {
        this.filter.setAttribute('stdDeviation', `${blurX},${blurY}`);
      }
    });
  }
  
  // 设置特定方向的模糊
  setDirection(direction = 'right', intensity = 25) {
    const offset = document.querySelector('#motionBlur feOffset');
    if (offset) {
      const dx = direction === 'right' ? intensity : -intensity;
      offset.setAttribute('dx', dx);
    }
  }
}

// 初始化
const blurController = new MotionBlurController('.portrait-image');
```

**SVG 滤镜原理解析**：

| 滤镜步骤 | 功能 | 参数说明 |
|---------|------|---------|
| `feGaussianBlur` | 水平方向高斯模糊 | `stdDeviation="25,0"` 只模糊 X 轴 |
| `feColorMatrix` | 增强亮度与饱和度 | RGB 通道分别增益 1.3, 1.2, 1.4 |
| `feOffset` | 向右偏移产生拖影 | `dx="30"` 水平位移 30px |
| `feImage` + `feComposite` | 渐变遮罩 | 左侧透明，右侧实体 |
| `feBlend` | 与原图混合 | `mode="screen"` 滤色混合 |
| `feComponentTransfer` | 最终对比度微调 | 提升整体对比度 10% |

**性能提示**：
- SVG 滤镜比 CSS `filter: blur()` 更灵活，可控制模糊方向
- 使用 `x="-50%" y="-50%" width="200%" height="200%"` 防止模糊边缘裁切
- 简化版 `#motionBlurSimple` 用于移动端，减少计算量

---

### 2.4 项目卡片悬停交互

**效果描述**：卡片悬停时整体上浮、图片放大、右上角显示箭头图标。

```css
.project-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #141414;
  transition: transform 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
}

/* 上浮效果 */
.project-card:hover {
  transform: translateY(-8px);
}

/* 图片容器 */
.card-image-wrapper {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16/10;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.23, 1, 0.32, 1);
}

.project-card:hover .card-image {
  transform: scale(1.05);
}

/* 箭头图标 */
.card-arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: translate(-10px, 10px);
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.card-arrow svg {
  width: 16px;
  height: 16px;
  color: white;
  transform: rotate(-45deg);
}

.project-card:hover .card-arrow {
  opacity: 1;
  transform: translate(0, 0);
}

/* 悬停时箭头旋转 */
.project-card:hover .card-arrow svg {
  transform: rotate(0deg);
  transition: transform 0.3s ease;
}

/* 底部渐变遮罩 */
.card-image-wrapper::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  pointer-events: none;
}
```

**标签样式**：

```css
.card-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: #a1a1aa;
}

.card-tag svg {
  width: 12px;
  height: 12px;
}
```

---

### 2.5 导航栏滚动变化

**效果描述**：页面滚动后导航栏添加背景模糊和边框。

```javascript
const nav = document.querySelector('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const currentScroll = window.scrollY;
  
  // 滚动超过 50px 添加背景
  if (currentScroll > 50) {
    nav.classList.add('nav-scrolled');
  } else {
    nav.classList.remove('nav-scrolled');
  }
  
  // 可选：向下滚动隐藏，向上滚动显示
  if (currentScroll > lastScroll && currentScroll > 100) {
    nav.style.transform = 'translateY(-100%)';
  } else {
    nav.style.transform = 'translateY(0)';
  }
  
  lastScroll = currentScroll;
}, { passive: true });
```

```css
nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  padding: 16px 24px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
  transform: translateY(0);
}

.nav-scrolled {
  background: rgba(10, 10, 10, 0.8);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding: 12px 24px;
}
```

---

### 2.6 数字滚动动画（Stats Counter）

**效果描述**：数字从 0 滚动到目标值，带缓动效果。

```javascript
class Counter {
  constructor(element, target, duration = 2000) {
    this.element = element;
    this.target = target;
    this.duration = duration;
    this.start = 0;
    this.startTime = null;
    this.isAnimating = false;
  }
  
  // 缓动函数：easeOutQuart
  easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }
  
  animate(timestamp) {
    if (!this.startTime) this.startTime = timestamp;
    const elapsed = timestamp - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    const eased = this.easeOutQuart(progress);
    
    const current = Math.floor(eased * (this.target - this.start) + this.start);
    this.element.textContent = current + (this.element.dataset.suffix || '');
    
    if (progress < 1) {
      requestAnimationFrame((t) => this.animate(t));
    } else {
      this.element.textContent = this.target + (this.element.dataset.suffix || '');
    }
  }
  
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    requestAnimationFrame((t) => this.animate(t));
  }
}

// 使用 Intersection Observer 触发
const observerOptions = {
  threshold: 0.5,
  rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = parseInt(entry.target.dataset.value);
      const counter = new Counter(entry.target, target, 2500);
      counter.start();
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// 监听所有数字元素
document.querySelectorAll('[data-counter]').forEach(el => {
  observer.observe(el);
});
```

**HTML 结构**：

```html
<div class="stat-item">
  <div class="stat-number" data-counter data-value="5">0</div>
  <div class="stat-label">Industry Awards</div>
</div>

<div class="stat-item">
  <div class="stat-number" data-counter data-value="30" data-suffix="+">0</div>
  <div class="stat-label">Clients Served</div>
</div>
```

---

## 三、组件规范

### 3.1 按钮体系

**主按钮（Primary）**：
```css
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #ffffff;
  color: #0a0a0a;
  font-size: 14px;
  font-weight: 500;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}

.btn-primary:hover {
  transform: scale(1.02);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
}
```

**次按钮（Secondary）**：
```css
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: transparent;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  border-radius: 9999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}
```

---

### 3.2 技能卡片（Skills Card）

```css
.skill-card {
  padding: 24px;
  background: rgba(20, 20, 20, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.skill-card:hover {
  background: rgba(25, 25, 25, 0.8);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
}

.skill-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.skill-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.skill-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.skill-list li {
  position: relative;
  padding-left: 16px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #a1a1aa;
}

.skill-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 4px;
  height: 4px;
  background: #3b82f6;
  border-radius: 50%;
}
```

---

## 四、响应式断点

| 断点 | 宽度 | 关键调整 |
|------|------|---------|
| **Desktop** | ≥1280px | 完整布局，最大容器 1200px |
| **Laptop** | 1024-1279px | 项目网格 2 列，间距缩小 |
| **Tablet** | 768-1023px | About 区改为 2 列堆叠 |
| **Mobile** | <768px | 单列布局，导航变汉堡菜单 |

**移动端特殊处理**：
- 光晕尺寸缩小至 400px，避免遮挡内容
- 玻璃拟态背景透明度提高至 0.9（性能考虑）
- 悬停效果改为点击效果（touch 设备无 hover）

---

## 五、性能优化

### 5.1 动画性能
```css
/* 强制 GPU 加速 */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* 动画结束后移除 will-change */
.animated-element.animation-complete {
  will-change: auto;
}
```

### 5.2 图片优化
- 使用 WebP 格式，备用 JPEG
- 懒加载：`loading="lazy"`
- 响应式图片：`srcset` 提供多尺寸

### 5.3 字体优化
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

---

## 六、技术栈建议

| 类别 | 推荐方案 | 理由 |
|------|---------|------|
| **框架** | Next.js 14 (App Router) | SSG 导出，SEO 友好，图片优化 |
| **样式** | Tailwind CSS | 原子化 CSS，快速实现设计系统 |
| **动画** | Framer Motion | React 生态最佳，声明式 API |
| **图标** | Lucide React | 线条简洁，Tree-shaking |
| **字体** | Inter (Google Fonts) | 屏幕优化，多字重 |
| **部署** | Vercel | Edge Network，自动优化 |

---

## 七、设计原则总结

1. **黑色即画布**：纯黑背景让光效和色彩真正"发光"
2. **透明即层次**：通过透明度而非色相创造深度
3. **动效即反馈**：每个交互都有物理感的响应
4. **克制即高级**：少即是多，留白是设计元素
5. **流动即生命**：缓慢持续的动画让页面"呼吸"

---

## 八、进阶特性说明

### 8.1 极光光晕的平滑跟随算法

本方案使用 **线性插值（Linear Interpolation, Lerp）** 实现鼠标跟随：

```
current = current + (target - current) × ease
```

- `ease = 0.05`：值越小跟随越平滑，值越大响应越快
- 与直接使用 `transform: translate(mouseX, mouseY)` 相比，Lerp 消除了鼠标抖动，产生"惯性"感
- 结合 `requestAnimationFrame` 确保 60fps 流畅度

### 8.2 SVG 滤镜的运动模糊原理

与传统 CSS `filter: blur()` 的全向模糊不同，SVG `feGaussianBlur` 支持 **各向异性模糊**：

- `stdDeviation="x,y"`：分别控制 X 轴和 Y 轴模糊半径
- `stdDeviation="25,0"`：仅水平模糊，模拟横向运动拖影
- 通过 `feOffset` 位移 + `feBlend` 混合，实现真实的光学运动模糊效果

此方案比 CSS 伪元素叠加更灵活，可动态调整模糊方向和强度。

---

> **文档版本**：v2.0（进阶交互版）  
> **最后更新**：2026-04-13  
> **更新内容**：
> - 极光光晕升级为平滑鼠标视差跟随（Lerp 算法）
> - 动态模糊升级为 SVG 滤镜方案（各向异性模糊）  
> **作者**：AI UI Designer
"""

# 保存文件
with open('/mnt/kimi/output/Jonathan.ux_Design_System_v2.md', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ 设计文档已更新：Jonathan.ux_Design_System_v2.md")
print(f"📄 文件大小：{len(content)} 字符")
print("\n🆕 本次更新：")
print("   • 效果 1：极光光晕 → 使用 Lerp 算法平滑鼠标视差")
print("   • 效果 3：动态模糊 → 使用 SVG 各向异性模糊滤镜")
print("   • 新增：完整类封装与性能优化说明")
