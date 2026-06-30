---
title: 二维贝塞尔曲线、B-spline 和 NURBS 的最小交互演示
date: 2026-06-30 00:00:00
description: 用三个最小 Canvas 交互 demo 直观理解二维贝塞尔曲线、B-spline 和 NURBS 曲线。
tags: [Computer Graphics, Geometry, Bezier, B-spline, NURBS]
categories: 计算机图形学
mathjax: true
---

# 前言

贝塞尔曲线、B-spline 和 NURBS 都是计算机图形学、CAD 和几何建模里非常基础的曲线表示方法。它们的共同点是：曲线不是逐点手工画出来的，而是由一组控制点间接定义。

下面只讨论二维情况。为了直观起见，本文不追求完整理论，只用三个最小交互 demo 展示它们的核心差异：贝塞尔曲线由一整组控制点整体控制，B-spline 更强调局部控制，NURBS 则在 B-spline 的基础上进一步加入权重。

<!-- more -->

<style>
.curve-demo-box {
  margin: 1.2rem 0 2rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
}
.curve-demo-box canvas {
  display: block;
  width: 100%;
  max-width: 680px;
  height: auto;
  margin: 0 auto;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  touch-action: none;
}
.curve-demo-caption {
  margin: .7rem auto 0;
  max-width: 680px;
  color: #666;
  font-size: .92rem;
}
.nurbs-weight-controls {
  max-width: 680px;
  margin: .8rem auto 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: .5rem .8rem;
  color: #444;
  font-size: .9rem;
}
.nurbs-weight-controls label {
  display: flex;
  align-items: center;
  gap: .35rem;
}
.nurbs-weight-controls input {
  width: 90px;
}
</style>

# 贝塞尔曲线

一条三次贝塞尔曲线由四个控制点 $P_0, P_1, P_2, P_3$ 决定：

$$
B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3,\quad t\in[0,1]
$$

其中 $P_0$ 和 $P_3$ 是曲线的起点和终点，$P_1$ 和 $P_2$ 主要影响曲线的切向和弯曲方式。贝塞尔曲线的一个直观特点是：控制点共同影响整条曲线。

## 简要推导

贝塞尔曲线可以从反复线性插值得到。设线性插值为：

$$
L(A,B;t)=(1-t)A+tB
$$

对四个控制点先做第一层插值：

$$
Q_0=L(P_0,P_1;t),\quad Q_1=L(P_1,P_2;t),\quad Q_2=L(P_2,P_3;t)
$$

再做第二层插值：

$$
R_0=L(Q_0,Q_1;t),\quad R_1=L(Q_1,Q_2;t)
$$

最后得到曲线点：

$$
B(t)=L(R_0,R_1;t)
$$

把上面的插值式展开，就得到三次贝塞尔曲线的 Bernstein 形式：

$$
B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3
$$

<div class="curve-demo-box">
  <canvas id="bezier-demo" width="680" height="360"></canvas>
  <p class="curve-demo-caption">三次贝塞尔曲线：拖动黄色控制点，观察整条蓝色曲线如何变化。</p>
</div>

# B-spline 曲线

B-spline 也由控制点定义，但它额外引入了次数和节点向量。直观理解是：曲线被分成若干段，每一段只受附近几个控制点影响。

一个 B-spline 可以写成：

$$
C(t)=\sum_i N_{i,p}(t)P_i
$$

其中 $P_i$ 是控制点，$p$ 是曲线次数，$N_{i,p}(t)$ 是由节点向量决定的基函数。下面的 demo 使用二次 B-spline，节点向量为：

$$
[0,0,0,0.25,0.5,0.75,1,1,1]
$$

B-spline 最值得注意的是局部性：移动某个控制点时，通常只会明显影响曲线附近的一部分，而不是整条曲线。

## 简要推导

B-spline 的核心是基函数。给定节点向量：

$$
U=[u_0,u_1,\ldots,u_m]
$$

零次基函数是分段常数：

$$
N_{i,0}(t)=
\begin{cases}
1, & u_i\le t<u_{i+1} \\
0, & \text{otherwise}
\end{cases}
$$

更高次数的基函数由 Cox-de Boor 递推公式得到：

$$
N_{i,p}(t)=
\frac{t-u_i}{u_{i+p}-u_i}N_{i,p-1}(t)+
\frac{u_{i+p+1}-t}{u_{i+p+1}-u_{i+1}}N_{i+1,p-1}(t)
$$

把这些局部基函数作为权重加到控制点上，就得到 B-spline 曲线：

