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
            let temporary = [];
            temporary.push(base);
            let rect = [];
            rect.push(base);
            let rightCount = 1;
            let downCount = 0;
            let start = base;
            let secondStart = base;
            let n = 1;
            let s = 1; // The number of rows to be checked
            let tempCount = 1;
            let tempArray = [];
            let isExec = false;
            let allTrue = true;
            if (looped) {
                right = false;
                down = true;
            }

            while (right || down) {
                allTrue = true;
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
                    if (!right && isExec) {
                        secondStart = get1DCellNumber(s, base, colCount);
                    }
                    isExec = true
                    let lastCell = 0;
                    if (rightCount > downCount) {
                        lastCell = secondStart + (rightCount - downCount);
                    } else {
                        lastCell = secondStart + (s * colCount);
                    }

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

            if (looped) {
                // Add true values rightwards to rect in second loop
                allTrue = true;
                tempArray = [];
                temporary = [];
                let startNumber = 1;
                let stopNumber = 2;
                while (allTrue && stopNumber <= colCount) {
                    for (let i = 0; i < rect.length; i++) {
                        for (let j = startNumber; j < stopNumber; j++) {
                            if (values[rect[i] + j] && Math.floor(rect[i] + j / colCount) === Math.floor(rect[i] / colCount) && (rect[i] + j < len)) {
                                tempArray.push(rect[i] + j);
                            } else {
                                allTrue = false;
                                break;
                            }
                        }
                    }
                    if (allTrue) {
                        temporary.push(...tempArray);
                        tempArray = [];
                    }
                    startNumber = stopNumber;
                    stopNumber *= 2;
                }
                rect.push(...temporary);
                base++;
                looped = false;
            } else {
                looped = true;
            }

            // If a rectangle is generated it is pushed to an array named rectangles in which all the rectangles are stored.
            rectangles.push(rect.sort((a, b) => a - b));
            rect = [];
        }
        base++;
    }

    // Remove rectangles that are subsets of other rectangles
    rectangles.sort((a, b) => a.length - b.length);
    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].sort((a, b) => a - b);
        let counter = 0;
        for (let j = 0; j < rectangles[i].length; j++) {
            for (let k = 0; k < rectangles.length; k++) {
                if (k !== i && rectangles[k].includes(rectangles[i][j])) {
                    counter++;
                    break;
                }
            }
        }
        if (counter === rectangles[i].length) {
            rectangles.splice(i, 1);
            i--;
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
                break;
            }
        }
        possibleRectangles[i] = possibleRectangles[i].sort((a, b) => a - b);
    }

    for (let i = 0; i < rectangles.length; i++) {
        if (possibleRectangles[i].length > 0) {
            possibleRectangles[i] = possibleRectangles[i].sort((a, b) => a - b);
            let allTrue = true;
            for (let j = 0; j < possibleRectangles[i].length; j++) {
                if (!values[possibleRectangles[i][j]]) {
                    allTrue = false;
                    break;
                }
            }
            if (allTrue) {
                for (let k = 0; k < possibleRectangles[i].length; k++) {
                    if (rectangles[i].includes(possibleRectangles[i][k])) {
                    } else {
                        rectangles[i].push(possibleRectangles[i][k]);
                    }
                }
                rectangles[i] = rectangles[i].sort((a, b) => a - b);
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
                rowCellCount = rectangles[i].length / colCellCount;
                for (let k = 1; k <= colCellCount; k++) {
                    for (let l = 0; l < rowCellCount; l++) {
                        reverseRectangles[i].push((rectangles[i][j] - ((rowCount - k) * colCount)) + l);
                    }
                }
                break;
            }
        }
        reverseRectangles[i] = reverseRectangles[i].sort((a, b) => a - b);
    }

    for (let i = 0; i < rectangles.length; i++) {
        if (reverseRectangles[i].length > 0) {
            reverseRectangles[i] = reverseRectangles[i].sort((a, b) => a - b);
            let allTrue = true;
            for (let j = 0; j < reverseRectangles[i].length; j++) {
                if (!values[reverseRectangles[i][j]]) {
                    allTrue = false;
                    break;
                }
            }
            if (allTrue) {
                for (let k = 0; k < reverseRectangles[i].length; k++) {
                    if (rectangles[i].includes(reverseRectangles[i][k])) {
                        break;
                    } else {
                        rectangles[i].push(reverseRectangles[i][k]);
                    }
                }
                rectangles[i] = rectangles[i].sort((a, b) => a - b);
            }
        }
    }

    let corners = [0, colCount - 1, len - colCount, len - 1];
    let trueCornerCells = [];
    let tempArr = [];
    let rowMax = [0, 0, 0, 0];
    let colMax = [0, 0, 0, 0];
    for (let i = 0; i < corners.length; i++) {
        let cellToCheck = corners[i];

        for (let k = 0; k < rowCount / 2; k++) {
            if (i === 0 || i === 2) {
                cellToCheck = corners[i] + k;
            } else {
                cellToCheck = corners[i] - k;
            }
            if (values[cellToCheck]) {
                rowMax[i]++;
            } else {
                break;
            }
        }

        for (let k = 0; k < colCount / 2; k++) {
            if (i === 0 || i === 1) {
                cellToCheck = corners[i] + (k * colCount);
            } else {
                cellToCheck = corners[i] - (k * colCount);
            }
            if (values[cellToCheck]) {
                colMax[i]++;
            } else {
                break;
            }
        }
    }

    rowMax = rowMax.sort((a, b) => a - b);
    colMax = colMax.sort((a, b) => a - b);

    let lengths = [rowMax[0], colMax[0]];
    for (let i = 0; i < 2; i++) {
        let allValTrue = true;
        tempArr[i] = [];
        for (let j = 0; j < corners.length; j++) {
            for (let k = 0; k < lengths[i]; k++) {
                let cellToAdd = 0;
                if (i === 0) {
                    if (j === 0 || j === 2) {
                        cellToAdd = corners[j] + k;
                    } else {
                        cellToAdd = corners[j] - k;
                    }
                } else if (i === 1) {
                    if (j === 0 || j === 1) {
                        cellToAdd = corners[j] + (k * colCount);
                    } else {
                        cellToAdd = corners[j] - (k * colCount);
                    }
                }
                if (values[cellToAdd]) {
                    tempArr[i].push(cellToAdd);
                } else {
                    allValTrue = false;
                    break;
                }
            }
        }
        if (allValTrue && tempArr[i].length > 0) {
            rectangles.push(tempArr[i]);
        }
    }
    if (rowMax[0] > 1 && colMax[1] > 0) {
        tempArr = [];
        let smaller = rowMax[0] < colMax[0] ? rowMax[0] : colMax[0];
        let cellToAdd = 0;
        for (let j = 0; j < corners.length; j++) {
            for (let k = 0; k < smaller; k++) {
                for (let l = 0; l < smaller; l++) {
                    if (j === 0) {
                        cellToAdd = corners[j] + (k * colCount) + l;
                    } else if (j === 1) {
                        cellToAdd = corners[j] + (k * colCount) - l;
                    } else if (j === 2) {
                        cellToAdd = corners[j] - (k * colCount) + l;
                    } else if (j === 3) {
                        cellToAdd = corners[j] - (k * colCount) - l;
                    }
                    if (values[cellToAdd]) {
                        tempArr.push(cellToAdd);
                    } else {
                        allValTrue = false;
                        break;
                    }
                }
            }
        }
        if (tempArr.length > 0) {
            rectangles.push(tempArr);
        }
    }

    // Remove rectangles that are subsets of other rectangles
    rectangles.sort((a, b) => a.length - b.length);
    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].sort((a, b) => a - b);
        let counter = 0;
        for (let j = 0; j < rectangles[i].length; j++) {
            for (let k = 0; k < rectangles.length; k++) {
                if (k !== i && rectangles[k].includes(rectangles[i][j])) {
                    counter++;
                    break;
                }
            }
        }
        if (counter === rectangles[i].length) {
            rectangles.splice(i, 1);
            i--;
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
