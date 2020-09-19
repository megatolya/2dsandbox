const canvas = document.getElementsByTagName('canvas')[0];
const canvas2 = document.getElementsByTagName('canvas')[1];
const ctx = canvas.getContext('2d');

const safeDistance = 40;

class Circle {
    constructor(bezier, speed, enemy) {
        this.bezier = bezier;
        this.t = 0;
        this.speed = speed / 3;
        this.color = 'black';
        this.direction = 1;
        this.enemy = enemy;
        this.radius = 15;
        this.hitboxSize = 10;

        if (this.enemy) {
            this.prepareForEnemies();
        }
    }

    prepareForEnemies() {
        this.bezier.intersects(this.enemy.bezier).forEach((pair) => {
            this.enemyCollisionT = pair.split('/')[0];
            const xy = this.bezier.get(this.enemyCollisionT);
            this.enemyCollision = [xy.x, xy.y];
        });
    }

    update(ms) {
        ms = ms * 4.5;
        let newT = this.t + this.speed * ms * this.direction;
        let newDirection = this.direction;

        if (newT >= 1) {
            newT = 1;
            newDirection = -1;
        }

        if (newT <= 0) {
            newT = 0;
            newDirection = 1;
        }

        if (this.enemy && this.shouldStop(newT)) {
            this.draw();
            return;
        }

        this.t = newT;
        this.direction = newDirection;

        this.draw();
    }

    shouldStop(newT) {
        const {x, y} = this.bezier.get(newT);
        // console.log(getPointsDistance([x, y], this.enemy.coords()));
        // console.log(this.radius + this.hitboxSize);
        if (getPointsDistance(this.enemyCollision, [x, y]) < safeDistance) {
            if (getPointsDistance(this.enemyCollision, this.enemy.coords()) < safeDistance) {
                return true;
            }
        }

        return false;
    }

    draw() {
        const t = this.t;
        const {x, y} = this.bezier.get(t);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.arc(x, y, 1, 0, Math.PI * 2,  false);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, Math.PI * 2,  false);
        ctx.stroke();
        ctx.beginPath();
        ctx.strokeStyle = '#eee';
        ctx.arc(x, y, safeDistance / 2, 0, Math.PI * 2,  false);
        ctx.stroke();

        if (this.enemyCollision) {
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.arc(...this.enemyCollision, 1, 0, Math.PI * 2,  false);
            ctx.stroke();
        }
    }

    coords() {
        const xy =  this.xy();
        return [xy.x, xy.y];
    }

    xy() {
        return this.bezier.get(this.t);
    }
}


const path1 = new Bezier(200,40 , 125, 100 , 105,250);
const path2 = new Bezier(100, 100, 60, 120, 300, 300);

const circle1 = new Circle(path1, 0.0005, false);
const circle2 = new Circle(path2, 0.002, circle1);

const keys = {};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keydown', (event) => {
        keys[event.key] = true;
    });

    document.addEventListener('keyup', (event) => {
        delete keys[event.key];
    });

    const canvas = document.querySelector('canvas')
    canvas.addEventListener('mousedown', function(e) {
        // const [x, y] = getCursorPosition(canvas, e);
        // targets[0] = {x, y, active: true};
        // setNextTarget();
    })

    update();
});

const colors = [
    'red', 'green', 'blue', 'grey', 'pink'
]

const getFnFromPoints = ([x1, y1], [x2, y2]) => {
    const m  = (y2 - y1) / (x2 - x1);
    return x => m * (x - x1) + y1;
};

function getPointsDistance([x1, y1], [x2, y2]) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

function getFnsAngle(fn1, fn2, fullCircle = false) {
    const x1 = 0;
    const x2 = 1;
    const [a1x, a1y, a2x, a2y] = [x1, fn1(x1), x2, fn1(x2)];
    const [b1x, b1y, b2x, b2y] = [x1, fn2(x1), x2, fn2(x2)];
    const dAx = a2x - a1x;
    const dAy = a2y - a1y;
    const dBx = b2x - b1x;
    const dBy = b2y - b1y;
    let angle = Math.atan2(dAx * dBy - dAy * dBx, dAx * dBx + dAy * dBy);
    if(fullCircle && angle < 0) {angle = angle * -1;}
    return angle;
}

function getRotationMatrix(angle) {
    return [
        [Math.cos(angle), Math.sin(angle)],
        [-Math.sin(angle), Math.cos(angle)]
    ];
}

function fline(fn, color) {
    line([0, fn(0)], [canvas.width, fn(canvas.width)], color);
}

function line([x1, y1], [x2, y2], color = 'grey') {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.strokeStyle = color;
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

function circle(x, y, color = 'grey') {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.arc(x, y, 2, 0, Math.PI * 2,  false);
    ctx.stroke();
}

function degrees(radians) {
    return 180 / Math.PI * radians;
}

function drawBezier(bezier) {
    const precision = 0.05;
    const xy = bezier.get(0);
    ctx.moveTo(xy.x, xy.y);
    ctx.strokeStyle = '#ddd';

    for (let t = 0; t <= 1; t += precision) {
        const {x, y} = bezier.get(t);
        ctx.lineTo(x, y);
    }

    ctx.stroke();;
}

function draw(ms) {
    ms  = ms;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBezier(path1);
    drawBezier(path2);
    circle1.update(ms);
    circle2.update(ms);
}

let prevTime = Date.now();
function update() {
    const passed = Date.now() - prevTime;
    prevTime = Date.now();
    draw(passed);
    requestAnimationFrame(update);
}

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    return [x, y];
}

