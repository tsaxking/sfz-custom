class Canvas {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.elements = [];
        this.animating = false;
    }

    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    add(element) {
        this.elements.push(element);
    }

    remove(element) {
        this.elements.splice(this.elements.indexOf(element), 1);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    draw() {
        this.clear();
        this.elements.forEach(element => {
            element.draw(this.ctx);
        });
    }

    animate() {
        this.animating = true;
        this.draw();
        if (this.animating) requestAnimationFrame(this.animate.bind(this));
    }

    stop() {
        this.animating = false;
    }
}