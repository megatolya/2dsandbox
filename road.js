const {ctx, canvas} = createCanvas(800, 1000);

window.ctx = ctx;
window.canvas = canvas;


const road = Waypoint.createRoad([300, 30], [350, 500]);
road.next[0].next[0].createRoadTo([400, 20]);

function drawRoadLine(road, from) {
    circle(...road.xy());
    if (from) {
        line(from.xy(), road.xy());
    }

    if (road.next.length) {
        road.next.forEach(w => {
            drawRoadLine(w, road);
        });
    }
}

new Bicycle({
    x: 200,
    y: -100,
    delta: 0,
    theta: 1,
    waypoints: road.getPrimitiveWay().map(w => w.xy()),
    color: 'red',
    ctx
});

let prevTime = Date.now();

function update() {
    const passed = Date.now() - prevTime;
    prevTime = Date.now();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawRoadLine(road);
    Bicycle.update(passed);
    requestAnimationFrame(update);
}

update();
