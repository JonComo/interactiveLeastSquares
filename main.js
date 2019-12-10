
let canvas = this.document.getElementById("canvas");
let ctx = canvas.getContext('2d');
let mouseX = 0;
let mouseY = 0;
let dragging = false;
var point_idx = 0;
var degree = 1;

ctx.fillStyle = "black";
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.getElementsByClassName("body").style = "body { margin: 0 }";

const dot = math.multiply;
const T = math.transpose;

function generate_matrix() {
    var m = [];
    for (let i = 0; i < 9; i++) {
        m.push([50 + i*50, 50 + 50*math.sin(i)]);
    }
    return math.matrix(m);
}

var points = generate_matrix();

function p(i) {
    return math.subset(points, math.index(i, [0, 1]))._data[0];
}

function model(x, params) {
    var y = 0;
    for (let j = 0; j <= degree; j++) {
        y += params[j] * math.pow(x, j);
    }
    return y;
}

function genA() {
    var a = [];
    iter_points(function(i, p) {
        var pwrs = [];
        for (let j = 0; j <= degree; j++) {
            pwrs.push(math.pow(tom(p[0]), j));
        }
        a.push(pwrs);
    });
    return math.matrix(a);
}

function genb() {
    var b = [];
    iter_points(function(i, p) {
        b.push([tom(p[1])]);
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

    var params = [];
    for (let i = 0; i <= degree; i ++) {
        params.push(sol[i][0]);
    }

    ctx.beginPath();
    var x = 0;
    ctx.moveTo(x, tos(model(tom(x), params)));
    for (x = 0; x < canvas.width; x += 5) {
        ctx.lineTo(x, tos(model(tom(x), params)));
    }
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
        draw_points();
        this.draw_solution();
    }
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

document.getElementById("sliderDegree").oninput = function(evt) {
    let d = evt.target.value;
    degree = d;
    document.getElementById("title").innerText = "Interactive Least Squares: Polynomial of degree " + d + ".";
    update();
}

// Converts point to math space (smaller numbers)
function tom(x) {
    return x / 1;
}

// Converts point to screen space
function tos(x) {
    return x * 1;
}

function update() {
    draw_points();
    draw_solution();
}

update();