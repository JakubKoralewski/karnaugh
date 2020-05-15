import React, {useState} from "react"
import {useTable} from "react-table"
import inputStyles from "./input_formula.module.scss"
import styles from "./karnaugh_map.module.scss"

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
function replaceWithSymbols(gray, {1: t, 0: f}) {
    return gray.map(x => x === 1 ? t : f)
}

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


export default React.memo(function KarnaughMap({table, symbols: {t, f}, ...props}) {
    console.group("karnaugh map")
    console.log("Generating Karnaugh from: ", table, "with symbols t,f: ", t, f)
    let [rowHeaders, columnHeaders] = splitVariablesInHalf(table.variables)
    let [rowGrayCode, columnGrayCode] =
        [rowHeaders, columnHeaders]
            .map(grayCode)
    const transformedTable = transformTable(table.rows, rowHeaders, columnHeaders)
    const mapSymbols = code => Array.isArray(code) ? code.map(x => x ? t : f) : code ? t : f
    const columns = React.useMemo(
        () => [
            {
                Header: `${rowHeaders.join('')}\\${columnHeaders.join('')}`,
                accessor: '0'
            },
            ...columnGrayCode.map((gray, i) => (
                {
                    Header: mapSymbols(gray).join(''),
                    accessor: (i + 1).toString()
                }
            ))
        ],
        [table.rows]
    )
    const data = React.useMemo(
        () => rowGrayCode.map((rowCode, i) => {
            const cell = {
                '0': mapSymbols(rowCode).join('')
            }
            columnGrayCode.forEach((columnCode, j) => {
                cell[(j + 1).toString()] =
                    mapSymbols(transformedTable[rowCode.join('')][columnCode.join('')])
            })
            return cell
        }),
        [table.rows]
    )

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        rows,
        prepareRow,
    } = useTable({columns, data})

    console.groupEnd()
    return (
        <table
            {...getTableProps()}
            {...props}
            className={[inputStyles.truthTable, styles.karnaughMap].join(' ')}
        >
            <thead>
            {
                headerGroups.map(headerGroup => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                        {headerGroup.headers.map(column => (
                            <th
                                {...column.getHeaderProps()}
                            >
                                {column.render('Header')}
                            </th>
                        ))}
                    </tr>
                ))
            }
            </thead>
            <tbody {...getTableBodyProps()}>
            {
                rows.map(row => {
                    prepareRow(row)
                    return (
                        <tr {...row.getRowProps()}>
                            {row.cells.map(cell => {
                                return (
                                    <td
                                        {...cell.getCellProps()}
                                    >
                                        {cell.render('Cell')}
                                    </td>
                                )
                            })}
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    )
})