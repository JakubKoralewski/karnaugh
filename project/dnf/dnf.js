/**
 * @param {Array.<Array.<number>>} rowGrayCode
 * @param {Array.<Array.<number>>} columnGrayCode
 * @param {Array.<string>} rowHeaders
 * @param {Array.<string>} columnHeaders
 */
function getLength(rowHeaders, columnHeaders, rowGrayCode, columnGrayCode) {
    return {
        rowVarCount: rowHeaders.length,
        colVarCount: columnHeaders.length,
        rowCount: rowGrayCode.length,
        colCount: columnGrayCode.length,
    }
}

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
    let {rowVarCount, colVarCount, rowCount, colCount} = getLength(rowHeaders, columnHeaders, rowGrayCode, columnGrayCode)
    const generateVars = (varCount, count, otherCount, headers, code) => {
        const newVars = []
        for (let i = 0; i < varCount; i++) {
            const newVar = {
                variable: headers[i],
                cells: []
            }
            for (let j = 0; j < count; j++) {
                if (code[j][i] === 1) {
                    for (let k = 0; k < otherCount; k++) {
                        newVar.cells.push(get1DCellNumber(j, k, otherCount));
                    }
                }
            }
            newVars.push(newVar)
        }
        return newVars
    }
    return [
        // Push row headers and the table cells on which their values are true to an array
        ...generateVars(rowVarCount, rowCount, colCount, rowHeaders, rowGrayCode),
        // Push column headers and the table cells on which their values are true to the array
        ...generateVars(colVarCount, colCount, rowCount, columnHeaders, columnGrayCode)
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
            let len = values.length; // The total number of cells in the karnaugh map
            let start = base;
            let secondStart = base;
            let n = 1;
            let s = 1; // The number of rows to be checked
            let allTrue = true;
            let tempCount = 1;
            let tempArray = [];
            let isExec = false;


            while (right || down) {
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
                        temporary = [];
                        for (let i = 0; i < rect.length; i++) {
                            temporary[i] = rect[i];
                        }
                    } else {
                        // rect = temporary;
                        rightCount = tempCount;
                    }
                    start += n;
                    n *= 2;
                }

                n = rightCount; // The number of columns that are true
                tempArray = []; // The indexes of cells that are true will be pushed to this array
                allTrue = 1;

                if (!right && isExec) {
                    s *= 2;
                    secondStart = get1DCellNumber(s, base, colCount);
                } else {
                    secondStart = get1DCellNumber(s, base, colCount) + downCount;
                }

                if (down) {
                    isExec = true
                    let lastCell = 0;
                    if (rightCount > downCount) {
                        lastCell = secondStart + (rightCount - downCount);
                    } else {
                        lastCell = secondStart + (s * colCount);
                    }
                    if (lastCell <= len) {
                        for (let i = 0; i < s; i++) {
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
                        temporary = [];
                        for (let i = 0; i < rect.length; i++) {
                            temporary[i] = rect[i];
                        }
                    } else if (down) {
                        rect = [];
                        for (let i = 0; i < temporary.length; i++) {
                            rect[i] = temporary[i];
                        }
                        secondStart = downCount + get1DCellNumber(s, base, colCount);
                    }
                }
                base++;

                // If a rectangle is generated it is pushed to an array named rectangles in which all
                // the rectangles are stored.
                rectangles.push(rect.sort((a, b) => a - b));
                rect = [];
            }
        }
        base++;
    }
    // Remove rectangles that are subsets of other rectangles
    for (let i = 0; i < rectangles.length; i++) {
        for (let j = 0; j < rectangles.length; j++) {
            let isIncluded = 1;
            if (j !== i && rectangles[i].length < rectangles[j].length) {
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

/**
 * Description: This function takes rectangles as an input and generate a disjunctive normal form.
 * @param {Object} obj
 * @param {Array.<Array.<number>>} obj.rectangles
 * @param {Array.<string>} obj.rowHeaders
 * @param {Array.<string>} obj.columnHeaders
 * @param {Array.<Array.<number>>} obj.rowGrayCode
 * @param {Array.<Array.<number>>} obj.columnGrayCode
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
    let dnf = "";
    let result = "";

    rectangles.forEach((rectangle, k) => {
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
        result = Array.from(dependentVars).join(" & ");
        dependentVars.clear();
        if (k === 0) {
            dnf = dnf.concat(`(${result})`);
        } else {
            dnf = dnf.concat(` || (${result})`);
        }

    })
    return dnf;
}

// https://stackoverflow.com/questions/54116070/how-to-unit-test-non-exported-functions
export const testables = {
    _getRectangles
}
