
let canvas = this.document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let mouseX = 0;
let mouseY = 0;
let dragging = false;
var point_idx = 0;

ctx.fillStyle = "black";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.getElementsByClassName("body").style = "body { margin: 0 }";

const dot = math.multiply;
const T = math.transpose;

var points = math.matrix([[1, 1], [5, 5], [10, 10]]) // Matrix


function p(i) {
    return math.subset(points, math.index(i, [0, 1]))._data[0];
}

function genA() {
    var a = [];
    iter_points(function(i, p) {
        a.push([p[0], 1]);
    });
    return math.matrix(a);
}

function genb() {
    var b = [];
    iter_points(function(i, p) {
        b.push([p[1]]);
    });
    return math.matrix(b);
}

function least_squares() {
    A = genA();
    b = genb();
    return dot(math.inv(dot(T(A), A)), dot(T(A), b))._data;
}

function draw_solution() {
    let sol = least_squares();

    let m = sol[0][0];
    let b = sol[1][0];

    ctx.beginPath();
    var x = 0;
    ctx.moveTo(x, m*x + b);
    x = canvas.width;
    ctx.lineTo(x, math.round(m*x + b));
    ctx.stroke();
}

var unknowns = math.matrix([[1], [2]]);

function draw_points() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    iter_points(function(i, point) {
        ctx.fillRect(point[0], point[1], 4, 4);
    });

    draw_solution();
}

function update_point(i, x, y) {
    points = math.subset(points, math.index(i, [0, 1]), [x, y]);
}

function update_mouse(event) {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
}

function iter_points(fn) {
    for (let i = 0; i < points.size()[0]; i++) {
        fn(i, p(i));
    }
}

function closest(x, y) {
    let closest = -1;
    let mindist = 20;
    iter_points(function(i, point) {
        let dx = point[0] - x;
        let dy = point[1] - y;
        let dist = math.sqrt(dx*dx + dy*dy);
        if (dist < mindist) {
            mindist = dist;
            closest = i;
        }
    });
    return closest;
}

window.onclick = function(event) {
    update_mouse(event);
    this.least_squares();
}

window.onmousemove = function(event) {
    update_mouse(event);
    if (dragging && point_idx >= 0) {
        this.update_point(point_idx, mouseX, mouseY);
    }
    draw_points();
}

window.onresize = function() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.onmousedown = function() {
    update_mouse(event);
    dragging = true;
    point_idx = closest(mouseX, mouseY);
}

window.onmouseup = function() {
    update_mouse(event);
    dragging = false;
}