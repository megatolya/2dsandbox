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

const bezier = new Bezier(0, 0 , 8,0 , 8, 5, 0, 5);
const bezier2 = new Bezier(0, 5, -8, 5 , -8, 0, 0, 0);

const coord = (x, y, {t, bezier}) => {
    const rotateMatrix = getRotateMatrix({bezier, t});
    const {x: centerX, y: centerY} = bezier.get(t);
    let x1, y1;
    [x, y] = [x - centerX, y - centerY];
    [x1, y1] = matrixByVec(normalizeAxis, [x, y]);
    [x1, y1] = matrixByVec(resizeAxis, [x1, y1]);
    [x1, y1] = rotateCoord(rotateMatrix, [x1, y1], [centerX, centerY]);

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

const drawCar = ({t, bezier}) => {
};
const drawArrow = ({t, bezier, mainBezier}) => {
    if (!mainBezier) mainBezier = bezier;
    // const x = t * 2 * interval - interval;
    const {x, y} = bezier.get(parseFloat(t, 10));

    const rotateMatrix = getRotateMatrix({t, bezier: mainBezier});
    ctx.beginPath();
    const step = 0.25;
    ctx.moveTo(...coord(...rotateCoord(rotateMatrix, [x - step, y - step], [x, y]), {t, bezier: mainBezier}));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x, y + step * 2], [x, y]), {t, bezier: mainBezier}));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x + step, y - step], [x, y]), {t, bezier: mainBezier}));
    ctx.lineTo(...coord(...rotateCoord(rotateMatrix, [x - step, y - step], [x, y]), {t, bezier: mainBezier}));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(...coord(x, y, {t, bezier: mainBezier}), 3, 0, Math.PI * 2, false);
    ctx.stroke();
}

function drawRoad({outline, t, bezier, mainBezier}) {
    bezier.outline(outline).curves.forEach(b => {
        drawFn({t, bezier: b, outline, mainBezier: mainBezier || bezier, line: true});
    });
}

function draw(t, outline) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawAxises({t, bezier});
  
    drawFn({t, bezier});
    drawFn({t, bezier: bezier2, mainBezier: bezier});
    drawRoad({outline, t, bezier});
    drawRoad({outline, t, bezier: bezier2, mainBezier: bezier});
    drawArrow({t, bezier});
    drawArrow({t, bezier: bezier2, mainBezier: bezier});
   
}

const drawAxises = ({t, bezier}) => {
  ctx.beginPath();
  ctx.moveTo(...coord(-25, 0, {t, bezier}));
  ctx.lineTo(...coord(25, 0, {t, bezier}));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(...coord(0, -25, {t, bezier}));
  ctx.lineTo(...coord(0, 25, {t, bezier}));
  ctx.stroke();

  for (let i = -25; i < 25; i++) {
    ctx.beginPath();
    ctx.arc(...coord(i, 0, {t, bezier}), 1, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(...coord(0, i, {t, bezier}), 1, 0, Math.PI * 2, false);
    ctx.stroke();
    ctx.fillText(i.toString(), ...coord(0, i, {t, bezier}));
    ctx.fillText(i.toString(), ...coord(i, 0, {t, bezier}));
  }

};

const drawFn = ({bezier, t: arrowT, mainBezier, line = false, dotsNumber = 30}) => {
    if (line) {
        ctx.beginPath();
        let {x, y} = bezier.get(0);
        ctx.moveTo(...coord(x, y, {t: arrowT, bezier:  mainBezier || bezier}));
        for (let t = 0; t <= 1; t += (1 / dotsNumber)) {
            const xy = bezier.get(t);
            ctx.lineTo(...coord(xy.x, xy.y, {t: arrowT, bezier:  mainBezier || bezier}));
        }
        ctx.stroke();
    } else {
        for (let t = 0; t <= 1; t += 1 / dotsNumber) {
            const {x, y} = bezier.get(t);
            ctx.beginPath();
            ctx.arc(...coord(x, y, {t: arrowT, bezier: mainBezier || bezier}), 1, 0, Math.PI * 2, false);
            ctx.stroke();
        }
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

draw(t, outline);

outlineInput.addEventListener('input', redraw);
tInput.addEventListener('input', redraw);