$$
C(t)=\sum_i N_{i,p}(t)P_i
$$

因为 $N_{i,p}(t)$ 只在有限区间 $[u_i,u_{i+p+1})$ 内非零，所以每个控制点通常只影响曲线的一小段，这就是 B-spline 的局部控制性来源。

<div class="curve-demo-box">
  <canvas id="bspline-demo" width="680" height="360"></canvas>
  <p class="curve-demo-caption">二次 B-spline 曲线：拖动黄色控制点，观察红色曲线的局部变化。</p>
</div>

# NURBS 曲线

NURBS 是 Non-Uniform Rational B-spline 的缩写，可以理解为“带权重的有理 B-spline”。它仍然使用 B-spline 基函数，但给每个控制点额外分配一个权重 $w_i$：

$$
C(t)=\frac{\sum_i w_i N_{i,p}(t)P_i}{\sum_i w_i N_{i,p}(t)}
$$

也可以写成有理基函数形式：

$$
R_{i,p}(t)=\frac{w_iN_{i,p}(t)}{\sum_j w_jN_{j,p}(t)},\quad C(t)=\sum_i R_{i,p}(t)P_i
$$

当所有权重都等于 $1$ 时，NURBS 就退化为普通 B-spline。某个控制点的权重越大，曲线越容易被拉向该控制点。NURBS 在 CAD 中非常重要，因为它不仅能表示自由曲线，也能精确表示圆弧、圆锥曲线等几何对象。

## 简要推导

NURBS 可以从齐次坐标理解。把二维控制点 $P_i=(x_i,y_i)$ 扩展为带权重的齐次点：

$$
\tilde P_i=(w_ix_i,w_iy_i,w_i)
$$

先在齐次空间里做一条普通 B-spline：

$$
\tilde C(t)=\sum_i N_{i,p}(t)\tilde P_i
$$

设 $\tilde C(t)=(X(t),Y(t),W(t))$，再投影回二维平面：

$$
C(t)=\left(\frac{X(t)}{W(t)},\frac{Y(t)}{W(t)}\right)
$$

把 $X(t)$、$Y(t)$ 和 $W(t)$ 展开，就得到前面的 NURBS 有理形式。

<div class="curve-demo-box">
  <canvas id="nurbs-demo" width="680" height="360"></canvas>
  <div id="nurbs-weights" class="nurbs-weight-controls">
    <label>P0 权重 <input type="range" data-index="0" min="0.2" max="4" step="0.1" value="1"><span>1.0</span></label>
    <label>P1 权重 <input type="range" data-index="1" min="0.2" max="4" step="0.1" value="1"><span>1.0</span></label>
    <label>P2 权重 <input type="range" data-index="2" min="0.2" max="4" step="0.1" value="3"><span>3.0</span></label>
    <label>P3 权重 <input type="range" data-index="3" min="0.2" max="4" step="0.1" value="1"><span>1.0</span></label>
    <label>P4 权重 <input type="range" data-index="4" min="0.2" max="4" step="0.1" value="1"><span>1.0</span></label>
  </div>
  <p class="curve-demo-caption">二次 NURBS 曲线：拖动黄色控制点，或调节权重，观察紫色曲线如何被高权重控制点吸引。</p>
</div>

# 小结

贝塞尔曲线形式简单，适合描述单段曲线；B-spline 更适合描述由多段平滑拼接而成的复杂曲线；NURBS 在 B-spline 的基础上加入权重，因此表达能力更强。简单来说：

- 贝塞尔曲线：一组控制点整体定义一条曲线。
- B-spline：通过节点向量和局部基函数，让控制点对曲线产生更局部的影响。
- NURBS：在 B-spline 的基础上加入权重，可以让曲线更靠近某些控制点，也能表示更丰富的几何形状。

