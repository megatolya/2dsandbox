const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');


const targetX = 700;
const targetY = 500;

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
    ctx.fillRect(targetX - 5, targetY - 5, 10, 10);
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

const blueVariant = {
    acceleration: 30.5,
    color: "blue",
    delta: 0,
    rotationSpeed: 0.12,
    theta: 0,
    velocity: 0,
    x: 50,
    y: 50,
};

const createAnimation = ({
    acceleration,
    color,
    delta,
    rotationSpeed,
    theta,
    velocity,
    x,
    y,
}) => {
    let prevTime = Date.now();

    return () => {
        let timePassed = Date.now() -  prevTime;
        prevTime = Date.now();

        x += velocity * Math.cos(theta);
        y += velocity * Math.sin(theta);
        delta += timePassed * rotationSpeed/ 150;
        velocity += timePassed * acceleration / 1300;
        theta += (velocity * Math.tan(delta)) / bicycleLength;

        drawBicycle({x, y, delta, theta, velocity, color:'purple'});
    };
};

const nextFrame = createAnimation(blueVariant);

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

function getIsPointsToTarget({x, y, delta, theta}) {
    const b = Math.sin(theta) * bicycleLength;
    const a = b / Math.tan(theta);


    const x1 = x + a;
    const y1 = y + b;

    const c2 = 100;
    const a2 = c2 * Math.cos(delta + theta);
    const b2 = c2 * Math.sin(delta + theta);


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

    const fn2 = getFnFromPoints([x + a, y + b], [x + a + a2, y + b + b2]);

    ctx.beginPath();
    ctx.strokeStyle = 'purple';
    ctx.moveTo(x + a, y + b);
    ctx.lineTo(targetX, fn2(targetX));
    ctx.stroke();
    return Math.abs(fn2(targetX) - targetY) < 2;


}

function drawVariants(ms) {
    ms  = ms/2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const waypoints = [];

    const isPointsToTarget = getIsPointsToTarget({x, y, delta, theta});


    let rotationSpeed = 0.00028; // degrees per pixel
    let acceleration = 0.0005; // pixel per pixel

    velocity += acceleration * ms;
    x += velocity * Math.cos(theta);
    y += velocity * Math.sin(theta);
    if (isPointsToTarget) {
        console.log('-');
        delta -= rotationSpeed * 25 *  ms;
    } else {
        console.log('+');
        delta += rotationSpeed * ms;
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
