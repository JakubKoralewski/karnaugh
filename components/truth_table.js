import React, {createRef, useEffect, useRef} from "react"
import styles from "./input_formula.module.scss"
import makeTruthTable from "../project/truth_table"

const localStorageKey = `${process.env.staticFolder}-input-formula-truth-table`

const initialState = {
    memoTruthTable:
        !process.browser ?
            null : window ? (
                JSON.parse(window.localStorage.getItem(localStorageKey)) || ''
            ) : ''
}

function generateTable(state, statement) {
    if (!statement) {
        console.warn("No statement supplied for table generation!")
        return;
    }
    if (state.memoTruthTable && state.memoTruthTable.input === statement.statement.trim()) {
        console.log("truth table same as last time, abort")
        return state.memoTruthTable
    }
    let table = makeTruthTable(statement)
    let memoTruthTable = {input: statement.statement.trim(), table}
    window.localStorage.setItem(
        localStorageKey,
        JSON.stringify(memoTruthTable)
    )
    console.log("saving table: ",)
    return memoTruthTable
}
/**
 * @typedef {{current: HTMLElement | undefined}} ReactRef
 */

/**
 * @typedef TableRefs
 * @property {Object.<string, Array.<HTMLElement>>} evals
 * @property {Array.<ReactRef>} headers
 */

/**
 * @typedef {function(): null} OnChange
 */

/**
 * Truth table component.
 */
const TruthTableJsx = React.memo((props) => {
    let {statement, /** @type {OnChange}*/ onChange, symbols={t: "T", f: "F"}, returnRefs} = props
    console.group("generating truth table", statement)
    if(!statement) {
        // Can happen on going back
        console.log("Tried rendering truth table with empty statement!")
        return;
    }
    let truthTable = generateTable(initialState, statement).table
    console.log("truthTable: ", truthTable)
    const headerEvalRef = useRef()
    /** @type {TableRefs} refs
     * `refs.headers` should be an array in case there are multiple variables
     * with the same name, otherwise animation is broken, where only the first element
     * gets animated.
     *
     * refs.headers - are made available to top-left-most header, to animate variable headers from table
     *      to top-left
     * refs.evals - for everything else, including row/column headers
     */
    const refs = {evals: {}, headers: []}
    useEffect(
        () => {
            onChange(truthTable)
            if(returnRefs) {
                returnRefs(refs)
            }
        },
        [statement]
    )
    let elRefs = React.useRef([])
    let refsNonHeadersLength = truthTable.rows.length * (truthTable.variables.length+1)
    let refsLength = refsNonHeadersLength + truthTable.variables.length

    if (refsLength !== elRefs.current.length) {
        elRefs.current = Array(refsLength)
            .fill(0)
            .map((_, i) => elRefs[i] || createRef())
    }

    let rows = []
    for (let i = 0; i < truthTable.rows.length; ++i) {
        let row = []
        for (let j = 0; j < truthTable.variables.length; ++j) {
            const variableName = truthTable.variables[j]
            row.push({name: variableName, eval: truthTable.rows[i][variableName]})
        }
        let rowEval = truthTable.rows[i].eval
        row.push({name: `eval${row.map(r => r.eval ? symbols.t : symbols.f).join('')}`, eval: rowEval})
        rows.push((
            <tr key={i} className={!rowEval ? styles.tableFalseRow : ''}>
                {
                    row.map((someEval, j) => {
                        let newRef = elRefs.current[i*(truthTable.variables.length + 1)+j]
                        let newRefKey = `${someEval.name}${someEval.eval ? symbols.t : symbols.f}`
                        if(!refs.evals[newRefKey]) {
                            refs.evals[newRefKey] = []
                        }
                        refs.evals[newRefKey].push(newRef)
                        return (<td ref={newRef} key={`${j}${newRefKey}`}>
                            {
                                someEval.eval ? symbols.t : symbols.f
                            }
                        </td>)
                    })
                }
            </tr>
        ))
    }
    console.groupEnd()
    return (
        <div className={styles.truthTableContainer}>
            <table className={styles.truthTable}>
                <thead>
                <tr>
                    {
                        truthTable.variables.map((variable, i) => {
                            let newRef = elRefs.current[refsNonHeadersLength + i]
                            // In CellRender this will not be transformed in any way and used
                            // as-is.
                            refs.headers.push({ref: newRef, variableName: variable, i})

                            return (<th key={i} ref={newRef}>{variable}</th>)
                        })
                    }
                    <th ref={headerEvalRef}>{truthTable.statement}</th>
                </tr>
                </thead>
                <tbody>
                {
                    rows
                }
                </tbody>
            </table>
        </div>
    )
})
export default TruthTableJsx
