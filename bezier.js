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

const bezier = new Bezier(0,0 , 6,2 , 3, 3);
const fn = x => bezier.get(x);
const fn2 = x => Math.cos(x);

const step = 0.3;
const interval = 6;
const dotsCount = 15;

const rotateCoord = (rotateMatrix, [x1, y1], [x, y]) => {
  const [newX, newY] = matrixByVec(rotateMatrix, [x1 - x, y1 - y]);
  return [newX + x, newY + y];
};

const drawArrow = (t, bezier) => {
    // const x = t * 2 * interval - interval;
    const {x, y} = bezier.get(parseFloat(t, 10));
    console.log(x, y);

    const {x: prevX, y: prevY} = bezier.get(parseFloat(t - 0.01, 10));

    const a = prevY - y;
    const b = prevX - x;

    const tangentA = b / a;
    const angleA = Math.atan(tangentA) *  180 / Math.PI;
    const angleBRad = degToRad(180  - angleA);
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
    ctx.arc(...coord(x, y), 3, 0, Math.PI * 2, false);
    ctx.stroke();

    // console.log(...coord(x, y));
    // ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x + step, y + step], [x, y])));
    // ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x - step, y + step], [x, y])));
    // ctx.stroke();
    // ctx.beginPath();
}

function drawRoad(outline, t, bezier) {
    bezier.outline(outline).curves.forEach(bezier => {
        drawFn(bezier);
    });
}

function draw(t, outline) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxises();
  
    drawFn(bezier);
    drawRoad(outline, t, bezier);
    drawArrow(t, bezier);
   
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

const drawFn = (bezier) => {
  for (let t = 0; t <= 1; t += 0.05) {
    const {x, y} = bezier.get(t);
    ctx.beginPath();
    ctx.arc(...coord(x, y), 1, 0, Math.PI * 2, false);
    ctx.stroke();
  }
};

const redraw = () => {
    outline = outlineInput.value;
    t = tInput.value;
    draw(t, outline);
};


const outlineInput = document.querySelector('.input-outline');
const tInput = document.querySelector('.input-t');
let outline = outlineInput.value;
let t = tInput.value;

outlineInput.addEventListener('input', redraw);
tInput.addEventListener('input', redraw);
