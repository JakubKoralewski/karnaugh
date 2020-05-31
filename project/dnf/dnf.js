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
        ...generateVars(rowVarCount, rowCount, colCount, rowHeaders, rowGrayCode),
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
    const done = [];
    const rectangles = [];

    while (base < values.length) {
        while (values[base] && !done.includes(base)) {
            let right = true;
            let down = true;
            let temporary = [];
            temporary.push(base);
            let rect = temporary;
            let rightCount = 1;
            let downCount = 0;
            let len = values.length;
            let start = base;
            let secondStart = base;
            let n = 1;
            let allTrue = true;
            let tempCount = 1;
            let tempArray = [];

            while (right) {
                if (Math.floor(start / colCount) === Math.floor((start + n) / colCount) && (start + n < len)) {
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
                    if (allTrue) {
                        temporary.push(...tempArray);
                        tempArray = [];
                    }
                } else {
                    right = false;
                }
                if (!right) {
                    temporary = rect;
                    break;
                } else {
                    rect = temporary;
                    rightCount = tempCount;
                }
                start += n;
                n *= 2;
            }

            n = rightCount;
            let s = 1;
            tempArray = [];

            while (down) {
                downCount = 0;
                if (secondStart + get1DCellNumber(s, n, colCount) <= len) {
                    for (let j = 0; j < rightCount; j++) {
                        for (let i = 1; i <= s; i++) {
                            if (values[secondStart + get1DCellNumber(i, j, colCount)]) {
                                tempArray.push(secondStart + get1DCellNumber(i, j, colCount));
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
                if (!down) {
                    temporary = rect;
                    break;
                } else {
                    if (downCount === rightCount * s) {
                        rect = temporary;
                        secondStart += (colCount * s);
                        s *= 2;
                    } else {
                        temporary = rect;
                        break;
                    }
                }
            }
            done.push(...rect)
            base++;

            if (rect.length > 0) {
                rectangles.push(rect.sort((a,b) => a - b));
                rect = [];
            }
        }
        base++;
    }
    return rectangles;
}

/**
 * @param {Object} obj
 * @param {Object.<string, Object.<string, boolean>>} obj.transformedTable
 * @param {Array.<Array.<number>>} obj.rowGrayCode
 * @param {Array.<Array.<number>>} obj.columnGrayCode
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
