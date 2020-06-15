import React, {useEffect, useRef} from "react"
import inputStyles from "../input_formula/styles.module.scss"
import styles from "./karnaugh_map.module.scss"
import CellRender from "./karnaugh_render"
import {getDnf, getRectangles} from "../../project/dnf/dnf"
import {Rectangles} from "../../project/rectangle"
import SVGRectangles from "./rectangles"

/*
* Animate from truth table: https://github.com/framer/motion/issues/550
* Generate interactive react-table: https://github.com/tannerlinsley/react-table/blob/master/docs/quickstart.md
*   with framer-motion: https://codesandbox.io/s/github/tannerlinsley/react-table/tree/master/examples/animated-framer-motion
*/

/*
Example
table:
{
    "statement": "p -> q",
     "variables": ["p", "q"],
      "rows": [{"p": true, "q": true, "eval": true}, {"p": true, "q": false, "eval": false}, {
        "p": false,
        "q": true,
        "eval": true
    }, {"p": false, "q": false, "eval": true}]
}
*/
function splitVariablesInHalf(variables) {
    const len = variables.length
    const halfLen = Math.ceil(variables.length / 2)
    const firstHalf = variables.slice(0, halfLen)
    const secondHalf = variables.slice(halfLen)
    return [firstHalf, secondHalf]
}

let grayMemo = [
    [],
    [[0], [1]]
]

function prefixAllWith(list, prefix) {
    return list.map(list => [prefix, ...list])
}

function grayCode(variables) {
    if (variables.length < grayMemo.length) {
        //memoized
        return grayMemo[variables.length]
    }
    while (grayMemo.length <= variables.length) {
        //new length
        const lastBit = grayMemo[grayMemo.length - 1]

        // slice needed to make copy, not mutate
        const reverseLastBit = lastBit.slice().reverse()

        const L1 = prefixAllWith(lastBit, 0)
        const L2 = prefixAllWith(reverseLastBit, 1)

        const newGrayCode = [...L1, ...L2]
        grayMemo.push(newGrayCode)
    }
    return grayMemo[grayMemo.length - 1]
}

function transformTable(tableRows, rows, columns) {
    const rv = {}
    for (const row of tableRows) {
        let rowKey = []
        for (const rowHeader of rows) {
            rowKey.push(row[rowHeader])
        }
        let rowKeyJoined = rowKey.map(x => x ? 1 : 0).join('')
        if (!rv[rowKeyJoined]) {
            rv[rowKeyJoined] = {}
        }
        let columnKey = []
        for (const columnHeader of columns) {
            columnKey.push(row[columnHeader])
        }
        let columnKeyJoined = columnKey.map(x => x ? 1 : 0).join('')
        rv[rowKeyJoined][columnKeyJoined] = row.eval
    }
    return rv
}

/** @typedef {Object} Cell
 *  @property {Array.<string> | null} keys - identifier of particular cell, possibly corresponding to
 *      a table cell, if keys is null then the cell is top-left-most variable header.
 *      Keys have the following structure:
 *      a) `${variableNames}${variableValues}`
 *      b) `eval${variableValues}${evalValue}`
 *  @property {boolean} isHeader - whether to display `<th>` or `<td>`
 *  @property {string} value - text value to be displayed inside element
 *  @property {Array.<string>} variables - list of variables in that column/row header
 *      It is used for animation target position, when a particular row/column has more than one T/F
 *      variable, to accurately animate to the correct position.
 *  @property {Rectangle | undefined} rectangle - if we're not a header,
 *      corresponding rectangle, used to extract color information about current cell
 *  @property {number | undefined} rectangleIndex
 */

/** Whether the animation happens is controlled by the `tableRefs` property
 *  if it's null, then there is no animation, since there is no input table elements,
 *  that would provide the necessary position information for the animation in `CellRender`.
 *
 *  @param {Object} props
 *  @param {boolean} props.dnf - FIXME: changing this after initial render will return in error
 *      as this property being true adds 2 additional useMemo hooks
 */
