function get1DCellNumber(row, column, numColumns) {
    return (row * numColumns) + column
}

/**
 * Description: This function gets necessary data from karnaugh map
 * Input: Properties from the karnaugh map
 * Output: Necessary information to generate rectangles and disjunctive normal form
 *
 * @param {Object} obj
 * @param {Array.<Array.<number>>} obj.rowGrayCode
 * @param {Array.<Array.<number>>} obj.columnGrayCode
 * @param {Array.<string>} obj.rowHeaders
 * @param {Array.<string>} obj.columnHeaders
 * @return {Array.<{variable: string, cells: Array.<number>}>}
 */
function getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    /** Generate an array of cells that are true for each given variable.
     * @returns {{cells: number[], variable: string}[]}
     *
     * @param {number} otherCount - number of gray codes for other(row/column)
     * @param {string[]} headers - array of variables, corresponding to each gray code element
     * @param {number[][]} code - gray code for that row/column
     * @param {boolean} row - whether is row
     */
    const generateVars = (otherCount, headers, code, row) => {
        const newVars = []
        for (let varIndex = 0; varIndex < headers.length; varIndex++) {
            const newVar = {
                variable: headers[varIndex],
                cells: []
            }
            for (let gcIndex = 0; gcIndex < code.length; gcIndex++) {
                if (code[gcIndex][varIndex] === 1) {
                    if (row) {
                        for (let columnIndex = 0; columnIndex < otherCount; columnIndex++) {
                            // For row gray code index is row, columnIndex, column count is otherCount(columns)
                            newVar.cells.push(get1DCellNumber(gcIndex, columnIndex, otherCount));
                        }
                    } else {
                        for (let rowIndex = 0; rowIndex < otherCount; rowIndex++) {
                            // For column gray code rowIndex is row, gray code is column, and columns is length of gray code
                            newVar.cells.push(get1DCellNumber(rowIndex, gcIndex, code.length));
                        }
                    }
                }
            }
            newVars.push(newVar)
        }
        return newVars
    }
    return [
        // Push row headers and the table cells on which their values are true to an array
        ...generateVars(columnGrayCode.length, rowHeaders, rowGrayCode, true),
        // Push column headers and the table cells on which their values are true to the array
        ...generateVars(rowGrayCode.length, columnHeaders, columnGrayCode, false)
    ]
}

/**
 * @param {Object} obj
 * @param {Array.<boolean>} obj.values
 * @param {number} obj.colCount
 */
