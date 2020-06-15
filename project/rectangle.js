import {intersection} from "lodash"

/** @property {number} rowLength
 *  @property {number[]} cellArray
 *  @property {string} color
 *  @property {{x: number, y:number}} pos
 *  @property {number} index
 */
class AbstractRectangle {
    getX(cell) {
        return (cell % this.rowLength)
    }

    getY(cell) {
        return Math.floor(cell / this.rowLength)
    }

    generatePosition(firstElem) {
        return {
            x: this.getX(firstElem),
            y: this.getY(firstElem)
        }
    }

    constructor({rowLength, cellArray, color}) {
        this.rowLength = rowLength
        this.cellArray = cellArray
        this.color = color

        /** @description Starting from 0, left-top */
        this.pos = this.generatePosition(this.cellArray[0])
    }

    * [Symbol.iterator]() {
        for (const cellNumber of this.cellArray) {
            yield cellNumber
        }
    }

    withIndex(index) {
        this.index = index
        return this
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

    /** @returns {{width: number, height: number}} */
    generateDimensions(array) {
        let lastPos = array[array.length -1]

        const width = this.getX(lastPos) - this.getX(array[0]) + 1
        const height = this.getY(lastPos) - this.getY(array[0]) + 1

        return {width, height}
    }
}

/** @typedef {("left"|"right"|"top"|"bottom")[]} Edges */

/** @property {Rectangle} parent
 *  @property {Edges} invisibleEdges - top, right, bottom, left
 *  @property {number} width
 *  @property {number} height
 */
class WrappingRectangle extends AbstractRectangle {
    /** @param {Object} obj
     *  @param {number[]} obj.rectangles
     *  @param {Edges} obj.invisibleEdges
     *  @param {Rectangle | AbstractRectangle} parent
     */
    constructor({rectangles, invisibleEdges, parent}) {
        super({rowLength: parent.rowLength, cellArray: rectangles, color: parent.color});
        this.parent = parent

        this.invisibleEdges = invisibleEdges
        const dims = this.generateDimensions(this.cellArray)
        this.width = dims.width
        this.height = dims.height
    }
}


/**
 * @property {string} color
 * @property {{x: number, y: number}} pos - the position
 * @property {number} width
 * @property {number} height
 */
export class Rectangle extends AbstractRectangle {
    /**
     * @param {Array.<number>} array
     * @param {string} color
     * @param {number} rowLength
     */
    constructor(array, color, rowLength) {
        super({rowLength, cellArray: array, color})
        this.wrapping = false

        let lastPos = this.cellArray[0]
        let breaks = {
            doesWrap: false,
            columns: undefined,
            rows: undefined,
        }
        for (const cell of this.cellArray.slice(1)) {
            if (((cell - 1) % rowLength) !== (lastPos % rowLength)) {
                // cells change rows without spanning whole width, or skip columns
                const lastPosX = this.getX(lastPos)
                const currentPosX = this.getX(cell)
                this.width = lastPosX - currentPosX + 1
                if(lastPosX !== currentPosX) {
                    breaks.columns = {to: cell, from: lastPos}
                    breaks.doesWrap = true
                }
                if (
                    // with width not full rows
                    // skip row
                    this.width > 0 &&
                    ((cell - 1) % this.width) !== (lastPos % this.width)
                ) {
                    breaks.rows = {to: cell, from: lastPos}
                }
            }
            if (
                // row gaps
                this.getY(cell - 1) !== this.getY(lastPos) &&
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
            this.width = this.getX(lastPos) - this.getX(this.cellArray[0]) + 1
            this.height = this.getY(lastPos) - this.getY(this.cellArray[0]) + 1
        } else {
            // Width was found with a break, meaning more than one row of rectangle
            this.height = this.getY(this.cellArray[this.cellArray.length - 1]) - this.getY(this.cellArray[0]) + 1
        }

        if (breaks.doesWrap) {
            // WRAPPING
            this.wrapping = true
            // top right bottom left
            const wrappingRectangles = {
                top: [],
                right: [],
                bottom: [],
                left: []
            }
            let widthOfFirst = this.width
            let firstXOfSecond = 0
            if (breaks.columns) {
                const start = this.pos.x
                const lastOfFirstRectangle = this.getX(breaks.columns.from)
                firstXOfSecond = this.getX(breaks.columns.to)
                widthOfFirst = lastOfFirstRectangle - start + 1
            }
            let heightOfFirst = this.height
            let firstYOfSecond = 0
            if (breaks.rows) {
                const start = this.pos.y
                const lastOfFirstRectangle = this.getY(breaks.rows.from)
                firstYOfSecond = this.getY(breaks.rows.to)
                heightOfFirst = lastOfFirstRectangle - start + 1
            }
            for (const cell of this.cellArray) {
                const x = this.getX(cell)
                const y = this.getY(cell)
                if (firstXOfSecond !== 0 && x >= this.pos.x) {
                    if (x < widthOfFirst) {
                        wrappingRectangles.left.push(cell)
                    }
                    if (x >= firstXOfSecond) {
                        wrappingRectangles.right.push(cell)
                    }
                }
                if (firstYOfSecond !== 0 && y >= this.pos.y) {
                    if (y < heightOfFirst) {
                        wrappingRectangles.top.push(cell)
                    }
                    if (y >= firstYOfSecond) {
                        wrappingRectangles.bottom.push(cell)
                    }
                }
            }
            this._wrappingRectangles = wrappingRectangles
            this.wrappingRectangles = this._generateWrappedRectangles(wrappingRectangles)
        }

    }

    _generateWrappedRectangles(rects) {
        if (this.wrapping === false) {
            console.error("this.wrapping is false!")
            return undefined
        }

        const combinations = [
            ["top", "left"],
            ["top", "right"],
            ["bottom", "left"],
            ["bottom", "right"],
            ["left"],
            ["right"],
            ["bottom"],
            ["top"]
        ]
        let foundSomeDiagonal = false
        const splitRectangles = combinations.reduce(
            /** @param {WrappingRectangle[]} acc
             *  @param {string[]} comb */
            (acc, comb, i) => {
                if (!comb.every(c => rects[c].length > 0)) {
                    return acc
                }
                if (i <= 3) {
                    foundSomeDiagonal = true
                }
                if (acc.length > 0 && i > 3 && foundSomeDiagonal) {
                    // If any diagonal were found, skip the normal ones
                    return acc
                }
                // Set of cells for that combination
                const cells = intersection(...comb.map(x => rects[x]))
                if (cells.length > 0) {
                    // The inverse of the combination is the edges of that new rectangle
                    acc.push(
                        new WrappingRectangle({
                            rectangles: Array.from(cells),
                            invisibleEdges: comb,
                            parent: this
                        })
                    )
                }
                return acc
            }, /** @type {(WrappingRectangle|AbstractRectangle)[]}*/[])
        splitRectangles.sort(
            (rect1, rect2) =>
                (rect2.pos.x + rect2.pos.y) - rect1.pos.x + rect1.pos.y
        )
        return splitRectangles
    }
}

/**
 * @property {Colors} colors
 * @property {number} rowLength
 * @property {Set.<string>} usedColors
 * @property {(Rectangle|WrappingRectangle)[]} rectangles
 * @property {Rectangle[]} _rectangles
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
        /** @type {Array.<number|null>} for contradiction detection */
        let allCells = new Array(rowLength * columnHeight).fill(0).map((_, i) => i)

