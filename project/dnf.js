/**
 * Description: This function gets necessary data from karnaugh map
 * Input: Properties from the karnaugh map
 * Output: Necessary information to generate rectangles and disjunctive normal form
 */
function getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    let arr = [];
    let rowCount = rowHeaders.length; // Number of variables whose truth values are displayed in rows
    let colCount = columnHeaders.length; // Number of variables whose truth values are displayed in columns
    let row = rowGrayCode.length; // Number of rows in the karnaugh map
    let col = columnGrayCode.length; // Number of columns in the karnaugh map

    // Push row headers and the table cells on which their values are true to an array
    for (let i = 0; i < rowCount; i++) {
        arr[i] = [];
        arr[i].push(rowHeaders[i]);
        for (let j = 0; j < row; j++) {
            if (rowGrayCode[j][i] === 1) {
                for (let k = 0; k < col; k++) {
                    arr[i].push((j * col) + k);
                }
            }
        }
    }

    // Push column headers and the table cells on which their values are true to the array
    for (let i = 0; i < colCount; i++) {
        arr[rowCount + i] = [];
        arr[rowCount + i].push(columnHeaders[i]);
        for (let j = 0; j < col; j++) {
            if (columnGrayCode[j][i] === 1) {
                for (let k = 0; k < row; k++) {
                    arr[rowCount + i].push(j + (col * k));
                }
            }
        }
    }
    return {
        arr,
        col,
        row,
        colCount, rowCount
    }
}

/**
* Generate all the rectangles of a given karnaugh map
* Input: Karnaugh map row and column headers, gray code, all true and false values
* Output: All the rectangles in a given karnaugh map
 */
export function getRectangles({transformedTable, rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    let {colCount, rowCount, row, col} = getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode});
    let max = col * row;
    let values = [];
    let allValues = [];
    allValues[0] = [];
    allValues[1] = [];
    for (let keys in transformedTable) {
        for (let key in transformedTable[keys]) {
            allValues[0].push(keys.concat(key));
            if (transformedTable[keys][key] === true) {
                allValues[1].push(1);
            } else {
                allValues[1].push(0);
            }

        }
    }

    let value = [];
    let cell = 0;
    for (let i = 0; i < rowGrayCode.length; i++) {
        for (let j = 0; j < columnGrayCode.length; j++) {
            value[cell] = "";
            for (let k = 0; k < rowCount; k++) {
                value[cell] = value[cell].concat(rowGrayCode[i][k]);
            }
            for (let k = 0; k < colCount; k++) {
                value[cell] = value[cell].concat(columnGrayCode[j][k]);
            }
            let t = allValues[0].indexOf(value[cell]);
            values[cell] = allValues[1][t];
            cell++;
        }
    }

    let base = 0;
    let done = [];
    let result = "";
    let added = [];
    let z = 0;
    let rectangles = [];

    while (base < max) {
        while (values[base] === 1) {
            let a = 1;
            let right = 1;
            let down = 1;
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
            let allTrue = 1;
            let tempCount = 1;
            let tempArray = [];
            let isExec = 0;


            while (right === 1 || down === 1) {
                if (right === 1) {
                    if (Math.floor(start / col) === Math.floor((start + n) / col) && (start + n < len)) {

                        // Check if the n number of columns rightward are true
                        for (let i = 1; i <= n; i++) {
                            if (values[start+i] === 1) {
                                tempArray.push(start+i);
                                tempCount++;
                            } else {
                                allTrue = 0;
                                right = 0;
                                break;
                            }
                        }
                        // If n number of columns are true then push them into a temporary array other
                        if (allTrue === 1) {
                            for (let i = 0; i < tempArray.length; i++) {
                                temporary.push(tempArray[i]);
                            }
                            tempArray = [];
                        }
                    } else {
                        right = 0;
                    }
                    if (right === 0) {
                        temporary = [];
                        for (let i = 0; i < rect.length; i++) {
                            temporary[i] = rect[i];
                        }
                    } else if (right === 1) {
                        //rect = temporary;
                        rightCount = tempCount;
                    }
                    start = start + n;
                    n = n * 2;
                }


                n = rightCount; // The number of columns that are true
                tempArray = []; // The indexes of cells that are true will be pushed to this array
                allTrue = 1;

                if (right === 0 && isExec === 1) {
                    s = s * 2;
                    secondStart = base + (col * s);
                } else {
                    secondStart = base + (col * s) + downCount;
                }
                if (down === 1) {
                    isExec = 1;
                    let lastCell = 0;
                    if (rightCount > downCount) {
                        lastCell = secondStart + (rightCount - downCount);
                    } else {
                        lastCell = secondStart + (s * col);
                    }
                    if (lastCell <= len) {

                        for (let i = 1; i <= s; i++) {
                            let first = secondStart + ((i - 1) * col);
                            let last = lastCell - ((s - i) * col);
                            if (last > first + rightCount) {
                                last = first + rightCount;
                            }

                            for (let j = first; j < last; j++) {
                                if (values[j] === 1) {
                                    tempArray.push(j);
                                    downCount++;
                                } else {
                                    allTrue = 0;
                                    down = 0;
                                    break;
                                }
                            }
                        }

                        if (allTrue === 1) {

                            for (let i = 0; i < tempArray.length; i++) {
                                temporary.push(tempArray[i]);
                            }
                            tempArray = [];
                        }
                    } else {
                        down = 0;
                    }
                    if (down === 0 && downCount > 0) {
                        temporary = [];
                        for (let i = 0; i < rect.length; i++) {
                            temporary[i] = rect[i];
                        }
                    } else if (down === 1) {
                        rect = [];
                        for (let i = 0; i < temporary.length; i++) {
                            rect[i] = temporary[i];
                        }
                        secondStart = downCount + base + (col * s);
                    }
                }
                if (downCount === 0 && right === 1 && rightCount > 1) {
                    rect = [];
                    for (let i = 0; i < temporary.length; i++) {
                        rect[i] = temporary[i];
                    }
                }
            }

            for (let i = 0; i < rect.length; i++) {
                done.push(rect[i]);
            }
            base = base + 1;

            // If a rectangle is generated it is pushed to an array named rectangles in which all the rectangles are stored.
            rectangles.push(rect);
            rect = [];
        }
        base = base + 1;
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
    for (let i = 0; i < rectangles.length; i++) {
        rectangles[i].sort(function (x, y) {  return x - y;  });
    }
    return rectangles;
}

/**
 * Description: This function takes rectangles as an input and generate a disjunctive normal form.
 */
export function getDnf({rectangles, rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    let {arr} = getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode});
    let added = [];
    let dnf = "";
    let result = "";

    for (let k = 0; k < rectangles.length; k++) {
        for (let i = 0; i < arr.length; i++) {
            count = 0;
            for (let j = 0; j < rectangles[k].length; j++) {
                if (arr[i].includes(rectangles[k][j])) {
                    count++;
                }
            }
            if (rectangles[k].length === count) {
                if (added.includes(arr[i][0])) {

                } else {
                    added.push(arr[i][0]);
                }
            } else if (count === 0) {
                let str = "~";
                str = str.concat(arr[i][0])
                if (added.includes(str)) {

                } else {
                    added.push(str);
                }
            }
        }
        result = added.join(" & ");
        added = [];
        if (k === 0) {
            dnf = dnf.concat("(", result, ")");
        } else {
            dnf = dnf.concat(" || (", result, ")");
        }
    }
    return dnf;
}