export default React.memo(
    function KarnaughMap(
        {
            table,
            symbols: {t, f, na} = {t: "T", f: "F", na: "*"},
            tableRefs,
            onlyHeaders = false,
            dnf = false,
            returnDNF,

            returnRectangles,

            // rectangle highlighting (on dnf hover)
            highlightRectangleIndex = null,

            // dnf highlighting (on cell hover)
            onCellHover,

            ...props
        }
    ) {
        console.group("karnaugh map")
        console.log("Generating Karnaugh from: ", table, "with symbols t,f, na: ", t, f, na)
        let [rowHeaders, columnHeaders] = splitVariablesInHalf(table.variables)
        let [rowGrayCode, columnGrayCode] =
            [rowHeaders, columnHeaders]
                .map(grayCode)
        const transformedTable = transformTable(table.rows, rowHeaders, columnHeaders)
        const memoJsonTable = JSON.stringify(transformedTable)

        /** @type {number[][] | Rectangles} */
        let rectangles
        if (dnf) {
            rectangles = React.useMemo(
                () => getRectangles(
                    {
                        transformedTable,
                        rowGrayCode,
                        columnGrayCode,
                        rowHeaders,
                        columnHeaders
                    }
                ), [memoJsonTable]
            )
            console.table(rectangles)

            rectangles = React.useMemo(
                () => {
                    console.log(
                        "generating new rectangles, because transformedTable changed: ",
                        transformedTable
                    )
                    return new Rectangles({
                        rectangles,
                        rowLength: columnGrayCode.length,
                        columnHeight: rowGrayCode.length
                    })
                },
                [memoJsonTable]
            )
        }
        useEffect(() => {
            if (dnf && returnDNF) {
                console.log("returning dnf")
                returnDNF(getDnf({
                    rectangles: rectangles._rectangles.map(r => r.cellArray),
                    columnGrayCode,
                    columnHeaders,
                    rowGrayCode,
                    rowHeaders
                }))
            }
            if (returnRectangles) {
                returnRectangles(rectangles)
            }
        }, [table])
        const mapSymbol = code => {
            // is == not === since they are possibly strings as well
            if (code == 0) {
                return f
            } else if (code == 1) {
                return t
            } else {
                return na
            }
        }
        const mapSymbols = code => Array.isArray(code) ? code.map(mapSymbol) : mapSymbol(code)
        let columns = React.useMemo(
            () => {
                let headerValue
                if (columnHeaders.length === 0) {
                    // Single variable
                    headerValue = rowHeaders[0]
                } else {
                    // Normal case
                    headerValue = `${rowHeaders.join('')}\\${columnHeaders.join('')}`
                }

                return [
                    {
                        isHeader: true,
                        value: headerValue,
                        keys: null
                    },
                    ...columnGrayCode.map((gray, i) => (
                        {
                            isHeader: true,
                            value: mapSymbols(gray).join(''),
                            variables: columnHeaders,
                            keys: tableRefs ? columnHeaders.map((h, j) => `${h}${mapSymbol(gray[j])}`) : ['']
                        }
                    ))
                ]
            },
            [memoJsonTable, tableRefs, table.variables]
        )
        let data = React.useMemo(
            () => rowGrayCode.map((rowCode, i) => {
                /** @type {Cell[]} */
                const cell = [
                    {
                        // Fix case where with single variable it looks like evals are headers
                        isHeader: columnGrayCode.length !== 0,
                        value: mapSymbols(rowCode).join(''),
                        variables: rowHeaders,
                        keys: tableRefs ? rowHeaders.map((h, k) => `${h}${mapSymbol(rowCode[k])}`) : ['']
                    }
                ]
                columnGrayCode.forEach((columnCode, j) => {
                    const value = mapSymbols(transformedTable[rowCode.join('')][columnCode.join('')])
                    let rectangle, rectangleIndex;
                    if (dnf) {
                        // Weird, React won't let me rename object destructuring as expected without `let`
                        let output = rectangles.get(i, j)
                        if (output) {
                            rectangle = output.rect
                            rectangleIndex = output.i
                        }
                    }
                    cell.push(
                        {
                            isHeader: false,
                            value,
                            rectangle,
                            rectangleIndex,
                            pos: {x: j, y: i},
                            keys: tableRefs ?
                                [`eval${mapSymbols(rowCode).join('')}${mapSymbols(columnCode).join('')}${value}`]
                                : ['']
                        }
                    )
                })
                return cell
            }),
            [memoJsonTable, tableRefs]
        )
        /** @type {{current: HTMLTableRowElement | null}}*/
        let headRowRef = useRef(null)
        const commonTableStyles = {
            width: "100%"
        }
        const cellStyle = React.useMemo(() => ({
            backgroundColor:
                columnGrayCode.length === 0 ?
                    "initial" : null,
        }), [columnGrayCode.length])

        /** @type {Rectangle|undefined}*/
        let highlightRectangle

        // For restore
        const lastRectangle = useRef()
        if (highlightRectangleIndex !== null) {
            highlightRectangle = rectangles.rectangles[highlightRectangleIndex]
        }

        console.groupEnd()
        return (
            <table
                {...props}
                className={[inputStyles.truthTable, styles.karnaughMap].join(' ')}
                style={
                    dnf ?
                        {
                            position: "relative",
                            tableLayout: "fixed",
                            borderCollapse: "collapse",
                            ...commonTableStyles
                        } : commonTableStyles
                }
            >
                {
                    dnf && headRowRef.current &&
                    <SVGRectangles
                        highlightRectangleIndex={highlightRectangleIndex}
                        rectangles={rectangles}
                        numRows={rowGrayCode.length}
                        numColumns={columnGrayCode.length + 1}
                        rowRef={headRowRef}
                    />
                }
                <thead>
                <tr ref={dnf ? headRowRef : null}>
                    {
                        columns.map((column, i) => (
                            <CellRender
                                key={i}
                                cellKey={i}
                                cell={column}
                                refs={
                                    tableRefs ? i === 0 ? tableRefs.headers : tableRefs.evals : null
                                }
                            />
                        ))
                    }
                </tr>
                </thead>
                <tbody>
                {
                    data.map((row, i) => {
                        return (
                            <tr key={i}>
                                {
                                    row.map((cell, j) => {
                                        const key = columns.length + i * row.length + j
                                        let shouldHighlight = false
                                        if(cell.rectangle && lastRectangle.current) {
                                            // Restore previous rectangle which was on top
                                            let lastRect = lastRectangle.current
                                            if(lastRect.checkIfInBounds(j-1, i)) {
                                                cell.rectangle = lastRect

                                                // Reset
                                                lastRectangle.current = null
                                            }
                                        }
                                        if (highlightRectangle && cell.rectangle) {
                                            // Check if current cell is in highlighted rectangle
                                            const isCurrentCellInHighlightedRectangle = highlightRectangle.checkIfInBounds(j-1, i)
                                            if (isCurrentCellInHighlightedRectangle) {
                                                if(cell.rectangle.color !== highlightRectangle.color) {
                                                    // If colors are different select the one which belongs to the currently highlighted
                                                    console.log("Overriding rectangle", cell," with ", highlightRectangle, i-1,j-1)

                                                    // Save current to restore on hover end
                                                    lastRectangle.current = cell.rectangle

                                                    cell.rectangle = highlightRectangle
                                                }
                                                shouldHighlight = true
                                            }
                                        }
                                        let onCellHoverResolvedRectangles

                                        if(cell.rectangle) {
                                            const foundRectangles = rectangles.get(i, j-1, {all: true})
                                            if(foundRectangles) {
                                                onCellHoverResolvedRectangles = onCellHover(foundRectangles)
                                            }
                                        }

                                        return (
                                            <CellRender
                                                style={cellStyle}
                                                key={key}
                                                cellKey={key}
                                                naSymbol={na}
                                                cell={cell}
                                                onCellHover={onCellHoverResolvedRectangles}
                                                shouldHighlight={shouldHighlight}
                                                isHighlighting={!!highlightRectangle}
                                                refs={
                                                    (!tableRefs || (onlyHeaders && j !== 0)) ?
                                                        null : tableRefs.evals
                                                }
                                                show={
                                                    !onlyHeaders || (onlyHeaders && j === 0)
                                                }
                                                isLast={
                                                    j !== 0 &&
                                                    i === data.length - 1 &&
                                                    j === row.length - 1
                                                }
                                            />
                                        )
                                    })
                                }
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
)
