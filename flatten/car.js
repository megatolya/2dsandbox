const rotationSpeed = 0.00110; // degree per ms
const acceleration = 0.0029; // pixel per ms
const brakeSpeed = 0.0039;
const deltaMax = 0.755; // 41 degree
const maxVelocity = 3;
const carLength = 200;
const bodyHitboxLength = carLength + 60;
const headHitboxLength = 150;
const carWidth = 100;

const wheelLength = 50;
const wheelWidth = 19;

const cars = [];

class Car extends EventTarget {
    constructor({x, y, delta, theta, waypoints, color, ctx, velocity = 0}) {
        super();
        cars.push(this);

        this.x = x;
        this.y = y;
        this.delta = delta;
        this.theta = theta;
        this.waypoints = waypoints;
        this.velocity = velocity;
        this.targetI = 0;
        this.color = color;
        const {ctx: _ctx} = createCanvas(300, 300);
        this.ctx = _ctx;
        this.commonCtx = ctx;
    }

    calcUpdate(ms) {
        ms = ms;

        let {x, y, velocity, delta, theta} = this;
        let {angleToTarget} = this.calcPositionToTarget();

        const collides = this.isCollides();

        if (collides) {
            velocity -= brakeSpeed * ms;
            velocity = Math.max(velocity, 0);
        } else {
            velocity += acceleration * ms;
            velocity = Math.min(velocity, maxVelocity);
        }

        x += velocity * Math.cos(theta);
        y += velocity * Math.sin(theta);

        if (angleToTarget > 0) {
            delta += Math.min(rotationSpeed * ms, angleToTarget);
        } else if (angleToTarget < 0) {
            delta -= Math.max(rotationSpeed * ms, angleToTarget);
        }

        delta = Math.min(delta, deltaMax);
        delta = Math.max(delta, -deltaMax);
        theta += (velocity * Math.tan(delta)) / carLength;

        return {x, y, velocity, delta, theta};
    }

    update(ms) {
        if (this.disappeared) return;

        let {distanceToTarget} = this.calcPositionToTarget();

        if (distanceToTarget < 2) {
            this.setNextTarget();
            this.update(ms);
            return;
        }

        const {x, y, velocity, delta, theta} = this.calcUpdate(ms);
        this.delta = delta;
        this.theta = theta;
        this.x = x;
        this.y = y;
        this.velocity = velocity;

        this.draw();
        this.updateMonitor({
            delta,
            theta,
            x,
            y,
            target: this.targetI
        });
    }

    updateMonitor(obj) {
        Object.keys(obj).forEach((key, i) => {
            const value = obj[key];
            this.text(10, 30 * (i + 1), `${key}: ${value}`);
        });
    }

    isCollides() {
        const enemies = this.enemies;
        const {body, head} = this.hitbox;
        let collides = false;
        enemies.forEach(enemy => {
            const {body: ebody, head: ehead} = enemy.hitbox;

            const smthCollides = isLinesCollides(head, ebody);

            if (smthCollides) {
                collides = true;
            }
        });
        return collides;
    }

    draw() {
        this.drawCar();
        this.drawWaypoints();
        this.drawBicycleCam();
    }

    drawBicycleCam() {
        const {x, y, delta, theta} = this;
        const {
            cx, cy,
            a, b,
            a2, b2, c2,
            bodyFn,
            headPointerFn, xAxisFn, headToTargetFn,
            bodyAngleToTarget,
            rotateByBodyCenter,
            rx1, ry1,
            rx2, ry2,
            rtx, rty
        } = this.calc();
        const {width, height} = this.ctx.canvas;

        this.ctx.save();
        this.ctx.clearRect(0, 0, width, height);
        this.rect(
            width / 2 - carLength / 2,
            height / 2 - carWidth / 2,
            carLength,
            carWidth,
            this.color
        )
        const m = new Matrix();
        m.translate(width / 2 + carLength / 2, height / 2);
        m.applyToContext(this.ctx);
        this.rect(-wheelLength / 2 - carLength, -wheelWidth / 2, wheelLength, wheelWidth, this.color);
        m.rotate(delta);
        m.applyToContext(this.ctx);
        this.rect(-wheelLength / 2, -wheelWidth / 2, wheelLength, wheelWidth, this.color);
        this.ctx.restore();
        const [targetX, targetY] = this.target;

        this.ctx.save();
        const m2 = new Matrix();
        m2.translate(width / 2, height / 2);
        m2.rotate(-theta);
        m2.translate(-width / 2, -height / 2);
        m2.translate(width / 2 - cx, height / 2 - cy);
        m2.applyToContext(this.ctx);
        this.waypoints.forEach(([x, y], i) => {
            const active = i === this.targetI;
            const size = active ? 10 : 5;
            this.rect(x - size / 2, y - size / 2, size, size, this.color);
        });
        this.ctx.restore();

        this.line(
            [width / 2 + carLength / 2, -1000],
            [width / 2 + carLength / 2, 1000]
        );

        const distanceToTarget = getPointsDistance([x + a, y + b], [targetX, targetY]);
        const {x: rtx2, y: rty2} =  m2.applyToPoint(targetX, targetY);
        const distanceToTarget2 = getPointsDistance([
            width / 2 + carLength / 2,
            height / 2
        ], [
            rtx2, rty2
        ]);
        this.line([
            width / 2 + carLength / 2,
            height / 2
        ], [
            rtx2, rty2
        ]);
        // drawDebugLines({
            // x, y, a, b, a2, b2, headPointerFn,
            // rx1, ry1, rx2, ry2,
            // rtx, rty,
            // targetX, targetY, ctx: this.commonCtx
        // });
    }