function _getRectangles({values, colCount}) {
    let base = 0;
    const rectangles = [];
    let looped = false;
    let len = values.length; // The total number of cells in the Karnaugh map

    while (base < values.length) {
        while (values[base]) {
            let right = true;
            let down = true;
            let temporary = [base];
            let rect = [base];
            let rightCount = 1;
            let downCount = 0;
            let start = base;
            let secondStart = base;
            let n = 1;
            let s = 1; // The number of rows to be checked
            let tempCount = 1;
            let tempArray = [];
            let isExec = false;
            if (looped) {
                right = false;
                down = true;
            }

            while (right || down) {
                let allTrue = true;
                if (right) {
                    if (
                        Math.floor(start / colCount) === Math.floor((start + n) / colCount)
                        && (start + n < len)
                    ) {

                        // Check if the n number of columns rightward are true
                        for (let i = 1; i <= n; i++) {
                            if (values[start + i]) {
                                tempArray.push(start + i);
                                tempCount++;
                            } else {
                                allTrue = false;
                                right = false;
                                break;
                            }
                        }
                        // If n number of columns are true then push them into a temporary array other
                        if (allTrue) {
                            temporary.push(...tempArray);
                            tempArray = [];
                        }
                    } else {
                        right = false;
                    }
                    if (!right) {
                        temporary = rect.slice(0)
                    } else {
                        // rect = temporary;
                        rightCount = tempCount;
                    }
                    start += n;
                    n *= 2;
                }

                n = rightCount; // The number of columns that are true
                tempArray = []; // The indexes of cells that are true will be pushed to this array
                allTrue = true;

                if (down) {
                    if (!right && isExec) {
                        s *= 2;
                    } else {
                        secondStart = get1DCellNumber(s, base, colCount) + downCount;
                    }
                    isExec = true
                    let lastCell = 0;
                    if (rightCount > downCount) {
                        lastCell = secondStart + (rightCount - downCount);
                    } else {
                        lastCell = secondStart + (s * colCount);
                    }
                    if (!right && isExec) {
                        secondStart = get1DCellNumber(s, base, colCount);
                    }
                    if (lastCell <= len) {
                        for (let i = 1; i <= s; i++) {
                            let first = secondStart + ((i - 1) * colCount);
                            let last = lastCell - ((s - i) * colCount);
                            if (last > first + rightCount) {
                                last = first + rightCount;
                            }
                            for (let j = first; j < last; j++) {
                                if (values[j]) {
                                    tempArray.push(j);
                                    downCount++;
                                } else {
                                    allTrue = false;
                                    down = false;
                                    break;
                                }
                            }
                        }
                        if (allTrue) {
                            temporary.push(...tempArray);
                            tempArray = [];
                        }
                    } else {
                        down = false;
                    }
                    if (!down && downCount > 0) {
                        temporary = rect.slice(0)
                    } else if (down) {
                        rect = temporary.slice(0)
                        secondStart = downCount + get1DCellNumber(s, base, colCount);
                    }
                }
                if (downCount === 0 && right && rightCount > 1) {
                    rect = temporary.slice(0)
                }
            }

            // If a rectangle is generated it is pushed to an array named rectangles in which all
            // the rectangles are stored.
            rectangles.push(rect.sort((a, b) => a - b));
            rect = [];

            if (looped) {
                base++;
            }
            if (!looped) {
                looped = true;
            } else {
                looped = false;
            }
        }
        base++;
    }

    // Remove rectangles that are subsets of other rectangles
    for (let i = 0; i < rectangles.length; i++) {
        for (let j = 0; j < rectangles.length; j++) {
            let isIncluded = 1;
            if (j !== i && rectangles[i].length <= rectangles[j].length) {
                for (let k = 0; k < rectangles[i].length; k++) {
                    if (rectangles[j].indexOf(rectangles[i][k]) === -1) {
                        isIncluded = 0;
                        break;
                    }
                }
                if (isIncluded === 1) {
                    rectangles.splice(i, 1);
                    i--;
                    break;
                }
            }
        }
    }

    let rowCount = len / colCount;
    let rowEdges = [];
    let possibleRectangles = [];
    for (let i = 0; i < rowCount; i++) {
        rowEdges.push((colCount * i) + colCount - 1);
    }
    for (let i = 0; i < rectangles.length; i++) {
        possibleRectangles[i] = [];
        for (let j = 0; j < rectangles[i].length; j++) {
            if (rowEdges.includes(rectangles[i][j])) {
                let rowCellCount = 1;
                let colCellCount = 1;
                for (let k = 1; k < colCount; k++) {
                    if (rectangles[i].includes(rectangles[i][j] - k)) {
                        rowCellCount++;
                    } else {
                        break;
                    }
                }
                colCellCount = rectangles[i].length / rowCellCount;
                for (let k = 0; k < colCellCount; k++) {
                    for (let l = 0; l < rowCellCount; l++) {
                        possibleRectangles[i].push((rectangles[i][j] + (k * colCount) - colCount) + 1 + l);
                    }
                }
            }
            break;
        }
        possibleRectangles[i] = possibleRectangles[i].sort((a, b) => a - b);
    }

    for (let i = 0; i < rectangles.length; i++) {
        if (possibleRectangles[i].length > 0) {
            possibleRectangles[i] = possibleRectangles[i].sort((a, b) => a - b);
            for (let j = 0; j < i; j++) {
                let matches = 0;
                if (rectangles[j].length === possibleRectangles[i].length) {
                    for (let k = 0; k < rectangles[j].length; k++) {
                        if (possibleRectangles[i][k] === rectangles[j][k]) {
                            matches++;
                        } else {
                            matches = -1;
                        }
                    }
                    if (matches === rectangles[j].length) {
                        for (let k = 0; k < rectangles[j].length; k++) {
                            rectangles[i].push(rectangles[j][k]);
                        }
                        rectangles[i] = rectangles[i].sort((a, b) => a - b);
                        rectangles.splice(j, 1);
                        break;
                    }
                    matches = 0;
                }
            }
        }
    }

    let colEdges = [];
    let reverseRectangles = [];
    for (let i = 0; i < colCount; i++) {
        colEdges.push(len - colCount + i);
    }
    for (let i = 0; i < rectangles.length; i++) {
        reverseRectangles[i] = [];
        for (let j = 0; j < rectangles[i].length; j++) {
            if (colEdges.includes(rectangles[i][j])) {
                let rowCellCount = 1;
                let colCellCount = 1;
                for (let k = 1; k < rowCount; k++) {
                    if (rectangles[i].includes(rectangles[i][j] - (k * colCount))) {
                        colCellCount++;
                    } else {
                        break;
                    }
                }
                rowCellCount = rectangles[i].length / rowCellCount;
                for (let k = 0; k < rowCellCount; k++) {
                    for (let l = 0; l < colCellCount; l++) {
                        reverseRectangles[i].push((rectangles[i][j] - ((rowCount - 1) * colCount)) + k + (l * colCount));
                    }
                }
            }
            break;
        }
        reverseRectangles[i] = reverseRectangles[i].sort((a, b) => a - b);
    }

    for (let i = 0; i < rectangles.length; i++) {
        if (reverseRectangles[i].length > 0) {
            reverseRectangles[i] = reverseRectangles[i].sort((a, b) => a - b);
            for (let j = 0; j < i; j++) {
                let matches = 0;
                if (rectangles[j].length === reverseRectangles[i].length) {
                    for (let k = 0; k < rectangles[j].length; k++) {
                        if (reverseRectangles[i][k] === rectangles[j][k]) {
                            matches++;
                        } else {
                            matches = -1;
                        }
                    }
                    if (matches === rectangles[j].length) {
                        for (let k = 0; k < rectangles[j].length; k++) {
                            rectangles[i].push(rectangles[j][k]);
                        }
                        rectangles[i] = rectangles[i].sort((a, b) => a - b);
                        rectangles.splice(j, 1);
                        break;
                    }
                    matches = 0;
                }
            }
        }
    }
    return rectangles;
}

