const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');


let targetX = 0;
let targetY = 0;
let targetI = -1;
const targets = [
    {x: 250, y: 80},
    {x: 380, y: 150},
    {x: 530, y: 350},
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

function drawTrajectory({x, y, theta, delta}) {
    const bicycleLength = 100;
    let velocity = 10;

    ctx.beginPath();
    for (let i = 0; i < 100; i++) {
        x += velocity * Math.cos(theta);
        y += velocity * Math.sin(theta);
        theta += (velocity * Math.tan(delta)) / bicycleLength;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(delta);
        ctx.lineTo(0, 0);
        ctx.restore();
    }
    ctx.stroke();
}

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

    ctx.beginPath();
    // ctx.strokeStyle = 'red';
    ctx.moveTo(0, 0);
    ctx.lineTo(1000, 0);
    ctx.stroke();
    ctx.strokeStyle = color;

    ctx.rotate(delta);
    ctx.beginPath();
    ctx.rect(-25, -10, 50, 20)
    ctx.stroke();
    ctx.restore();
    // drawTrajectory({x, y, theta, delta});
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

    update();
});

const colors = [
    'red', 'green', 'blue', 'grey', 'pink'
]

let x = 50;
let y = 50;

let velocity = 0;
let delta = 0;
let theta = 0;
const deltaMax = 0.7;

const bicycleRotationFn = ({x, y, delta, theta}) => {
};

const getFnFromPoints = ([x1, y1], [x2, y2]) => {
    const m  = (y2 - y1) / (x2 - x1);
    return x => m * (x - x1) + y1;
};

function getPointsDistance([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getFnsAngle(fn1, fn2) {
    const x1 = 0;
    const x2 = 1;
    const [a1x, a1y, a2x, a2y] = [x1, fn1(x1), x2, fn1(x2)];
    const [b1x, b1y, b2x, b2y] = [x1, fn2(x1), x2, fn2(x2)];
    const dAx = a2x - a1x;
    const dAy = a2y - a1y;
    const dBx = b2x - b1x;
    const dBy = b2y - b1y;
    const angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    var degree_angle = angle * (180 / Math.PI);
    return angle;
}

function drawDebugLines({x, y, a, b, a2, b2, headPointerFn}) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = 'red';
    ctx.lineTo(x + a, y);
    ctx.lineTo(x + a, y + b);
    ctx.lineTo(x, y);
    ctx.stroke();

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

function calcPositionToTarget({x, y, delta, theta}) {
    const b = Math.sin(theta) * bicycleLength;
    const a = theta === 0 ? 0 : b / Math.tan(theta);
    const x1 = x + a;
    const y1 = y + b;
    const c2 = 100;
    const a2 = c2 * Math.cos(delta + theta);
    const b2 = c2 * Math.sin(delta + theta);

    const headPointerFn = getFnFromPoints([x + a, y + b], [x + a + a2, y + b + b2]);
    const bodyToTargetFn = getFnFromPoints([x + a, y + b], [targetX, targetY]);

    const angleToTarget = getFnsAngle(headPointerFn, bodyToTargetFn);
    const distanceToTarget = getPointsDistance([x + a, y + b], [targetX, targetY]);


    drawDebugLines({x, y, a, b, a2, b2, headPointerFn});
    return {angleToTarget, distanceToTarget};
}

function drawVariants(ms) {
    // ms  = ms*10;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waypoints = [];

    const {angleToTarget, distanceToTarget} = calcPositionToTarget({x, y, delta, theta});
    if (distanceToTarget < 2) {
        setNextTarget();
    }



    let rotationSpeed = 0.00058; // degrees per pixel
    let acceleration = 0.0005; // pixel per pixel

    velocity += acceleration * ms;
    x += velocity * Math.cos(theta);
    y += velocity * Math.sin(theta);
    if (angleToTarget > 0) {
        delta += Math.min(rotationSpeed * 1 *  ms, angleToTarget);
    } else if (angleToTarget < 0) {
        delta -= Math.max(rotationSpeed * ms, angleToTarget);
    }

    delta = Math.min(delta, deltaMax);
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
