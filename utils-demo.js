function point(name, [x, y]) {
    ctext(ctx, x, y, name);
}

function drawSituation(p1, p2, p3) {
    line(p1, [p1[0] - 100, p1[1]], 'red');
    line(p1, p2, 'red');
    line(p1, p3);
    circle(...p1);
    // point('p1', p1);
    // point('p2', p2);
    point('p3', p3);
    ctext(ctx, ...p1, degrees(getPointsAngle(p1, p2, p3)));
    ctext(ctx, ...p2, degrees(getTurnAngle(p1, p2, p3)));
}

document.addEventListener('DOMContentLoaded', () => {
    const {ctx} = createCanvas(800, 600);
    window.ctx = ctx;
    drawSituation(
        [50, 50],
        [100, 100],
        [75, 150],
    );

    drawSituation(
        [350, 50],
        [450, 100],
        [200, 150],
    );

    drawSituation(
        [150, 350],
        [200, 400],
        [50, 300],
    );

    drawSituation(
        [350, 350],
        [400, 400],
        [400, 300]
    );

    drawSituation(
        [550, 350],
        [600, 300],
        [490, 400]
    );
});