/**
 * Generate all the rectangles of a given Karnaugh map
 * Input: Karnaugh map row and column headers, gray code, all true and false values
 * Output: All the rectangles in a given Karnaugh map
 *
 * @param {Object} obj
 * @param {Object.<string, Object.<string, boolean>>} obj.transformedTable
 * @param {Array.<Array.<number>>} obj.rowGrayCode
 * @param {Array.<Array.<number>>} obj.columnGrayCode
 * @return {Array.<Array.<number>>}
 */
export function getRectangles(
    {
        transformedTable,
        rowGrayCode,
        columnGrayCode
    }
) {
    const colCount = columnGrayCode.length
    /** @return {Array.<boolean>}*/
    const getValues = () => {
        const values = []
        let cell = 0;
        for (let rowCode of rowGrayCode) {
            for (let columnCode of columnGrayCode) {
                values[cell] = transformedTable[rowCode.join('')][columnCode.join('')]
                cell++;
            }
        }
        return values
    }
    const values = getValues()
    return _getRectangles({values, colCount})
}

/** Intermediate DNF representation used to be able to group together
 *  blocks of variables with corresponding rectangles for
 *  hovering applications.
 */
export class DNFIntermediate {
    /**
     * @typedef {
     *      {
     *          variables: number[],
     *          rectangleIndex: number,
     *          text: string
     *      }
     * } DNFBlock
     */
    constructor() {
        /** @type {DNFBlock[]} */
        this.blocks = []
        this.isFirstBlock = true
        this.finalDNF = ""
    }

    /** @param {DNFBlock} block */
    add(block) {
        if(block.variables.length === 0) {
            console.log(`Empty DNF. Ignoring. Rectangle: ${block.rectangleIndex}.`)
            return
        }
        let blockJoined = block.variables.join(" & ")
        if(block.variables.length > 1) {
            // Don't add parentheses when only single variable
            blockJoined = `(${blockJoined})`
        }
        this.blocks.push({
            text: blockJoined,
            ...block
        })
    }
}

/**
 * Description: This function takes rectangles as an input and generate a disjunctive normal form.
 * @param {Object} obj
 * @param {Array.<Array.<number>>} obj.rectangles
 * @param {Array.<string>} obj.rowHeaders
 * @param {Array.<string>} obj.columnHeaders
 * @param {Array.<Array.<number>>} obj.rowGrayCode
 * @param {Array.<Array.<number>>} obj.columnGrayCode
 *
 * @returns {DNFIntermediate}
 */
export function getDnf(
    {
        rectangles,
        rowHeaders,
        columnHeaders,
        rowGrayCode,
        columnGrayCode
    }
) {
    let vars = getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode});
    const dependentVars = new Set();
    // final dnf return
    let dnf = new DNFIntermediate();

    rectangles.forEach((rectangle, r) => {
        vars.forEach(variable => {
            let count = 0;
            for (const cell of rectangle) {
                if (variable.cells.includes(cell)) {
                    count++;
                }
            }
            if (rectangle.length === count) {
                dependentVars.add(variable.variable)
            } else if (count === 0) {
                dependentVars.add(`~${variable.variable}`)
            }
        })
        dnf.add(
            {
                variables: Array.from(dependentVars),
                rectangleIndex: r
            }
        )
        dependentVars.clear();

    })
    return dnf;
}

// https://stackoverflow.com/questions/54116070/how-to-unit-test-non-exported-functions
export const testables = {
    _getRectangles
}
