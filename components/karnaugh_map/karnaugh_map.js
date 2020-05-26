import React, {useState} from "react"
import inputStyles from "../input_formula.module.scss"
import styles from "./karnaugh_map.module.scss"
import {CellRender} from "./karnaugh_render"

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


export default React.memo(
    function KarnaughMap(
        {
            table,
            symbols: {t, f, na} = {t: "T", f: "F", na: "*"},
            tableRefs,
            onlyHeaders = false,
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
        const mapSymbol = code => {
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
                if(columnHeaders.length === 0) {
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
                            keys: columnHeaders.map((h, j) => `${h}${mapSymbol(gray[j])}`)
                        }
                    ))
                ]
            },
            [table.rows]
        )
        let data = React.useMemo(
            () => rowGrayCode.map((rowCode, i) => {
                const cell = [
                    {
                        // Fix case where with single variable it looks like evals are headers
                        isHeader: columnGrayCode.length !== 0,
                        value: mapSymbols(rowCode).join(''),
                        variables: rowHeaders,
                        keys: rowHeaders.map((h, k) => `${h}${mapSymbol(rowCode[k])}`)
                    }
                ]
                columnGrayCode.forEach((columnCode, j) => {
                    const value = mapSymbols(transformedTable[rowCode.join('')][columnCode.join('')])
                    cell.push(
                        {
                            isHeader: false,
                            value,
                            variables: rowHeaders,
                            keys: [`eval${mapSymbols(rowCode).join('')}${mapSymbols(columnCode).join('')}${value}`]
                        }
                    )
                })
                return cell
            }),
            [table.rows]
        )

        console.groupEnd()
        return (
            <table
                {...props}
                className={[inputStyles.truthTable, styles.karnaughMap].join(' ')}
            >
                <thead>
                <tr>
                    {
                        columns.map((column, i) => (
                            <CellRender
                                key={i}
                                cellKey={i}
                                cell={column}
                                refs={tableRefs ? i === 0 ? tableRefs.headers : tableRefs.evals : null}
                            />
                        ))
                    }
                </tr>
                </thead>
                <tbody>
                {
                    data.map((row, i) => {
                        return (
                            <tr>
                                {row.map((cell, j) => {
                                    return (
                                        <CellRender
                                            style={{backgroundColor: columnGrayCode.length === 0 ? "initial" : null}}
                                            key={j}
                                            cellKey={i + columns.length}
                                            naSymbol={na}
                                            cell={cell}
                                            refs={!tableRefs || (onlyHeaders && j !== 0) ? null : tableRefs.evals}
                                            show={!onlyHeaders || (onlyHeaders && j === 0)}
                                            isLast={j !== 0 && i === data.length - 1 && j === row.length - 1}
                                        />
                                    )
                                })}
                            </tr>
                        )
                    })
                }
                </tbody>
            </table>
        )
    }
)
