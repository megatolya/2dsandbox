
const {ctx, canvas} = createCanvas(1000, 800);

window.ctx = ctx;
window.canvas = canvas;

const flatten = window['@flatten-js/core'];

const {
    point,
    segment,
    vector,
    matrix,
    Polygon
} = flatten;


const roadColor = '#777c81';
const road1 = segment(point(400, -1000), point(430, 1810));
const road2 = segment(point(-150, 100), point(1700, 570));
const road3 = segment(point(-350, 800), point(1700, 1000));

const roadWidth = 280;

const strokeSeg = (seg, color = 'black') => {
    ctx.beginPath();
    ctx.moveTo(seg.ps.x, seg.ps.y);
    ctx.lineTo(seg.pe.x, seg.pe.y);
    ctx.strokeStyle = color;
    ctx.stroke();
    return seg;
};

class Road {
    constructor({
        startEdge,
        endEdge,
        leftSide,
        rightSide,
        segment
    }) {
        this.segment = segment;

        const roadPoly = new Polygon();
        roadPoly.addFace([
            startEdge, endEdge, leftSide, rightSide
        ]);
        this.polygon = roadPoly;
    }
}

const strokePoly = (poly, fillStyle = 'red') => {
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    const edges = Array.from(poly.edges.values()).map(edge => edge.shape);
    ctx.beginPath();
    ctx.moveTo(edges[0].ps.x, edges[0].ps.y);
    edges.forEach(({ps, pe}) => {
        ctx.lineTo(ps.x, ps.y);
        ctx.lineTo(pe.x, pe.y);
    });
    ctx.closePath();
    ctx.fill();
};

function drawRoadLine(seg) {
    ctx.beginPath();
    ctx.strokeStyle = 'white';
    ctx.moveTo(seg.ps.x, seg.ps.y);
    ctx.lineTo(seg.pe.x, seg.pe.y);
    ctx.setLineDash([55, 35]);
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.strokeWidth = 1;
}

const roads = [road1, road2, road3].map(roadSeg => {
    vec = roadSeg.tangentInStart();
    const angle = vec.slope;

    const {ps, pe} = roadSeg;
    const [x1, y1] = [ps.x, ps.y];
    const [x2, y2] = [pe.x, pe.y];

    const roadLength = roadSeg.length;
    const roadEdge = segment(point(0, roadWidth / 2), point(0, -roadWidth / 2));
    const roadSide = segment(point(0, 0), point(roadLength, 0));

    const roadEdgeTransformed = roadEdge.transform(matrix()
        .translate(x1, y1)
        .rotate(angle))

    const startEdge = roadEdgeTransformed;

    const endEdge = roadEdge.transform(matrix()
        .translate(x2, y2)
        .rotate(angle));

    const leftSide = roadSide.transform(matrix()
        .translate(roadEdgeTransformed.ps.x, roadEdgeTransformed.ps.y)
        .rotate(angle));

    const rightSide = roadSide.transform(matrix()
        .translate(roadEdgeTransformed.pe.x, roadEdgeTransformed.pe.y)
        .rotate(angle));
    return new Road({
        startEdge,
        endEdge,
        leftSide,
        rightSide,
        segment: roadSeg
    });
});

const [r1, r2, r3] = roads;

function drawRoads() {
    roads.forEach(road =>{
        const edges = Array.from(road.polygon.edges.values()).map(edge => edge.shape);
        edges.forEach(({ps, pe}) => {
            ctx.strokeStyle = '#e6e6e6';
            ctx.lineWidth = 20;
            ctx.beginPath();
            ctx.lineTo(ps.x, ps.y);
            ctx.lineTo(pe.x, pe.y);
            ctx.stroke();
        });
    });
    roads.forEach(road =>{
        strokePoly(road.polygon, roadColor);
    });

    roads.forEach(road =>{
        drawRoadLine(road.segment);
    });


    [[r1, r2], [r1, r3]].forEach(([r1, r2]) => {
        const segs = [];
        r1.polygon.intersect(r2.polygon).forEach(({x, y}, i) => {
            segs.push(point(x, y));
            // circle(x, y, 'red');
        });

        const p = new Polygon();
        [segs[3], segs[2]] = [segs[2], segs[3]];
        p.addFace(segs);
        strokePoly(p, roadColor);
    });

}


let prevTime = Date.now();

function createRed() {
    const red = new Car({
        x: 330,
        y: 30,
        delta: 0,
        theta: road1.slope,
        waypoints: [[335, 450], [335, 820],  [1000, 1020]],
        color: 'red',
        ctx,
        velocity: 0
    });
    red.on('disappear', createRed);
}

createRed();

const keys = {};

const blue = new ControlledCar({
    x: 130,
    y: 30,
    delta: 0,
    theta: road1.slope,
    waypoints: [[335, 450], [700, 670]],
    color: 'blue',
    ctx,
    controlled: true,
    velocity: 0,
    keys
});

function update() {
    const passed = Date.now() - prevTime;
    prevTime = Date.now();

    ctx.fillStyle = '#b3b3b3';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.save();
    ctx.scale(0.7, 0.7);
    ctx.translate(-blue.x + ctx.canvas.width / 2, -blue.y + ctx.canvas.height / 2 - carLength / 2);
    // ctx.rotate(-blue.delta + Math.PI);
    drawRoads();
    Car.update(passed);
    requestAnimationFrame(update);
    ctx.restore();
}

update();

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keys[event.key];
    });
});
