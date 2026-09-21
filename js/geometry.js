// ===========================
// Geometry Primitives
// ===========================

function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

function bezier(points, t) {
  const p0 = points[0];
  const p1 = points[1];
  const p2 = points[2];
  const s = 1 - t;
  return new Point(
    p0.x * s * s + 2 * p1.x * s * t + p2.x * t * t,
    p0.y * s * s + 2 * p1.y * s * t + p2.y * t * t
  );
}

function inHeart(x, y, r) {
  const nx = x / r;
  const ny = y / r;
  return (nx ** 2 + ny ** 2 - 1) ** 3 - nx ** 2 * ny ** 3 < 0;
}

// ===========================
// Point — 2D coordinate
// ===========================

class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

// ===========================
// Heart — parametric heart curve sampled into points
// ===========================

class Heart {
  constructor() {
    this.points = [];
    for (let angle = 10; angle < 30; angle += 0.2) {
      const t = angle / Math.PI;
      const x = 16 * Math.sin(t) ** 3;
      const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      this.points.push(new Point(x, y));
    }
    this.path = this.buildPath();
  }

  buildPath() {
    const path = new Path2D();
    const points = this.points;
    const p0x = points[0].x;
    const p0y = -points[0].y;
    path.moveTo(p0x, p0y);
    for (let i = 0; i < points.length - 1; i++) {
      const cx = points[i].x;
      const cy = -points[i].y;
      const nx = points[i + 1].x;
      const ny = -points[i + 1].y;
      path.quadraticCurveTo(cx, cy, (cx + nx) / 2, (cy + ny) / 2);
    }
    const last = points[points.length - 1];
    path.quadraticCurveTo(last.x, -last.y, p0x, p0y);
    path.closePath();
    return path;
  }
}
