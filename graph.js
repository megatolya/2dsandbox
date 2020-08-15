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

const normalizeAxis = [
  [1, 0],
  [0, -1]
];
const resizeAxis = [
  [50, 0],
  [0, 50]
];

const coord = (x, y) => {
    const [x1, y1] = matrixByVec(resizeAxis, matrixByVec(normalizeAxis, [x, y]));
    return [x1 + canvas.width / 2, y1 + canvas.height / 2];
}

const fn = x => Math.sin(x);
const fn2 = x => Math.cos(x);

const step = 0.3;
const interval = 6;
const dotsCount = 15;

const rotateCoord = (rotateMatrix, [x1, y1], [x, y]) => {
  const [newX, newY] = matrixByVec(rotateMatrix, [x1 - x, y1 - y]);
  return [newX + x, newY + y];
};

const drawArrow = (val, fn) => {
    const x = val * 2 * interval - interval;
    const y = fn(x);

    const prevX = x - step;
    const a = fn(prevX) - y;
    const b = x - prevX;
    const tangentA = a / b;
    const angleA = Math.atan(tangentA) *  180 / Math.PI;
    const angleBRad = degToRad(90  - angleA);
    const rotateMatrix = [
        [Math.cos(angleBRad), Math.sin(angleBRad)],
        [-Math.sin(angleBRad), Math.cos(angleBRad)]
    ];
  ctx.beginPath();
   ctx.moveTo(...coord(...rotateCoord(rotateMatrix, [x - step, y + step], [x, y])));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x, y - step * 2], [x, y])));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x + step, y + step], [x, y])));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x - step, y + step], [x, y])));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(...coord(x, y), 1, 0, Math.PI * 2, false);
    ctx.stroke();
}

function drawRoad(fn) {
  
}

function draw(val) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxises();
  
    drawFn(fn);
    drawRoad(fn);
    drawArrow(val, fn);
   
}

const drawAxises = () => {
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, canvas.height);
  ctx.lineTo(canvas.width / 2, 0);
  ctx.stroke();
  
  for (let i = -10; i < 10; i++) {
    ctx.beginPath();
    ctx.arc(...coord(i, 0), 1, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(...coord(0, i), 1, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fillText(i.toString(), ...coord(0, i));
    ctx.fillText(i.toString(), ...coord(i, 0));
  }

};

const drawFn = (fn) => {
  for (let x = -interval; x <= interval; x = x + (interval / dotsCount)) {
    const y = fn(x);
    ctx.beginPath();
    ctx.arc(...coord(x, y), 1, 0, Math.PI * 2, false);
    ctx.stroke();
  }
};

input.addEventListener('input', function (event) {
  draw(event.target.value);
});
draw(input.value);

