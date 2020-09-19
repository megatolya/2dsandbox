const canvas = document.getElementsByTagName('canvas')[0];
const canvas2 = document.getElementsByTagName('canvas')[1];
const ctx = canvas.getContext('2d');
const ctx2 = canvas2.getContext('2d');


let x = 150;
let y = 150;




let rotationSpeed = 0.00200; // degree per ms
let acceleration = 0.0009; // pixel per ms
let velocity = 0;
let delta = 0;
let theta = 0;
const deltaMax = 0.755; // 41 degree
const maxVelocity = 1;

let targetX = 0;
let targetY = 0;
let targetI = -1;

const targets = [
    {x: 150, y:160},
];

function setNextTarget() {
    targetI++;
    if (targetI === targets.length) targetI = 0;
    targets.forEach(target => target.active = false);
    targets[targetI].active = true;
    targetX = targets[targetI].x;
    targetY = targets[targetI].y;
}

setNextTarget();

const bicycleLength = 120;

function drawTarget() {
    targets.forEach(({x, y, active}) => {
        ctx.fillStyle = active ? 'black' : 'grey';
        ctx.fillRect(x - 5, y - 5, 10, 10);
    });
}

function drawBicycle({x, y, delta, theta, velocity, color}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.font = "12px Arial";
    const r = x => Math.round(x * 100) / 100;
    const text = [
        // `velocity = ${r(velocity)}`,
        `delta = ${r(180 / Math.PI * delta)}`,
        `theta = ${r(180 / Math.PI * theta)}`,
        `x = ${r(x)}`,
        `y = ${r(y)}`,
    ].join('; ');
    ctx.fillText(text, 40, -30);
    ctx.rotate(theta);
    ctx.beginPath();
    // ctx.fillStyle = 'red';
    ctx.strokeStyle = color;
    ctx.rect(0, -5, bicycleLength, 10)
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-5, -10, 45, 20)
    ctx.stroke();
    ctx.translate(bicycleLength, 0);

    // ctx.beginPath();
    // // ctx.strokeStyle = 'red';
    // ctx.moveTo(0, 0);
    // ctx.lineTo(1000, 0);
    // ctx.stroke();
    // ctx.strokeStyle = color;

    ctx.rotate(delta);
    ctx.beginPath();
    ctx.rect(-25, -10, 50, 20)
    ctx.stroke();
    ctx.restore();
    drawTarget();
}

const keys = {};
const display = document.querySelector('.display');

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keys[event.key];
    });

    const canvas = document.querySelector('canvas')
    canvas.addEventListener('mousedown', function(e) {
        const [x, y] = getCursorPosition(canvas, e);
        targets[0] = {x, y, active: true};
        setNextTarget();
    })

    update();
});

const colors = [
    'red', 'green', 'blue', 'grey', 'pink'
]

const bicycleRotationFn = ({x, y, delta, theta}) => {
};

const getFnFromPoints = ([x1, y1], [x2, y2]) => {
    const m  = (y2 - y1) / (x2 - x1);
    return x => m * (x - x1) + y1;
};