    drawCar() {
        const {x, y, delta, theta, velocity, color} = this;
        const {body: bodyHitbox, head: headHitbox} = this.hitbox;
        const ctx = this.commonCtx;

        ctx.save();

        ctx.translate(x, y);
        ctx.rotate(theta);
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 1;
        ctx.rect(0, -carWidth / 2, carLength, carWidth)
        ctx.stroke();
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'black';
        ctx.rect(10, -carWidth / 2, wheelLength, wheelWidth);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(10, (-wheelWidth) + (carWidth / 2), wheelLength, wheelWidth);
        ctx.stroke();
        ctx.save();
        ctx.translate(carLength - wheelLength / 2 - 5, carWidth / 2 - wheelWidth / 2);

        ctx.rotate(delta);
        ctx.beginPath();
        ctx.rect(-wheelLength / 2, -wheelWidth / 2, wheelLength, wheelWidth);
        ctx.stroke();
        ctx.restore();
        ctx.translate(carLength - wheelLength / 2 - 5, -carWidth / 2 + wheelWidth / 2);

        ctx.rotate(delta);
        ctx.beginPath();
        ctx.rect(-wheelLength / 2, -wheelWidth / 2, wheelLength, wheelWidth);
        ctx.stroke();

        ctx.restore();
        // line(...headHitbox, '#eee');
    }

    drawWaypoints() {
        const ctx = this.commonCtx;

        this.waypoints.forEach(([x, y], i) => {
            const active = i === this.targetI;
            ctx.fillStyle = this.color;
            const size = active ? 10 : 5;
            ctx.fillRect(x - size / 2, y - size / 2, size, size);
        });
    }

    get target() {
        return this.waypoints[this.targetI]
    }

    setNextTarget() {
        this.targetI++;
        const waypoints = this.waypoints;

        if (this.targetI === waypoints.length) {
            this.disappear();
            this.emit('disappear');
            return;
        }

        this.emit('targetchange', this.waypoints[this.targetI]);
    }

    on(eventName, fn) {
        this.addEventListener(eventName, fn);
    }

    emit(eventName, data) {
        const event = new Event(eventName);
        event.data = data;
        this.dispatchEvent(event);
    }

    disappear() {
        this.disappeared = true;
        cars.splice(cars.indexOf(this), 1);
        Car.update(0);
        this.ctx.canvas.remove();
    }

    line(...args) {
        cline(this.ctx, ...args);
    }

    circle(...args) {
        ccircle(this.ctx, ...args);
    }

    rect(...args) {
        crect(this.ctx, ...args);
    }

    text(...args) {
        ctext(this.ctx, ...args);
    }

