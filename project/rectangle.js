/**
 * @property {Array.<number>} cellArray - array of cells in 1D notation
 * @property {string} color
 * @property {{x: number, y: number}} pos - the position
 * @property {number} width
 * @property {number} height
 */
export class Rectangle {
    /**
     * @param {Array.<number>} array
     * @param {string} color
     * @param {number} rowLength
     */
    constructor(array, color, rowLength) {
        this.wrapping = false
        const getY = cell => Math.floor(cell / rowLength)
        const getX = cell => cell % rowLength

        this.color = color
        this.cellArray = array

        /** @description Starting from 0, left-top */
        this.pos = {x: getX(this.cellArray[0]), y: getY(this.cellArray[0])}
        let lastPos = this.cellArray[0]
        let breaks = {
            doesWrap: false,
            columns: undefined,
            rows: undefined,
        }
        for (const cell of this.cellArray.slice(1)) {
            if (((cell - 1) % rowLength) !== (lastPos % rowLength)) {
                // cells change rows without spanning whole width, or skip columns
                this.width = getX(lastPos) - getX(cell) + 1
                breaks.columns = {to: cell, from: lastPos}
                breaks.doesWrap = true
                if(
                    // with width not full rows
                    // skip row
                    this.width > 0 &&
                    ((cell-1) % this.width) !== (lastPos % this.width)
                ) {
                    breaks.rows = {to: cell, from: lastPos}
                }
            }
            if(
                // row gaps
                getY(cell - 1) !== getY(lastPos) &&
                // with full row width    || with diagonal
                (this.width === undefined || (breaks.columns && !breaks.rows))
            ) {
                breaks.rows = {to: cell, from: lastPos}
                breaks.doesWrap = true
            }
            lastPos = cell
        }
        if (this.width === undefined) {
            // No break between cells in array
            if (lastPos + 1 > rowLength) {
                this.width = rowLength
                this.height = getY(lastPos) - getY(this.cellArray[0]) + 1
            } else {
                this.height = 1
            }
        } else {
            // Width was found with a break, meaning more than one row of rectangle
            this.height = getY(this.cellArray[this.cellArray.length - 1]) - getY(this.cellArray[0]) + 1
        }

        if(breaks.doesWrap) {
            // WRAPPING
            this.wrapping = true
            // top right bottom left
            this.wrappingRectangles = {
                top: [],
                bottom: [],
                left: [],
                right: []
            }
            let widthOfFirst = this.width
            let firstXOfSecond = 0
            if(breaks.columns) {
                const start = this.pos.x
                const lastOfFirstRectangle = getX(breaks.columns.from)
                firstXOfSecond = getX(breaks.columns.to)
                widthOfFirst = lastOfFirstRectangle - start + 1
            }
            let heightOfFirst = this.height
            let firstYOfSecond = 0
            if(breaks.rows) {
                const start = this.pos.y
                const lastOfFirstRectangle = getY(breaks.rows.from)
                firstYOfSecond = getY(breaks.rows.to)
                heightOfFirst = lastOfFirstRectangle - start + 1
            }
            for(const cell of this.cellArray) {
                const x = getX(cell)
                const y = getY(cell)
                if(firstXOfSecond !== 0 && x >= this.pos.x) {
                    if(x < widthOfFirst) {
                        this.wrappingRectangles.left.push(cell)
                    }
                    if(x >= firstXOfSecond) {
                        this.wrappingRectangles.right.push(cell)
                    }
                }
                if(firstYOfSecond !== 0 && y >= this.pos.y) {
                    if(y < heightOfFirst) {
                        this.wrappingRectangles.top.push(cell)
                    }
                    if(y >= firstYOfSecond) {
                        this.wrappingRectangles.bottom.push(cell)
                    }
                }
            }
        }
    }

    /** Check if 2D coordinates are inside this rectangle.
     * @param {number} x
     * @param {number} y
     */
    checkIfInBounds(x, y) {
        return (
            x >= this.pos.x && x < this.pos.x + this.width &&
            y >= this.pos.y && y < this.pos.y + this.height
        )
    }

    * [Symbol.iterator]() {
        for (const cellNumber of this.cellArray) {
            yield cellNumber
        }
    }
}

