import React, {useState, useEffect, useCallback, useReducer, useRef} from "react"
import Statement from "../project/statement";
import makeTruthTable from "../project/truth_table"
import styles from './input_formula.module.scss'
import {debounce} from "lodash"
import * as d3 from "d3"


const tableInitialState = {
    truthTable: null,
    truthTableJsx: null
}

function tableReducer(state, {type, statement}) {
    switch (type) {
        case 'generate': {
            let truthTable = makeTruthTable(statement)
            let truthTableJsx = generateTruthTableJsx(truthTable)
            return {truthTable, truthTableJsx}
        }
    }
}

const initialState = {
    statement: null,
    isValid: null,
    errorMessage: "text",
    showErrorMessage: false
}

function reducer(state, {type, text, show}) {
    switch (type) {
        case 'add': {
            let errorMessage
            let isValid = true
            let statement
            try {
                statement = new Statement(text)
            } catch (error) {
                isValid = false
                errorMessage = error
            }
            return {
                statement: statement ?? state.statement,
                isValid,
                errorMessage: errorMessage ?? state.errorMessage
            }
        }
        case 'show_error': {
            return {
                ...state,
                showErrorMessage: show
            }
        }
    }
}

const parseTreeInitialState = {
    jsx: null,
    canvasRef: null
}

function parseTreeReducer(state, {type, statement, node}) {
    switch (type) {
        case 'generate': {
            console.log("canvasRef: ", state)
            state.canvasRef.innerHTML = ''
            const parseTreeJsx = generateParseTreeJsx(statement.tree, state.canvasRef)
            return {...state, jsx: parseTreeJsx}
        }
        case 'set_ref': {
            return {...state, canvasRef: node}
        }
    }
}

const useStateWithLocalStorage = localStorageKey => {
    const [value, setValue] = React.useState(
        window ? (window.localStorage.getItem(localStorageKey) || '') : ''
    );

    React.useEffect(() => {
        window.localStorage.setItem(localStorageKey, value);
    }, [value]);

    return [value, setValue];
};

export default function InputFormula() {
    let text, setText
    if (process.browser) {
        [text, setText] = useStateWithLocalStorage(`${process.env.staticFolder}-input-formula-text`)
    } else {
        [text, setText] = useState('')
    }
    const [state, dispatch] = useReducer(reducer, initialState)
    let inputElem = useRef()
    useEffect(() => {
        inputElem.current.value = text
        dispatch({type: 'add', text})
    }, [])

    // https://reactjs.org/docs/hooks-reference.html#usereducer
    const [tableState, tableDispatch] = useReducer(tableReducer, tableInitialState);
    const [parseTreeState, parseTreeDispatch] = useReducer(parseTreeReducer, parseTreeInitialState);

    const canvasRefCallback = useCallback(node => {
        if (node !== null) {
            parseTreeDispatch({type: 'set_ref', node})
        }
    }, [])

    const generateTruthTable = () => {
        if (!state.statement) return
        tableDispatch({type: 'generate', statement: state.statement})
    }
    const generateParseTree = () => {
        if (!state.statement) return
        parseTreeDispatch({type: 'generate', statement: state.statement})
    }

    // debounce
    // https://stackoverflow.com/questions/59358092/set-input-value-with-a-debounced-onchange-handler
    // https://stackoverflow.com/a/58594348/10854888
    const debouncedHandler = useCallback(debounce((text) => {
        dispatch({type: 'add', text})
    }, 200), [])

    return (
        <div className={styles.container}>
            <div className={styles.formulaButtonRow}>
                <div className={styles.formulaWrapper}>
                    <div
                        className={[styles.error, state.showError && isValid === false ? styles.showError : ''].join(' ')}>
                        {state.errorMessage.toString()}
                    </div>
                    <input
                        className={[state.isValid ? styles.valid : styles.invalid, styles.inputFormula].join(' ')}
                        onChange={(event) => {
                            let text = event.target.value
                            setText(text)
                            debouncedHandler(text)
                        }}
                        ref={inputElem}
                        onMouseEnter={() => {
                            dispatch({type: 'show_error', show: true})
                        }}
                        onMouseLeave={() => {
                            dispatch({type: 'show_error', show: false})
                        }}
                    >
                    </input>
                </div>
                <div className={styles.buttons}>
                    <button
                        className={styles.button}
                        onClick={generateTruthTable}
                    >
                        Generate truth table
                    </button>
                    <button
                        className={styles.button}
                        onClick={generateParseTree}
                    >
                        Generate parse tree
                    </button>
                </div>
            </div>

            {
                tableState.truthTable && tableState.truthTableJsx
            }
            <div
                className={styles.parseTreeContainer}
                ref={canvasRefCallback}
            >
            </div>
        </div>
    )
}