        /** @type {any} - Raw rectangles without nesting of wrapped rectangles */
        this._rectangles = arrays.map(r => {
            r.forEach(c => {
                allCells[c] = null
            })
            return new Rectangle(r, this.colors.getRandom(), rowLength)
        })

        /** @type {(Rectangle|WrappingRectangle)[]} - not nested*/
        let index = 0
        this.rectangles = this._rectangles.flatMap(
            (rect,i) => {
                if(rect.wrapping) {
                    rect.wrappingRectangles = rect.wrappingRectangles.map(r => r.withIndex(index++))
                    return rect.wrappingRectangles
                } else {
                    this._rectangles[i].index = index++
                    return this._rectangles[i]
                }
            }
        )

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
     * @return {Object.<int, Rectangle[]>}
     */
    generateMap() {
        /** @type {Object.<int, Rectangle[]>}*/
        let map = {}
        this.rectangles.forEach(rect => {
            for (const cell of rect) {
                if (!map[cell]) {
                    map[cell] = [rect]
                } else {
                    map[cell].push(rect)
                }
            }
        })
        for (const key of Object.keys(map)) {
            // the less cells the higher the cell should be
            map[key] = map[key].sort(
                (rect1, rect2) =>
                    rect1.cellArray.length - rect2.cellArray.length
            )
        }
        return map
    }

    /** @returns {Rectangle|Rectangle[]}*/
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