    calc() {
        const [targetX, targetY] = this.target;
        const {x, y, delta, theta} = this;
        const canvas = this.commonCtx.canvas;
        const b = Math.sin(theta) * carLength;
        const a = theta === 0 ? 0 : b / Math.tan(theta);
        const x1 = x + a;
        const y1 = y + b;
        const c2 = 50;
        const a2 = c2 * Math.cos(delta + theta);
        const b2 = c2 * Math.sin(delta + theta);

        const bodyFn = getFnFromPoints([x, y], [x + a, y + b]);
        const headPointerFn = getFnFromPoints([x + a, y + b], [x + a + a2, y + b + b2]);
        const headToTargetFn = getFnFromPoints([x + a, y + b], [targetX, targetY]);
        const xAxisFn = getFnFromPoints([-1, 0], [0, 0]);

        const bodyAngleToTarget = getFnsAngle(bodyFn, xAxisFn, false);
        const matrix = new Matrix();

        if (x < x + a) {
            matrix.rotate(bodyAngleToTarget);
        } else {
            matrix.rotate(bodyAngleToTarget + Math.PI);
        }

        const [cx, cy] = [(x + x + a) / 2, (y + y + b) / 2];
        const rotateByBodyCenter = (x, y) => {
            x -= cx;
            y -= cy;
            const xy = matrix.applyToPoint(x, y);
            x = xy.x;
            y = xy.y;
            return [x + cx, y + cy];
        };
        const [rx1, ry1] = rotateByBodyCenter(x, y);
        const [rx2, ry2] = rotateByBodyCenter(x + a, y + b);
        const [rtx, rty] = rotateByBodyCenter(targetX, targetY);

        return {
            cx, cy,
            a, b,
            a2, b2, c2,
            bodyFn,
            headPointerFn, xAxisFn, headToTargetFn,
            bodyAngleToTarget,
            rotateByBodyCenter,
            rx1, ry1,
            rx2, ry2,
            rtx, rty
        };
    }

    calcPositionToTarget() {
        const [targetX, targetY] = this.target;
        const {x, y, theta, delta} = this;
        const {
            cx, cy,
            a, b,
            a2, b2, c2,
            bodyFn,
            headPointerFn, xAxisFn, headToTargetFn,
            bodyAngleToTarget,
            rotateByBodyCenter,
            rtx, rty,
            rx2, ry2
        } = this.calc();

        const distanceToTarget = getPointsDistance([x + a, y + b], [targetX, targetY]);
        return {distanceToTarget, angleToTarget: this.calcHeadToTarget()};
    }

    calcHeadToTarget() {
        const {x, y, theta, delta} = this;
        const [targetX, targetY] = this.target;
        const {
            cx, cy,
            a, b,
        } = this.calc();
        const m = new Matrix();
        m.translate(cx, cy);
        m.rotate(-theta);
        m.translate(-cx, -cy);
        const {x: x3, y: y3} = m.applyToPoint(targetX, targetY);
        m.translate(x + a, y + b);
        m.rotate(delta + theta);
        const {x: x1, y: y1} = m.applyToPoint(0, 0);
        const {x: x2, y: y2} = m.applyToPoint(wheelLength / 2, 0);
        const angle = getTurnAngle([x1, y1], [x2, y2], [x3, y3]);
        return angle;
    }

    get hitbox() {
        const [targetX, targetY] = this.target;
        const {x, y, delta, theta} = this;
        const {a, b} = this.calc();
        const y1 = Math.sin(theta) * bodyHitboxLength;
        const x1 = theta === 0 ? 0 : y1 / Math.tan(theta);
        const a2 = headHitboxLength * Math.cos(delta + theta);
        const b2 = headHitboxLength * Math.sin(delta + theta);
        return {
            body: [[x, y], [x + x1, y + y1]],
            head: [[x + a, y + b], [x + a + a2, y + b + b2]]
        };
    }

    get enemies() {
        return cars.filter(b => b !== this);
    }
}

Car.update = passed => {
    cars.forEach(car => {
        car.update(passed);
    });
};

class ControlledCar extends Car {
    constructor(...args) {
        super(...args);
        this.controlled = true;
        this.keys = args[0].keys;
    }

    calcUpdate(ms) {
        const keys = this.keys;
        let {x, y, delta, theta, velocity, color} = this;
        if (keys.ArrowUp) {
            velocity += acceleration * ms;
        } else if (keys.ArrowDown) {
            velocity -= brakeSpeed * ms;
        } else if (velocity > 0) {
            velocity -= 0.05;
            velocity = Math.max(velocity, 0);
        }

        if (velocity < -10) velocity = -10;

        if (keys.ArrowRight) {
            delta += Math.max(rotationSpeed * ms);
        } else if (keys.ArrowLeft) {
            delta -= Math.max(rotationSpeed * ms);
        } else {
            if (delta < 0) {
                delta += 2 * rotationSpeed * ms;
                delta = Math.min(0, delta);
            } else {
                delta -= 2 * rotationSpeed * ms;
                delta = Math.max(0, delta);
            }
        }

        delta = Math.max(-0.95, Math.min(0.95, delta));
        velocity = Math.max(-10, Math.min(10, velocity));

        if (Math.abs(velocity) < 0.03) {
            velocity = 0;
        }

        theta += (velocity * Math.tan(delta)) / carLength;
        x += velocity * Math.cos(theta);
        y += velocity * Math.sin(theta);

        return {x, y, velocity, delta, theta};
    }
}
