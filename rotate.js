const canvas = document.getElementsByTagName('canvas')[0];
const input = document.getElementsByTagName('input')[0];
const ctx = canvas.getContext('2d');

const matrixByVec = ([[x1, x2], [y1, y2]], [x, y]) =>  {
  return [
    x1 * x + y1 * y,
    x2 * x + y2 * y
  ];
}

function degToRad(deg) {
  return deg / 180 * Math.PI;
}

const resizeK = 50;

const normalizeAxis = [
  [1, 0],
  [0, -1]
];
const resizeAxis = [
  [resizeK, 0],
  [0, resizeK]
];

const bezier = new Bezier(0, 0 , 8,0 , 8, 5, 0, 5);
const bezier2 = new Bezier(0, 5, -8, 5 , -8, 0, 0, 0);

const coord = (x, y) => {
    // const rotateMatrix = getRotateMatrix({bezier, t});
    const {x: centerX, y: centerY} = bezier.get(0);
    let x1, y1;
    [x, y] = [x - 0, y - 0];
    [x1, y1] = matrixByVec(normalizeAxis, [x, y]);
    [x1, y1] = matrixByVec(resizeAxis, [x1, y1]);
    // [x1, y1] = rotateCoord(rotateMatrix, [x1, y1], [centerX, centerY]);

    return [(x1 + canvas.width / 2), (y1 + canvas.height / 2)];
}

const interval = 6;
const dotsCount = 15;

const getRotateMatrix = ({bezier, t}) => {
    const {x, y} = bezier.get(parseFloat(t, 10));
    const {x: prevX, y: prevY} = bezier.get(parseFloat(t - 0.01, 10));

    const a = prevY - y;
    const b = prevX - x;
    const tangentA = b / a;
    const angleA = Math.atan(tangentA) *  180 / Math.PI;
    const rad = degToRad(-angleA);
    const rotateMatrix = [
        [Math.cos(rad), Math.sin(rad)],
        [-Math.sin(rad), Math.cos(rad)]
    ];

    return rotateMatrix;
};

const rotateCoord = (rotateMatrix, [x1, y1], [x, y]) => {
  const [newX, newY] = matrixByVec(rotateMatrix, [x1 - x, y1 - y]);
  return [newX + x, newY + y];
};

function draw(t, outline) {
    // drawBycicle();
}

const drawAxises = () => {
    ctx.save();
    ctx.beginPath();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(x * Math.PI / 180);
    ctx.translate(-100, -100);
    ctx.fillRect(0, 0, 200, 200);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(100, 100);
    ctx.lineTo(1000, 100);
    ctx.stroke();
    ctx.translate(100, 100);
    ctx.rotate(2*x * Math.PI / 180);
    // ctx.restore();
    // ctx.save();
    ctx.translate(240, 240);
    ctx.rotate(5* x * Math.PI / 180);
    ctx.translate(-50, -50);
    ctx.fillRect(0, 0, 100, 100);
    ctx.stroke();
    // ctx.translate(-200, -200);
    // ctx.rotate(Math.PI / 180);
    ctx.restore();
    // ctx.translate(-45 * Math.PI / 180);

  // ctx.moveTo(...coord(-25, 0, {t, bezier}));
  // ctx.lineTo(...coord(25, 0, {t, bezier}));
  // ctx.stroke();
  // ctx.beginPath();
  // ctx.moveTo(...coord(0, -25, {t, bezier}));
  // ctx.lineTo(...coord(0, 25, {t, bezier}));
  // ctx.stroke();

  // for (let i = -25; i < 25; i++) {
    // ctx.beginPath();
    // ctx.arc(...coord(i, 0, {t, bezier}), 1, 0, Math.PI * 2, false);
    // ctx.stroke();
    // ctx.beginPath();
    // ctx.arc(...coord(0, i, {t, bezier}), 1, 0, Math.PI * 2, false);
    // ctx.stroke();
    // ctx.fillText(i.toString(), ...coord(0, i, {t, bezier}));
    // ctx.fillText(i.toString(), ...coord(i, 0, {t, bezier}));
  // }

};

let velocity = 0;
let delta = 0;
let theta = 0;

const keys = {};
const display = document.querySelector('.display');

function updateDisplay() {
    const r = x => Math.round(x * 100) / 100;
    display.innerHTML = [
        `velocity = ${r(velocity)}`,
        `delta = ${r(delta)}`,
        `theta = ${(theta)}`,
        `theta (deg) = ${(180/Math.PI) * (theta)}`,
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
        velocity += 0.01;
    } else if (keys.ArrowDown) {
        velocity -= 0.02;
    } else {
        // velocity *= 0.95;
        velocity += 0.001;
    }

    if (velocity < 0) velocity = 0;

    if (keys.ArrowRight) {
        delta -= 0.01;
    } else if (keys.ArrowLeft) {
        delta += 0.01;
    }

    delta = Math.max(-0.9, Math.min(0.9, delta));
    velocity = Math.max(0, Math.min(10, velocity));


    x += velocity * Math.cos(theta);
    y += velocity * Math.sin(theta);
    theta += (velocity * Math.tan(delta)) / (bicycleLength * resizeK);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxises();
    updateDisplay();
    requestAnimationFrame(update);
}

let x = 0;
let y = 1;
const bicycleLength = 3;
const wheelRadius = 0.5;
const wheelWidth = 0.2;

function rect(x, y, width, height, angle) {
    const rad = degToRad(angle);
    const rotateMatrix = [
        [Math.cos(rad), Math.sin(rad)],
        [-Math.sin(rad), Math.cos(rad)]
    ];
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const c = (x, y) => {
        return rotateCoord(rotateMatrix, [x, y], [centerX, centerY]);
    };
    ctx.beginPath();
    ctx.moveTo(...c(x, y));
    ctx.lineTo(...c(x + width, y));
    ctx.lineTo(...c(x + width, y + height));
    ctx.lineTo(...c(x, y + height));
    ctx.lineTo(...c(x, y));
    ctx.stroke();
}

const size = (x, y) => ([x * resizeK, y * resizeK]);

function drawBycicle() {
    const t = 0;
    ctx.moveTo(...size(-bicycleLength / 2, 0));
    ctx.lineTo(...size(bicycleLength / 2, 0));
    ctx.translate(...coord(-x, -y));
    // ctx.rotate(-theta);
    ctx.stroke();
}

