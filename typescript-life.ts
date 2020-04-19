class World {
    cells: Cell[][];
    width: number;
    height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.cells = [];
        for (var y: number = 0; y < height; y++) {
            this.cells[y] = [];
            for (var x: number = 0; x < width; x++) {
                var alive: boolean = Math.random() < 0.5;
                this.cells[y][x] = new Cell(x, y, alive, this);
            }
        }
    }

    update(): void {
        var newCells: Cell[][] = [];
        for (var y: number = 0; y < this.height; y++) {
            newCells[y] = [];
            for (var x: number = 0; x < this.width; x++) {
                newCells[y][x] = new Cell(x, y, this.cells[y][x].getNextState(), this);
            }
        }
        this.cells = newCells;
    }

    updateFromText(text: string): void {
        var lines: string[] = text.split("\n");

        for (var y: number = 0; y < this.height; y++) {
            this.cells[y] = [];
            for (var x: number = 0; x < this.width; x++) {
                var alive: boolean = (typeof lines[y] !== "undefined")
                    && lines[y].substr(x, 1) == "x";
                this.cells[y][x] = new Cell(x, y, alive, this);
            }
        }
    }

    asHtml(): string {
        var html: string = "";
        for (var y: number = 0; y < this.height; y++) {
            for (var x: number = 0; x < this.width; x++) {
                html += this.cells[y][x].alive ? 'x' : ' ';
            }
            if (y < this.height - 1) {
                html += "\n";
            }
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
        var newX: number = (this.x + deltaX + this.world.width) % this.world.width;
        var newY: number = (this.y + deltaY + this.world.height) % this.world.height;
        return this.world.cells[newY][newX].alive;
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