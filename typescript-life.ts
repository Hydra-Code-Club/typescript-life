class World {
    cells: Cell[][];
    width: number;
    height: number;

    constructor(width: number, height: number) {
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

    asHtml(): string {
        var html: string = "<tt>";
        for (var x: number = 0; x < this.height; x++) {
            for (var y: number = 0; y < this.width; y++) {
                html += this.cells[x][y].alive ? 'x' : '&nbsp;';
            }
            html += '<br />';
        }
        html += "</tt>";
        return html;
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

    getNextState(): boolean {
        // TODO: calculate next state
        return Math.random() < 0.5;
    }
}

var world: World = new World(80, 25);

function init(target): void {
    document.getElementById(target).innerHTML = world.asHtml();
}

function update(target): void {
    world.update();
    init(target);
}

function autoupdate(target): void {
    setTimeout(function () {
        world.update();
        init(target);
        autoupdate(target);
    }, 100);
}