function generateParseTreeJsx(data, containerRef) {
    // https://github.com/d3/d3/blob/master/CHANGES.md#shapes-d3-shape
    // https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
    // https://observablehq.com/@d3/tidy-tree
    console.log("Drawing parse tree with data: ", data)
    const size = data.size
    const margin = {top: 20, right: 120, bottom: 20, left: 120}
    const width = 960 - margin.right - margin.left
    const height = (30 * size) - margin.top - margin.bottom

    let i = 0

    let root = d3.hierarchy(data.tree[0])
    const tree = d3.tree().size([height, width])
    let maxYTransform = 0

    const treeData = tree(root)

    const circleRadius = 15

    const svg = d3.select(containerRef)
        .append('svg')
        .attr('width', width + margin.right + margin.left)
        .attr('height', height + margin.top + margin.bottom)
    const g = svg
        .append('g')
        .attr('style', `transform: translateX(${circleRadius}px);`)
        .attr('class', styles.svgGroup)
    // Compute the new tree layout.
    // https://stackoverflow.com/questions/41087568/d3js-tree-nodes-is-not-a-function
    let nodes = treeData.descendants().reverse()
    let links = treeData.links()

    // Normalize for fixed-depth.
    nodes.forEach(d => {
        d.y = d.depth * 180
    })

    // Declare the nodes
    let node = g.selectAll('g.node')
        .data(nodes, d => d.id || (d.id = ++i))

    // Enter the nodes.
    let nodeEnter = node
        .enter()
        .append('g')
        .attr('class', d => d.children ? styles.operatorNode : styles.variableNode)
        .attr('transform', d => {
                if (d.x > maxYTransform) {
                    console.log("setting new max transform on ", d)
                    maxYTransform = d.x
                }
                return `translate(${d.y},${d.x})`
            }
        )

    nodeEnter.append('circle')
        .attr('r', circleRadius)

    nodeEnter.append('text')
        .attr('x', 0)
        .attr('dy', '.35em')
        .text(d => d.data.name)

    // Declare the links
    let link = g
        .selectAll('path.link')
        .data(links, d => d.target.id)

    // https://stackoverflow.com/questions/40845121/where-is-d3-svg-diagonal
    // https://github.com/d3/d3-shape/issues/27
    let diagonal = function link(d) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    }

    // Enter the links.
    link.enter()
        .insert('path', 'g')
        .attr('d', diagonal)

    const actualSize = svg.select('g').node().getBoundingClientRect()
    // https://stackoverflow.com/questions/50813950/how-do-i-make-an-svg-size-to-fit-its-content
    svg.attr('width', actualSize.width).attr('height', maxYTransform + circleRadius)
}

function generateTruthTableJsx(truthTable) {
    let rows = []
    for (let i = 0; i < truthTable.rows.length; ++i) {
        let row = []
        for (let j = 0; j < truthTable.variables.length; ++j) {
            row.push(truthTable.rows[i][truthTable.variables[j]])
        }
        row.push(truthTable.rows[i].eval)
        rows.push((
            <tr key={i}>
                {
                    row.map((someEval, j) => {
                        return (<td key={j}>
                            {
                                someEval ? "T" : "F"
                            }
                        </td>)
                    })
                }
            </tr>
        ))
    }

    return (
        <table className={styles.truthTable}>
            <thead>
            <tr>
                {
                    truthTable.variables.map((variable, i) => {

                        return (<th key={i}>{variable}</th>)
                    })
                }
                <th>{truthTable.statement}</th>
            </tr>
            </thead>
            <tbody>
            {
                rows
            }
            </tbody>
        </table>
    )
}