<script>
(function () {
  function cubicBezier(points, t) {
    var u = 1 - t;
    return {
      x: u * u * u * points[0].x + 3 * u * u * t * points[1].x + 3 * u * t * t * points[2].x + t * t * t * points[3].x,
      y: u * u * u * points[0].y + 3 * u * u * t * points[1].y + 3 * u * t * t * points[2].y + t * t * t * points[3].y
    };
  }

  function openUniformKnots(pointCount, degree) {
    var knots = [];
    var interior = pointCount - degree - 1;
    for (var i = 0; i <= degree; i++) knots.push(0);
    for (var j = 1; j <= interior; j++) knots.push(j / (interior + 1));
    for (var k = 0; k <= degree; k++) knots.push(1);
    return knots;
  }

  function basis(i, degree, t, knots) {
    if (degree === 0) {
      if ((knots[i] <= t && t < knots[i + 1]) || (t === 1 && knots[i] <= t && knots[i + 1] === 1)) return 1;
      return 0;
    }
    var leftDenom = knots[i + degree] - knots[i];
    var rightDenom = knots[i + degree + 1] - knots[i + 1];
    var left = leftDenom === 0 ? 0 : (t - knots[i]) / leftDenom * basis(i, degree - 1, t, knots);
    var right = rightDenom === 0 ? 0 : (knots[i + degree + 1] - t) / rightDenom * basis(i + 1, degree - 1, t, knots);
    return left + right;
  }

  function bsplinePoint(points, degree, knots, t) {
    var p = { x: 0, y: 0 };
    for (var i = 0; i < points.length; i++) {
      var b = basis(i, degree, t, knots);
      p.x += b * points[i].x;
      p.y += b * points[i].y;
    }
    return p;
  }

  function nurbsPoint(points, weights, degree, knots, t) {
    var x = 0;
    var y = 0;
    var d = 0;
    for (var i = 0; i < points.length; i++) {
      var b = basis(i, degree, t, knots) * weights[i];
      x += b * points[i].x;
      y += b * points[i].y;
      d += b;
    }
    return { x: x / d, y: y / d };
  }

  function eventPoint(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  function createDemo(canvasId, type, points, options) {
    options = options || {};
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dragging = -1;
    var degree = 2;
    var knots = openUniformKnots(points.length, degree);
    var weights = options.weights || points.map(function () { return 1; });

    function curvePoint(t) {
      if (type === 'bezier') return cubicBezier(points, t);
      if (type === 'nurbs') return nurbsPoint(points, weights, degree, knots, t);
      return bsplinePoint(points, degree, knots, t);
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#9ca3af';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      points.forEach(function (p, i) {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = options.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var s = 0; s <= 180; s++) {
        var p = curvePoint(s / 180);
        if (s === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.stroke();

      points.forEach(function (p, i) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#facc15';
        ctx.fill();
        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = '#111827';
        ctx.font = '13px sans-serif';
        var label = 'P' + i;
        if (type === 'nurbs') label += ' w=' + weights[i].toFixed(1);
        ctx.fillText(label, p.x + 11, p.y - 11);
      });
    }

    if (options.weightContainerId) {
      var controls = document.getElementById(options.weightContainerId).querySelectorAll('input[type="range"]');
      controls.forEach(function (input) {
        input.addEventListener('input', function () {
          var index = Number(input.dataset.index);
          weights[index] = Number(input.value);
          input.nextElementSibling.textContent = weights[index].toFixed(1);
          draw();
        });
      });
    }

    canvas.addEventListener('pointerdown', function (event) {
      var m = eventPoint(canvas, event);
      for (var i = 0; i < points.length; i++) {
        var dx = points[i].x - m.x;
        var dy = points[i].y - m.y;
        if (Math.sqrt(dx * dx + dy * dy) < 14) {
          dragging = i;
          canvas.setPointerCapture(event.pointerId);
          break;
        }
      }
    });

    canvas.addEventListener('pointermove', function (event) {
      if (dragging < 0) return;
      var m = eventPoint(canvas, event);
      points[dragging].x = Math.max(16, Math.min(canvas.width - 16, m.x));
      points[dragging].y = Math.max(16, Math.min(canvas.height - 16, m.y));
      draw();
    });

    canvas.addEventListener('pointerup', function () { dragging = -1; });
    canvas.addEventListener('pointerleave', function () { dragging = -1; });

    draw();
  }

  createDemo('bezier-demo', 'bezier', [
    { x: 80, y: 285 },
    { x: 210, y: 60 },
    { x: 470, y: 70 },
    { x: 600, y: 285 }
  ], { color: '#2563eb' });

  createDemo('bspline-demo', 'bspline', [
    { x: 70, y: 275 },
    { x: 170, y: 80 },
    { x: 285, y: 265 },
    { x: 405, y: 95 },
    { x: 520, y: 250 },
    { x: 625, y: 120 }
  ], { color: '#dc2626' });

  createDemo('nurbs-demo', 'nurbs', [
    { x: 85, y: 270 },
    { x: 215, y: 85 },
    { x: 340, y: 275 },
    { x: 465, y: 85 },
    { x: 595, y: 270 }
  ], {
    color: '#7c3aed',
    weights: [1, 1, 3, 1, 1],
    weightContainerId: 'nurbs-weights'
  });
})();
</script>
