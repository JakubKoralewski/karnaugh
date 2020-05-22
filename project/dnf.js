function getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    let arr = [];
    let rowCount = rowHeaders.length;
    let colCount = columnHeaders.length;
    let row = rowGrayCode.length;
    let col = columnGrayCode.length;
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

export function getRectangles({transformedTable, rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    // let visualizedMap = visualizeMap({rowGrayCode, columnGrayCode, transformedTable})
    let {colCount, rowCount, row, col} =
        getArr(
            {rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}
        );
    let max = col * row;
    let values = [];
    let allValues = [];
    allValues[0] = [];
    allValues[1] = [];
    for (let keys in transformedTable) {
        for (let key in transformedTable[keys]) {
            allValues[0].push(keys.concat(key));
            allValues[1].push(transformedTable[keys][key] ? 1 : 0);
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
    let n = 0;
    let rectangles = [];

    while (base < max) {
        while (values[base] === 1 && done.includes(base) === false) {
            let a = 1;
            let right = 1;
            let down = 1;
            let temporary = [];
            temporary.push(base);
            let rect = temporary;
            let rightCount = 1;
            let downCount = 0;
            let len = values.length;
            let start = base;
            let secondStart = base;
            let n = 1;
            let step = 1;
            let allTrue = 1;
            let tempCount = 1;
            let tempArray = [];

            while (right === 1) {
                if (Math.floor(start / col) === Math.floor((start + n) / col) && (start + n < len)) {
                    for (let i = 1; i <= n; i++) {
                        if (values[start + i] === 1) {
                            tempArray.push(start + i);
                            tempCount++;
                        } else {
                            allTrue = 0;
                            right = 0;
                            break;
                        }
                    }
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
                    temporary = rect;
                    break;
                } else if (right === 1) {
                    rect = temporary;
                    rightCount = tempCount;
                }
                start = start + n;
                n = n * 2;
            }

            n = rightCount;
            let s = 1;
            tempArray = [];

            while (down === 1) {
                downCount = 0;
                if (secondStart + (col * s) + n <= len) {
                    for (let j = 0; j < rightCount; j++) {
                        for (let i = 1; i <= s; i++) {
                            let y = secondStart + j + (col * i);
                            let f = values[y];
                            if (values[secondStart + j + (col * i)] === 1) {
                                tempArray.push(secondStart + j + (col * i));
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
                if (down === 0) {
                    temporary = rect;
                    break;
                }

                if (down === 1) {
                    if (downCount === rightCount * s) {
                        rect = temporary;
                        secondStart = secondStart + (col * s);
                        s *= 2;
                    } else {
                        temporary = rect;
                        break;
                    }
                }
            }
            for (let i = 0; i < rect.length; i++) {
                done.push(rect[i]);
            }
            base++;

            if (rect.length > 0) {
                rectangles.push(rect);
                rect = [];
            }
        }
        base++;
    }
    return rectangles;
}

export function getDnf({rectangles, rowHeaders, columnHeaders, rowGrayCode, columnGrayCode}) {
    let {arr} = getArr({rowHeaders, columnHeaders, rowGrayCode, columnGrayCode});
    let added = [];
    let dnf = "";
    let result = "";

    for (let k = 0; k < rectangles.length; k++) {
        for (let i = 0; i < arr.length; i++) {
            let count = 0;
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
        result = added.join(" /\\ ");
        added = [];
        if (k === 0) {
            dnf = dnf.concat("(", result, ")");
        } else {
            dnf = dnf.concat(" \\/ (", result, ")");
        }
    }
    return dnf;
}
