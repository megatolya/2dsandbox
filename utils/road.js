class Waypoint {
    constructor([x, y], prev) {
        this.x = x;
        this.y = y;
        this.prev = prev ? [prev] : [];
        this.next = [];
    }

    createRoadTo(point) {
        const road = Waypoint.createRoad(this, point);

        // this.next.push(road.next);
    }

    xy() {
        return [this.x, this.y];
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
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
}

Waypoint.createRoad = (from, to, waypointsCount = 5) => {
    const [[x1, y1], [x2, y2]] = from instanceof Waypoint
        ? [from.xy(), to]
        : [from, to];
    const fn = interpolatePoints([[x1, y1], to]);
    const step = (x2 - x1) / (waypointsCount - 1);

    let prev = from instanceof Waypoint
        ? from
        : new Waypoint([x1, fn(x1)], null);
    const start = prev;

    for (let x = x1 + step; x !== x2; x += step) {
        const waypoint = new Waypoint([x, fn(x)], prev);
        prev.next.push(waypoint);
        prev = waypoint;
    }

    const end = new Waypoint([x2, fn(x2)], prev);
    prev.next.push(end);
    return start;
}

