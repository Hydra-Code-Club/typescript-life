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

    asHtml(): string {
        var html: string = "";
        for (var x: number = 0; x < this.height; x++) {
            for (var y: number = 0; y < this.width; y++) {
                html += this.cells[x][y].alive ? 'x' : ' ';
            }
            html += "\n";
        }
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

    hasNeighborAtDelta(deltaX, deltaY): boolean {
        if (deltaX == 0 && deltaY == 0) {
            return false;
        }
        if (typeof this.world.cells[this.x + deltaX] !== "undefined"
            && typeof this.world.cells[this.x + deltaX][this.y + deltaY] !== "undefined"
        ) {
            return this.world.cells[this.x + deltaX][this.y + deltaY].alive;
        }
        return false;
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

var world: World = new World(80, 30);

var timer: any;

function init(target): void {
    (<HTMLTextAreaElement>document.getElementById(target)).value = world.asHtml();
}

function updateWorldFromText(target): void {
    world.updateFromText((<HTMLTextAreaElement>document.getElementById(target)).value);
}

function update(target): void {
    world.update();
    init(target);
}

function autoupdate(target): void {
    timer = setTimeout(function () {
        world.update();
        init(target);
        autoupdate(target);
    }, 100);
}

function stopupdate(): void {
    clearTimeout(timer);
}