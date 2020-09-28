


const keys = {};
const display = document.querySelector('.display');

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keys[event.key];
    });

    const {ctx} = createCanvas(800, 600);
    window.ctx = ctx;

    const bicycle1 = new Bicycle({
        x: 0,
        y: 0,
        delta: 0,
        theta: 0,
        waypoints: getWaypointsByBezier(new Bezier(200, 50, 800, 0, 800, 600,100, 500)),
        color: 'red',
        ctx
    });

    const bicycle2 = new Bicycle({
        x: 50,
        y: 650,
        delta: 0,
        theta: 0,
        waypoints: [[300, 100], [500, 300], [750, 500]],
        color: 'blue',
        ctx
    });

    const bicycle3 = new Bicycle({
        x: 800,
        y: 550,
        delta: 0,
        theta: Math.PI,
        waypoints: [[200, 100], [750, 500], [750, 100], [10, 550]],
        color: 'green',
        ctx
    });

    const bicycle4 = new Bicycle({
        x: 200,
        y: 150,
        delta: 0,
        theta: 0,
        waypoints: [[100, 100]],
        color: 'purple',
        ctx
    });



    const canvas = document.querySelector('canvas')
    // canvas.addEventListener('mousedown', function(e) {
        // const [x, y] = getCursorPosition(canvas, e);
        // targets[0] = {x, y, active: true};
    // })

    function update() {
        const passed = Date.now() - prevTime;
        prevTime = Date.now();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        Bicycle.update(passed);
        requestAnimationFrame(update);
    }

    update();
});

const colors = [
    'red', 'green', 'blue', 'grey', 'pink'
]



function drawDebugLines({
    x, y, a, b, a2, b2, headPointerFn,
    rx1, ry1, rx2, ry2,
    rtx, rty,
    targetX, targetY, ctx
}) {
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
let prevTime = Date.now();


function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

