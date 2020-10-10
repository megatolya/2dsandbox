const {ctx, canvas} = createCanvas(800, 1000);

window.ctx = ctx;
window.canvas = canvas;


const roadPoints = [[300, 200], [350, 800]];


const {start, end} = Waypoint.createRoute(...roadPoints, 6);


const start2 = start.next[0].next[0];
const end2 = start2.createRouteTo([500, 900]);

new Road(start.findWay(end), ctx);
new Road(start2.findWay(end2), ctx);

function drawRoadLine(waypoint, from) {
    circle(...waypoint.xy());
    ctext(ctx, ...waypoint.xy(5), waypoint.id);
    if (from) {
        line(from.xy(), waypoint.xy());
    }

    if (waypoint.next.length) {
        waypoint.next.forEach(w => {
            drawRoadLine(w, waypoint);
        });
    }
}

function createRed() {
    const waypoints = start.findWay(end2);
    const red = new Bicycle({
        x: 200,
        y: 10,
        delta: 0,
        theta: 1,
        waypoints: waypoints.map(w => w.xy()),
        color: 'red',
        ctx
    });

    red.on('targetchange', ({data: [x, y]}) => {
        const targetI = 3;
        if (waypoints[targetI].x === x && waypoints[targetI].y === y) {
            createRed();
        }
    });
}

function createBlue() {
    const waypoints = start.findWay(end);
    const blue = new Bicycle({
        x: 450,
        y: 0,
        delta: 0,
        theta: 2,
        waypoints: waypoints.map(w => w.xy()),
        color: 'blue',
        ctx
    });

    blue.on('targetchange', ({data: [x, y]}) => {
        const targetI = 3;
        if (waypoints[targetI].x === x && waypoints[targetI].y === y) {
            createBlue();
        }
    });
}

createRed();
createBlue();


let prevTime = Date.now();

function update() {
    const passed = Date.now() - prevTime;
    prevTime = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // drawRoadLine(start);
    Bicycle.update(passed);
    Road.update(passed);
    requestAnimationFrame(update);
}

update();
