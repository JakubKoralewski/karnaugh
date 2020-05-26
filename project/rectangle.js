export class Rectangle {
    constructor(array) {
        this.cellArray = array
        this.color = null
    }

    assignColor(color) {
        this.color = color
    }

    * [Symbol.iterator]() {
        for (const cellNumber of this.cellArray) {
            yield cellNumber
        }
    }
}

export class Rectangles {
    constructor({rectangles: arrays, rowLength}) {
        this.rowLength = rowLength
        this.colors = new Colors()
        this.color = ''
        this.usedColors = new Set()
        this.rectangles = arrays.map(r => new Rectangle(r))
        this.assignColors()
        this.map = this.generateMap()
    }

    assignColors() {
        for (const rect of this.rectangles) {
            rect.assignColor(this.colors.getRandom())
        }
    }

    /**
     * Create mapping from cell number to Rectangle
     * @return {Object.<int, Rectangle>}
     */
    generateMap() {
        const map = {}
        for (const rect of this.rectangles) {
            for (const cell of rect) {
                map[cell] = rect
            }
        }
        return map
    }


    get(row, column) {
        const index = row * this.rowLength + column
        return this.map[index]
    }
}

class Colors {
    usedColors = new Set();

    names = {
        aqua: "#00ffff",
        blue: "#0000ff",
        brown: "#a52a2a",
        darkcyan: "#008b8b",
        darkgreen: "#006400",
        darkkhaki: "#bdb76b",
        darkmagenta: "#8b008b",
        darkolivegreen: "#556b2f",
        darkorange: "#ff8c00",
        darkred: "#8b0000",
        darksalmon: "#e9967a",
        darkviolet: "#9400d3",
        fuchsia: "#ff00ff",
        gold: "#ffd700",
        green: "#008000",
        khaki: "#f0e68c",
        lightblue: "#add8e6",
        lightpink: "#ffb6c1",
        lime: "#00ff00",
        olive: "#808000",
        orange: "#ffa500",
        pink: "#ffc0cb",
        purple: "#800080",
        red: "#ff0000",
        yellow: "#ffff00"
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
