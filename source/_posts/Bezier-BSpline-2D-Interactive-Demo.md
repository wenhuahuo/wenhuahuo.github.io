---
title: 二维贝塞尔曲线和 B-spline 的最小交互演示
date: 2026-06-30 00:00:00
description: 用两个最小 Canvas 交互 demo 直观理解二维贝塞尔曲线和 B-spline 曲线。
tags: [Computer Graphics, Geometry, Bezier, B-spline]
categories: 计算机图形学
mathjax: true
---

# 前言

贝塞尔曲线和 B-spline 都是计算机图形学、CAD 和几何建模里非常基础的曲线表示方法。它们的共同点是：曲线不是逐点手工画出来的，而是由一组控制点间接定义。

下面只讨论二维情况。为了直观起见，本文不追求完整理论，只用两个最小交互 demo 展示它们的核心差异：贝塞尔曲线由一整组控制点整体控制，而 B-spline 更强调局部控制。

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
</style>

# 贝塞尔曲线

一条三次贝塞尔曲线由四个控制点 $P_0, P_1, P_2, P_3$ 决定：

$$
B(t)=(1-t)^3P_0+3(1-t)^2tP_1+3(1-t)t^2P_2+t^3P_3,\quad t\in[0,1]
$$

其中 $P_0$ 和 $P_3$ 是曲线的起点和终点，$P_1$ 和 $P_2$ 主要影响曲线的切向和弯曲方式。贝塞尔曲线的一个直观特点是：控制点共同影响整条曲线。

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

<div class="curve-demo-box">
  <canvas id="bspline-demo" width="680" height="360"></canvas>
  <p class="curve-demo-caption">二次 B-spline 曲线：拖动黄色控制点，观察红色曲线的局部变化。</p>
</div>

# 小结

贝塞尔曲线形式简单，适合描述单段曲线；B-spline 更适合描述由多段平滑拼接而成的复杂曲线。简单来说：

- 贝塞尔曲线：一组控制点整体定义一条曲线。
- B-spline：通过节点向量和局部基函数，让控制点对曲线产生更局部的影响。

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

  function eventPoint(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * canvas.width / rect.width,
      y: (event.clientY - rect.top) * canvas.height / rect.height
    };
  }

  function createDemo(canvasId, type, points) {
    var canvas = document.getElementById(canvasId);
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var dragging = -1;
    var degree = 2;
    var knots = openUniformKnots(points.length, degree);

    function curvePoint(t) {
      if (type === 'bezier') return cubicBezier(points, t);
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

      ctx.strokeStyle = type === 'bezier' ? '#2563eb' : '#dc2626';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (var s = 0; s <= 160; s++) {
        var p = curvePoint(s / 160);
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
        ctx.fillText('P' + i, p.x + 11, p.y - 11);
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
  ]);

  createDemo('bspline-demo', 'bspline', [
    { x: 70, y: 275 },
    { x: 170, y: 80 },
    { x: 285, y: 265 },
    { x: 405, y: 95 },
    { x: 520, y: 250 },
    { x: 625, y: 120 }
  ]);
})();
</script>
