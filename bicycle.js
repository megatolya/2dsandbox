const canvas = document.getElementsByTagName('canvas')[0];
const ctx = canvas.getContext('2d');

let x = 50;
let y = 50;

let velocity = 0;
let delta = 0;
let theta = 0;
const bicycleLength = 300;

const targetX = 400;
const targetY = 300;

function drawTrajectory({x, y, theta}) {
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

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(theta);
    ctx.beginPath();
    ctx.rect(0, -10, bicycleLength, 20)
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(0, -20, 100, 40)
    ctx.stroke();
    ctx.translate(bicycleLength, 0);
    ctx.rotate(delta);
    ctx.beginPath();
    ctx.rect(-50, -20, 100, 40)
    ctx.stroke();
    ctx.restore();
    drawTrajectory({x, y, theta});
    drawTarget();
}

const keys = {};
const display = document.querySelector('.display');

function updateDisplay() {
    const r = x => Math.round(x * 100) / 100;
    display.innerHTML = [
        `velocity = ${r(velocity)}`,
        `delta = ${r(delta)}`,
        `delta (deg) = ${r(180 / Math.PI * delta)}`,
        `theta = ${(theta)}`,
        `x = ${r(x)}`,
        `y = ${r(y)}`,
    ].join('<br/>');
}

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keys[event.key];
    });

    update();
});

function update() {
    if (keys.ArrowUp) {
        velocity += 0.1;
    } else if (keys.ArrowDown) {
        velocity -= 0.1;
    } else {
        // velocity -= 0.05;
    }

    if (velocity < -10) velocity = -10;

    if (keys.ArrowRight) {
        delta += 0.005;
    } else if (keys.ArrowLeft) {
        delta -= 0.005;
    }

    delta = Math.max(-0.95, Math.min(0.95, delta));
    velocity = Math.max(-10, Math.min(10, velocity));

    if (Math.abs(velocity) < 0.03) {
        velocity = 0;
    }


    x += velocity * Math.cos(theta);
    y += velocity * Math.sin(theta);
    theta += (velocity * Math.tan(delta)) / bicycleLength;

    draw();
    updateDisplay();
    requestAnimationFrame(update);
}