function getPointsDistance([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
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

function drawDebugLines({
    x, y, a, b, a2, b2, headPointerFn,
    rx1, ry1, rx2, ry2,
    rtx, rty
}) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = 'red';
    ctx.lineTo(x + a, y);
    ctx.lineTo(x + a, y + b);
    ctx.lineTo(x, y);
    ctx.stroke();
    // polyline(
        // [x + a, y],
        // [x + a, y + b],
        // [x, y]
    // );


    ctx.beginPath();
    ctx.moveTo(x + a, y + b);
    ctx.strokeStyle = 'blue';
    ctx.lineTo(x + a + a2, y + b);
    ctx.lineTo(x + a + a2, y + b + b2);
    ctx.lineTo(x + a, y + b);
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    ctx.moveTo(x + a, y + b);
    ctx.lineTo(targetX, headPointerFn(targetX));
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = 'yellow';
    ctx.moveTo(x + a, y + b);
    ctx.lineTo(targetX, targetY);
    ctx.stroke();

}

const matrixByVec = ([[x1, x2], [y1, y2]], [x, y]) =>  {
  return [
    x1 * x + y1 * y,
    x2 * x + y2 * y
  ];
}

function getRotationMatrix(angle) {
    return [
        [Math.cos(angle), Math.sin(angle)],
        [-Math.sin(angle), Math.cos(angle)]
    ];
}

function fline(fn, color) {
    line([0, fn(0)], [canvas.width, fn(canvas.width)], color);
}

function line([x1, y1], [x2, y2], color = 'grey') {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function line2([x1, y1], [x2, y2], color = 'grey') {
    ctx2.beginPath();
    ctx2.moveTo(x1, y1);
    ctx2.strokeStyle = color;
    ctx2.lineTo(x2, y2);
    ctx2.stroke();
}

function circle(x, y, color = 'grey') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(x, y, 2, 0, Math.PI * 2,  false);
    ctx.stroke();
}

function circle2(x, y, color = 'grey') {
    ctx2.beginPath();
    ctx2.strokeStyle = color;
    ctx2.arc(x, y, 2, 0, Math.PI * 2,  false);
    ctx2.stroke();
}

function degrees(radians) {
    return 180 / Math.PI * radians;
}

function calcPositionToTarget({x, y, delta, theta}) {
    const b = Math.sin(theta) * bicycleLength;
    const a = theta === 0 ? 0 : b / Math.tan(theta);
    const x1 = x + a;
    const y1 = y + b;
    const c2 = 100;
    const a2 = c2 * Math.cos(delta + theta);
    const b2 = c2 * Math.sin(delta + theta);

    const bodyFn = getFnFromPoints([x, y], [x + a, y + b]);
    const headPointerFn = getFnFromPoints([x + a, y + b], [x + a + a2, y + b + b2]);
    const headToTargetFn = getFnFromPoints([x + a, y + b], [targetX, targetY]);
    const xAxisFn = getFnFromPoints([-1, 0], [0, 0]);

    const bodyAngleToTarget = getFnsAngle(bodyFn, xAxisFn, false);
    const matrix = new Matrix();
    if (x < x + a) {
        matrix.rotate(bodyAngleToTarget);
    } else {
        matrix.rotate(bodyAngleToTarget + Math.PI);
    }
    const [cx, cy] = [(x + x + a) / 2, (y + y + b) / 2];
    const rotate = (x, y) => {
        x -= cx;
        y -= cy;
        const xy = matrix.applyToPoint(x, y);
        x = xy.x;
        y = xy.y;
        return [x + cx, y + cy];
    };
    const [rx1, ry1] = rotate(x, y);
    const [rx2, ry2] = rotate(x + a, y + b);
    const [rtx, rty] = rotate(targetX, targetY);


    let fullCircle = false;

    let angleToTarget = getFnsAngle(headPointerFn, headToTargetFn, false);

    if (rtx < rx2 && rty > ry2) {
        angleToTarget = deltaMax;
    }

    if (rtx < rx2 && rty < ry2) {
        angleToTarget = -1;
    }
    // if (rtx < rx2) {
        // console.log('yes');
        // angleToTarget = Math.PI - angleToTarget;
    // } else {
        // console.log('no');
    // }
    // console.log(degrees(angleToTarget));

    // calc if point is "behind" begin of the head
    // TODO

    const distanceToTarget = getPointsDistance([x + a, y + b], [targetX, targetY]);
    const tMatrix = new Matrix();
    tMatrix.translate(canvas.width / 2 - cx, canvas.height / 2 - cy);
    ctx2.save();
    ctx2.clearRect(0, 0, canvas.width, canvas.height);
    tMatrix.applyToContext(ctx2);
    line2([rx1, ry1], [rx2, ry2], 'orange');
    circle2(rtx, rty, 'red');
    circle2(rx2, ry2, 'orange');
    line2([rx2, -1000], [rx2, canvas.height]);
    ctx2.restore();

    drawDebugLines({
        x, y, a, b, a2, b2, headPointerFn,
        rx1, ry1, rx2, ry2,
        rtx, rty
    });
    return {angleToTarget, distanceToTarget};
}

function drawVariants(ms) {
    ms  = ms;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waypoints = [];

    let {angleToTarget, distanceToTarget} = calcPositionToTarget({x, y, delta, theta});
    if (distanceToTarget < 2) {
        setNextTarget();
    }

    velocity += acceleration * ms;
    velocity = Math.min(velocity, maxVelocity);

    x += velocity * Math.cos(theta);
    y += velocity * Math.sin(theta);
    if (angleToTarget > 0) {
        delta += Math.min(rotationSpeed * ms, angleToTarget);
    } else if (angleToTarget < 0) {
        delta -= Math.max(rotationSpeed * ms, angleToTarget);
    }

    delta = Math.min(delta, deltaMax);
    delta = Math.max(delta, -deltaMax);
    theta += (velocity * Math.tan(delta)) / bicycleLength;

    drawBicycle({x, y, delta, theta, color: colors[1]});
    waypoints.push({x, y, delta, theta});
    // return waypoints;
}

let prevTime = Date.now();
function update() {
    const passed = Date.now() - prevTime;
    prevTime = Date.now();
    drawVariants(passed);
    requestAnimationFrame(update);
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