/**
 * @property {Colors} colors
 * @property {number} rowLength
 * @property {Set.<string>} usedColors
 * @property {Array.<Rectangle>} rectangles
 * @property {Object.<number, {rect: Rectangle, i:number}[]>} map
 * @property {boolean} isTautology
 * @property {boolean} isContradiction
 */
export class Rectangles {
    /**
     * @param {Object} obj
     * @param {number[][]} obj.rectangles
     */
    constructor({rectangles: arrays, rowLength, columnHeight}) {
        this.rowLength = rowLength
        this.colors = new Colors()
        /** @type {Array.<number|null>}*/
        let allCells = new Array(rowLength*columnHeight).fill(0).map((_, i) => i)
        this.rectangles = arrays.map(r => {
            r.forEach(c => {
                allCells[c] = null
            })
            return new Rectangle(r, this.colors.getRandom(), rowLength)
        })
        allCells = allCells.filter(c => c !== null)
        this.map = this.generateMap()
        this.isTautology = allCells.length === 0
        this.isContradiction = arrays.length === 0
    }

    /**
     * Create mapping from cell number to Rectangle.
     * Rectangles sorted from smallest to largest, so that the top most are
     * the ones with least cells.
     *
     * @return {Object.<int, {rect: Rectangle, i:number}[]>}
     */
    generateMap() {
        /** @type {Object.<int, {rect: Rectangle, i:number}[]>}*/
        let map = {}
        this.rectangles.forEach((rect, i) => {
            for (const cell of rect) {
                if (!map[cell]) {
                    map[cell] = [{rect, i}]
                } else {
                    map[cell].push({rect, i})
                }
            }
        })
        for (const key of Object.keys(map)) {
            // the less cells the higher the cell should be
            map[key] = map[key].sort(
                (rect1, rect2) =>
                    rect1.rect.cellArray.length - rect2.rect.cellArray.length
            )
        }
        return map
    }


    get(row, column, {all = false} = {}) {
        const index = row * this.rowLength + column
        if (this.map[index]) {
            if (all) {
                return this.map[index]
            } else {
                return this.map[index][0]
            }
        }
    }
}

class Colors {
    usedColors = new Set();

    names = {
        lightblue: "rgb(173,216,230)",
        aqua: "rgb(65,180,180)",
        blue: "rgb(0,0,255)",
        darkcyan: "rgb(0,139,139)",
        darkgreen: "rgb(0,100,0)",
        green: "rgb(0,128,0)",
        darkkhaki: "rgb(189,183,107)",
        khaki: "rgb(240,230,140)",
        yellow: "rgb(154,154,12)",
        lime: "rgb(0,255,0)",
        gold: "rgb(255,215,0)",
        red: "rgb(255,0,0)",
        darkred: "rgb(139,0,0)",
        brown: "rgb(165,58,42)",
        darkorange: "rgb(255,140,0)",
        orange: "rgb(255,165,0)",
        pink: "rgb(255,192,203)",
        darkviolet: "rgb(148,0,211)",
        fuchsia: "rgb(255,0,255)",
        purple: "rgb(128,0,128)",
        darkmagenta: "rgb(139,0,139)",
        black: "rgb(0,0,0)",
        gray: "rgb(100, 100, 100)",
    };

    getRandom() {
        // names of all colors
        const colors = Object.keys(this.names)

        // generate possibly repeated random number
        const firstRandomColorNumber = Math.floor(Math.random() * colors.length)

        // assign to new variable to be able to check if all colors exhausted
        let randomColorNumber = firstRandomColorNumber

        // while this color is repeated, do
        while (this.usedColors.has(colors[randomColorNumber])) {
            // Try other color, sorted by similarity so should be different
            randomColorNumber += Math.floor(colors.length / 2) - 1
            // Make sure it's not larger than available colors
            randomColorNumber %= colors.length
            if (randomColorNumber === firstRandomColorNumber) {
                // Exhausted all possibilities, tried all colors
                console.warn("Reusing old colors")
                this.usedColors = new Set()
            }
        }
        const newColorName = colors[randomColorNumber]
        this.usedColors.add(newColorName)
        const newColor = this.names[newColorName]
        if (!newColor) {
            debugger;
        }
        return newColor;
    }
}
