
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
        const getY = cell => Math.floor(cell / rowLength)
        const getX = cell => cell % rowLength

        this.color = color
        //FIXME: no need to sort
        //Possible when #17 is closed
        this.cellArray = array.sort((a, b) => a - b)
        this.pos = {x: getX(this.cellArray[0]), y: getY(this.cellArray[0])}
        let lastPos = this.cellArray[0]
        for (const cell of this.cellArray.slice(1)) {
            if(((cell - 1) % rowLength) !== (lastPos % rowLength)) {
                // cells change rows without spanning whole width
                this.width = getX(lastPos) - getX(cell) + 1
                break;
            }
            lastPos = cell
        }
        if(this.width === undefined) {
            // No break between cells in array
            this.width = this.cellArray[this.cellArray.length-1] - this.cellArray[0] + 1
            if(this.width > rowLength) {
                // If no breaks, because spans whole multiple rows
                this.width = rowLength
                this.height = getY(this.cellArray[this.cellArray.length-1]) - getY(this.cellArray[0]) + 1
            } else {
                this.height = 1
            }
        } else {
            // Width was found with a break, meaning more than one row of rectangle
            //FIXME
            this.height = getY(this.cellArray[this.cellArray.length-1]) - getY(this.cellArray[0]) + 1
        }
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
 * @property {Object.<number, Array.<Rectangle>>} map
 * */
export class Rectangles {
    constructor({rectangles: arrays, rowLength}) {
        this.rowLength = rowLength
        this.colors = new Colors()
        this.usedColors = new Set()
        this.rectangles = arrays.map(r => new Rectangle(r, this.colors.getRandom(), rowLength))
        this.map = this.generateMap()
    }

    /**
     * Create mapping from cell number to Rectangle.
     * Rectangles sorted from smallest to largest, so that the top most are
     * the ones with least cells.
     *
     * @return {Object.<int, Array.<Rectangle>>}
     */
    generateMap() {
        /** @type {Object.<int, Array.<Rectangle>>}*/
        let map = {}
        for (const rect of this.rectangles) {
            for (const cell of rect) {
                if(!map[cell]) {
                    map[cell] = [rect]
                } else {
                    map[cell].push(rect)
                }
            }
        }
        for(const key of Object.keys(map)) {
            // the less cells the higher the cell should be
            map[key] = map[key].sort((
                rect1, rect2) => rect1.cellArray.length - rect2.cellArray.length
            )
        }
        return map
    }


    get(row, column) {
        const index = row * this.rowLength + column
        if(this.map[index]) return this.map[index][0]
    }
}

class Colors {
    usedColors = new Set();

    names = {
        aqua: "rgb(65,180,180)",
        blue: "rgb(0,0,255)",
        brown: "rgb(165,58,42)",
        darkcyan: "rgb(0,139,139)",
        darkgreen: "rgb(0,100,0)",
        darkkhaki: "rgb(189,183,107)",
        darkmagenta: "rgb(139,0,139)",
        darkolivegreen: "rgb(85,107,47)",
        darkorange: "rgb(255,140,0)",
        darkred: "rgb(139,0,0)",
        darksalmon: "rgb(233,150,122)",
        darkviolet: "rgb(148,0,211)",
        fuchsia: "rgb(255,0,255)",
        gold: "rgb(255,215,0)",
        green: "rgb(0,128,0)",
        khaki: "rgb(240,230,140)",
        lightblue: "rgb(173,216,230)",
        lime: "rgb(0,255,0)",
        olive: "rgb(128,128,0)",
        orange: "rgb(255,165,0)",
        pink: "rgb(255,192,203)",
        purple: "rgb(128,0,128)",
        red: "rgb(255,0,0)",
        yellow: "rgb(255,255,0)"
    };

    getRandom() {
        const colors = Object.keys(this.names)
        const firstRandomColorNumber = Math.floor(Math.random() * colors.length)
        let randomColorNumber = firstRandomColorNumber
        while (this.usedColors.has(colors[randomColorNumber])) {
            randomColorNumber++
            randomColorNumber %= colors.length
            if (randomColorNumber === firstRandomColorNumber) {
                console.warn("Reusing old colors")
                this.usedColors = new Set()
            }
        }
        return this.names[colors[randomColorNumber]];
    }
}
