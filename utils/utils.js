
const getFnFromPoints = ([x1, y1], [x2, y2]) => {
    const m  = (y2 - y1) / (x2 - x1);
    return x => m * (x - x1) + y1;
};

const getWaypointsByBezier = (bezier) => {
    const step = 0.2;
    const res = [];
    for (let t = 0; t < 1; t += step) {
        const xy = bezier.get(t);
        res.push([xy.x, xy.y]);
    }

    return res;
};

function getPointsDistance([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getDirection([x1, y1], [x2, y2], [x3, y3]) {
    const headFn = getFnFromPoints([x1, y1], [x2, y2]);
    if (y3 > headFn(x3)) {
        return -1;
    } else {
        return 1;
    }
}

function getTurnAngle(p1, p2, p3) {
    const p0 = [p1[0] - 99999, p1[1]];
    const direction = getDirection(p1, p2, p3);
    const angle = getPointsAngle(p1, p2, p3);
    const isIntersects = isLinesIntersects(...p2, ...p3, ...p1, ...p0);
    const res =  -direction * (isIntersects ? Math.PI * 2 - angle : angle);
    return res;
}

function isLinesCollides(line1, line2) {
    const [l1, l2] = line1;
    const [l3, l4] = line2;
    return isLinesIntersects(...l1, ...l2, ...l3, ...l4);
}


function isLinesIntersects(a,b,c,d,p,q,r,s) {
  var det, gamma, lambda;
  det = (c - a) * (s - q) - (r - p) * (d - b);
  if (det === 0) {
    return false;
  } else {
    lambda = ((s - q) * (r - a) + (p - r) * (s - b)) / det;
    gamma = ((b - d) * (r - a) + (c - a) * (s - b)) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
  }
};

function getPointsAngle(p1, p2, p3) {
    const p12 = getPointsDistance(p1, p2);
    const p13 = getPointsDistance(p1, p3);
    const p23 = getPointsDistance(p2, p3);
    return Math.acos((p12 ** 2 + p13 ** 2 - p23 ** 2) / (2 * p12 * p13));
}

function getFnsAngle(fn1, fn2, fullCircle = false) {
    const x1 = 0;
    const x2 = 1;
    const [a1x, a1y, a2x, a2y] = [x1, fn1(x1), x2, fn1(x2)];
    const [b1x, b1y, b2x, b2y] = [x1, fn2(x1), x2, fn2(x2)];
    const dAx = a2x - a1x;
    const dAy = a2y - a1y;
    const dBx = b2x - b1x;
    const dBy = b2y - b1y;
    let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    if(fullCircle && angle < 0) {angle = angle * -1;}
    return angle;
}
function cline(ctx, [x1, y1], [x2, y2], color = 'gray') {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
function line(...args) {
    cline(ctx, ...args);
}

function crect(ctx, x, y, width, height, color = 'gray') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.rect(x, y, width, height)
    ctx.stroke();
}

function ctext(ctx, x, y, text) {
    ctx.fillText(text, x, y);
}

function ccircle(ctx, x, y, color = 'gray') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(x, y, 3, 0, Math.PI * 2,  false);
    ctx.stroke();
}

function circle(...args) {
    ccircle(ctx, ...args);
}

function degrees(radians) {
    return 180 / Math.PI * radians;
}


function createCanvas(width, height, name) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    canvas.style.border = '1px solid black';

    return {ctx, canvas};
}
