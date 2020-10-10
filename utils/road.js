let i = 0;

class Waypoint {
    constructor([x, y], prev) {
        this.x = x;
        this.y = y;
        this[0] = x;
        this[1] = y;
        this.length = 2;
        this.prev = prev ? [prev] : [];
        this.next = [];
        this.id = i++;
    }

    createRouteTo(point, waypointsCount) {
        return Waypoint.createRoute(this, point, waypointsCount).end;
    }

    xy(translate) {
        if (translate) {
            return [this.x + translate, this.y - translate];
        }

        return [this.x, this.y];
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            id: this.id,
            next: this.next.length === 1 ? this.next[0] : this.next
        };
    }

    getPrimitiveWay() {
        const res = [];
        let current = this;

        while (current) {
            res.push(current);
            current = current.next[0];
        }

        return res;
    }

    findWay(target) {
        if (this === target) return [this];

        const stack = [{waypoint: this, prev: []}];

        while (stack.length) {
            const {waypoint: current, prev} = stack.pop();
            if (current === target) {
                return prev.concat(current);
            }

            if (current.next.length) {
                current.next.forEach(w => stack.push({
                    waypoint: w,
                    prev: prev.concat(current)
                }));
            }
        }

        return [];
    }
}

Waypoint.createRoute = (from, to, waypointsCount = 5) => {
    const [[x1, y1], [x2, y2]] = from instanceof Waypoint
        ? [from.xy(), to]
        : [from, to];
    const fn = interpolatePoints([[x1, y1], [x2, y2]]);
    const step = (x2 - x1) / (waypointsCount - 1);

    let prev = from instanceof Waypoint
        ? from
        : new Waypoint([x1, fn(x1)], null);
    const start = prev;

    for (let x = x1 + step, i = 0; i < waypointsCount - 1; x += step, i++) {
        const waypoint = new Waypoint([x, fn(x)], prev);
        prev.next.push(waypoint);
        prev = waypoint;
    }

    const end = new Waypoint([x2, fn(x2)], prev);
    prev.next.push(end);
    return {start, end};
}


const roads = [];

class Road {
    constructor(waypoints, ctx) {
        roads.push(this);
        this.waypoints = waypoints;
        this.ctx = ctx;
    }

    update(ms) {
        this.draw();
    }

    draw() {
        const waypoints = this.waypoints;

        ctx.beginPath();
        ctx.moveTo(...waypoints[0].xy());
        waypoints.forEach(waypoint => {
            ctx.lineTo(...waypoint.xy());
        });
        ctx.stroke();
    }
}

Road.update = passed => {
    roads.forEach(road => {
        road.update(passed);
    });
};
