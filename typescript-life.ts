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

    setRules(bornRule: number[], sustainRule: number[]) {
        this.bornRule = bornRule;
        this.sustainRule = sustainRule;
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
        var emptyCells: string[] = [" ", ".", ""];
        this.cells = this.makeCellGrid(
            function (x, y) {
                return (typeof lines[y] !== "undefined")
                    && (emptyCells.indexOf(lines[y].substr(x, 1)) === -1);
            }
        );
    }

    drawOnCanvas(pixels: CanvasRenderingContext2D) {
        pixels.fillStyle = '#000';
        pixels.clearRect(0, 0, this.width * canvasScale, this.height * canvasScale);
        for (var y: number = 0; y < this.height; y++) {
            for (var x: number = 0; x < this.width; x++) {
                if (this.cells[x][y].alive) {
                    pixels.fillRect(x * canvasScale, y * canvasScale, canvasScale, canvasScale);
                }
            }
        }
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

var updateText: boolean;

var updateCanvas: boolean;

var canvasScale: number = 1;

var pixels: CanvasRenderingContext2D;

var world: World;

var timer: any;

var textarea: HTMLTextAreaElement;

function getRules(target: string) {
    var rawRules: string = (<HTMLInputElement>document.getElementById(target)).value;
    var ruleParts: string[] = rawRules.split(',');
    var rules: number[] = [];
    for (var i: number = 0; i < ruleParts.length; i++) {
        rules[rules.length] = parseInt(ruleParts[i]);
    }
    return rules;
}

function init(target: string): void {
    var rows: number = parseInt((<HTMLInputElement>document.getElementById('rows')).value);
    var cols: number = parseInt((<HTMLInputElement>document.getElementById('cols')).value);
    updateCanvas = (<HTMLInputElement>document.getElementById('updateCanvas')).checked;
    updateText = (<HTMLInputElement>document.getElementById('updateText')).checked;
    var scaleSlider = (<HTMLInputElement>document.getElementById('scale'));
    canvasScale = parseInt(scaleSlider.value);
    var bornRules: number[] = getRules('born');
    var sustainRules: number[] = getRules('sustain');
    world = new World(cols, rows)
    world.setRules(bornRules, sustainRules);
    var canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById(target + "canvas");
    canvas.width = cols * canvasScale;
    canvas.height = rows * canvasScale;
    pixels = canvas.getContext('2d')
    textarea = <HTMLTextAreaElement>document.getElementById(target);
    textarea.rows = rows;
    textarea.cols = cols;
    textarea.value = world.asHtml();

    var scaleDisplay = <HTMLCanvasElement>document.getElementById('scale-display');
    scaleSlider.addEventListener('input', function showSlideValue() {
      scaleDisplay.innerText = scaleSlider.value;
    }, { passive: true });
}

function updateWorldFromText(): void {
    world.updateFromText(textarea.value);
}

function update(): void {
    world.update();
    if (updateText) {
        textarea.value = world.asHtml();
    }
    if (updateCanvas) {
        world.drawOnCanvas(pixels);
    }
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