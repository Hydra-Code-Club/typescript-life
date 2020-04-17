class World {
    el: HTMLTextAreaElement;
    cells: Cell[][];
    width: number;
    height: number;

    constructor(elID: string, width: number, height: number) {
        this.el = <HTMLTextAreaElement>document.getElementById(elID);
        this.width = width;
        this.height = height;
        this.cells = [];
        for (var x: number = 0; x < height; x++) {
            this.cells[x] = [];
            for (var y: number = 0; y < width; y++) {
                var alive: boolean = Math.random() < 0.5;
                this.cells[x][y] = new Cell(x, y, alive, this);
            }
        }
    }

    update(): void {
        var newCells: Cell[][] = [];
        for (var x: number = 0; x < this.height; x++) {
            newCells[x] = [];
            for (var y: number = 0; y < this.width; y++) {
                newCells[x][y] = new Cell(x, y, this.cells[x][y].getNextState(), this);
            }
        }
        this.cells = newCells;
    }

    updateFromText(text: string): void {
        var lines: string[] = text.split("\n");

        for (var x: number = 0; x < this.height; x++) {
            this.cells[x] = [];
            for (var y: number = 0; y < this.width; y++) {
                var alive: boolean = (typeof lines[x] !== "undefined")
                    && lines[x].substr(y, 1) == "x";
                this.cells[x][y] = new Cell(x, y, alive, this);
            }
        }
    }

    render(): void {
        var html: string = "";
        for (var x: number = 0; x < this.height; x++) {
            for (var y: number = 0; y < this.width; y++) {
                html += this.cells[x][y].alive ? 'x' : ' ';
            }
            if (x < this.height - 1) {
                html += "\n";
            }
        }
        this.el.value = html;
    }
}

class Cell {
    x: number;
    y: number;
    alive: boolean;
    world: World;

    constructor(x: number, y: number, alive: boolean, world: World) {
        this.x = x;
        this.y = y;
        this.alive = alive;
        this.world = world;
    }

    hasNeighborAtDelta(deltaX, deltaY): boolean {
        if (deltaX == 0 && deltaY == 0) {
            return false;
        }
        var newX: number = this.x + deltaX;
        if (newX < 0) {
            newX = this.world.height - 1;
        }
        if (newX >= this.world.height) {
            newX = 0;
        }
        var newY: number = this.y + deltaY;
        if (newY < 0) {
            newY = this.world.width - 1;
        }
        if (newY >= this.world.width) {
            newY = 0;
        }
        return this.world.cells[newX][newY].alive;
    }

    getNextState(): boolean {
        var neighbors: number = 0;
        for (var deltaX: number = -1; deltaX <= 1; deltaX++) {
            for (var deltaY: number = -1; deltaY <= 1; deltaY++) {
                neighbors += this.hasNeighborAtDelta(deltaX, deltaY) ? 1 : 0;
            }
        }
        return ((this.alive && neighbors == 2) || neighbors == 3);
    }
}

var world: World;


function init(target): void {
    world = new World(target, 80, 30);
    stoploop();
    world.render();
}

function updateWorldFromText(target): void {
    world.updateFromText((<HTMLTextAreaElement>document.getElementById(target)).value);
}

function step(): void {
    world.update();
    world.render();
}

var timer: any;
var accumulator = 0;
var fps = 10;
var delta = 1E3 / fps;  // delta between performance.now timings (in ms)
var last: number, now: number, dt: number;
function loop() {
  timer = requestAnimationFrame(loop);

  now = window.performance.now();
  dt = now - last;
  last = now;

  // prevent updating the game with a very large dt if the game were to lose focus
  // and then regain focus later
  if (dt > 1E3) {
    return;
  }

  accumulator += dt;

  while (accumulator >= delta) {
    world.update();

    accumulator -= delta;
  }

  world.render();
}

function startloop() {
    last = window.performance.now();
    loop();
}

function adjustSpeed(_fps: number) {
    fps = _fps;
    delta = 1E3 / fps;
}

function stoploop(): void {
    cancelAnimationFrame(timer);
}
