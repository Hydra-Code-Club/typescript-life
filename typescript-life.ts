class World {
    cells: Cell[][];
    width: number;
    height: number;
    bornRule: number[];
    sustainRule: number[];

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.bornRule = [3];
        this.sustainRule = [2, 3];
        this.cells = this.makeCellGrid(
            function () {
                return Math.random() < 0.5;
            }
        );
    }

    makeCellGrid(isAliveCallback: (x: number, y: number) => boolean): Cell[][] {
        var grid: Cell[][] = [];
        for (var x: number = 0; x < this.width; x++) {
            grid[x] = [];
            for (var y: number = 0; y < this.height; y++) {
                grid[x][y] = new Cell(x, y, isAliveCallback(x, y), this);
            }
        }
        return grid;
    }

    update(): void {
        this.cells = this.makeCellGrid(
            (function (x, y) {
                return this.cells[x][y].getNextState();
            }).bind(this)
        );
    }

    updateFromText(text: string): void {
        var lines: string[] = text.split("\n");
        this.cells = this.makeCellGrid(
            function (x, y) {
                return typeof lines[y] !== "undefined" && lines[y].substr(x, 1) == "x";
            }
        );
    }

    asHtml(): string {
        var html: string = "";
        for (var y: number = 0; y < this.height; y++) {
            for (var x: number = 0; x < this.width; x++) {
                html += this.cells[x][y].alive ? 'x' : ' ';
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
        return this.world.cells[newX][newY].alive;
    }

    getNextState(): boolean {
        var neighbors: number = 0;
        for (var deltaX: number = -1; deltaX <= 1; deltaX++) {
            for (var deltaY: number = -1; deltaY <= 1; deltaY++) {
                neighbors += this.hasNeighborAtDelta(deltaX, deltaY) ? 1 : 0;
            }
        }
        return (this.alive && this.world.sustainRule.indexOf(neighbors) > -1)
            || (!this.alive && this.world.bornRule.indexOf(neighbors) > -1);
    }
}

var world: World = new World(80, 30);

var timer: any;

var textarea: HTMLTextAreaElement;

function init(target): void {
    textarea = <HTMLTextAreaElement>document.getElementById(target);
    textarea.value = world.asHtml();
}

function updateWorldFromText(): void {
    world.updateFromText(textarea.value);
}

function update(): void {
    world.update();
    textarea.value = world.asHtml();
}

function autoupdate(): void {
    timer = requestAnimationFrame(function () {
        autoupdate();
    });
    update();
}

function stopupdate(): void {
    cancelAnimationFrame(timer);
}