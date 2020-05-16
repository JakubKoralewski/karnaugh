import React, {useCallback, useEffect, useReducer, useState, useMemo, useRef} from "react"
import styles from "./input_formula.module.scss"
import * as d3 from "d3"
import {motion} from "framer-motion"
// import useStateWithLocalStorage from "./useStateWithLocalStorage"

const localStorageKey = `${process.env.staticFolder}-last-parse-tree-output`

const convertNodesToNodesWithParents = (nodes) => {
    nodes.forEach((n, i) => n.parent ? n.parent = nodes.find(n1 => n1.id === n.parent) : null)
}

function init(initialState) {
    if (initialState.memo) {
        convertNodesToNodesWithParents(initialState.memo.nodes)
    }
    return initialState
}

const initialState = {
    canvasRef: null,
    memo:
        !process.browser ?
            null : window ? (
                JSON.parse(window.localStorage.getItem(localStorageKey)) || ''
            ) : '',
    nodes: null,
    links: null,
    circleRadius: 15
}

function reducer(state, action) {
    switch (action.type) {
        case 'generate_parse_tree': {
            console.log("generate parse tree")
            let {statement} = action
            if (state.memo && state.memo.input === statement.statement.trim()) {
                console.log("parse tree same as last time, abort")
                if (!state.nodes || !state.links) {
                    let {nodes, links} = state.memo

                    Object.assign(state, {nodes, links})
                }
                return state;
            }
            console.log("canvasRef: ", state)
            // state.canvasRef.innerHTML = ''
            let {nodes, links} = generateParseTree(statement.tree, {circleRadius: state.circleRadius})
            Object.assign(state, {nodes, links})
            nodes.forEach((n, i) => n.id = i)
            nodes.forEach((n, i) => n.parent ? n.parent = n.parent.id : null)
            let memoParseTree = {input: statement.statement.trim(), nodes, links}
            window.localStorage.setItem(
                localStorageKey,
                JSON.stringify(memoParseTree)
            )
            state.memo = memoParseTree
            return state
        }
        /*        case 'set_ref': {
                    let {node, statement} = action
                    // if (state.memoParseTree && statement.statement.trim() === state.memoParseTree.input) {
                    //     node.innerHTML = state.memoParseTree.html
                    // }
                    if (state.memo) {
                        let {nodes, links} = JSON.parse(state.memo)
                        Object.assign(state, {nodes,links})
                    }
                    return {...state, canvasRef: node}
                }*/
    }
}

export default React.memo(function ParseTree({statement}) {
    console.log("rendering parse tree", statement)
    // let canvasSet = false
    const [state, dispatch] = useReducer(reducer, initialState, init)
    const [svgSize, setSvgSize] = useState([-1, -1])

    /*    const canvasRefCallback = useCallback(node => {
            console.log("canvas ref")
            if (node !== null) {
                parseTreeDispatch({type: 'set_ref', node, statement})
                if(!canvasSet) {
                    parseTreeDispatch({type: 'generate', statement})
                    canvasSet = true
                }
            }
        }, [statement])*/
    useMemo(() => {
        dispatch({type: 'generate_parse_tree', statement})
    }, [statement])

    let mainGroupRef = useRef()
    let i = 0
    let maxYTransform = 0
    useEffect(() => {
        const actualSize = mainGroupRef.current.getBoundingClientRect()
        maxYTransform += state.circleRadius
        if (actualSize.height > maxYTransform) {
            maxYTransform = actualSize.height
        }
        // https://stackoverflow.com/questions/50813950/how-do-i-make-an-svg-size-to-fit-its-content
        setSvgSize([actualSize.width + 10 + state.circleRadius, maxYTransform + state.circleRadius + 10])
    }, [])
    let diagonal = function link(d) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    }

    return (
        <div
            className={styles.parseTreeContainer}
            // ref={canvasRefCallback}
        >
            <motion.svg width={svgSize[0]} height={svgSize[1]}>
                <motion.g ref={mainGroupRef} className={styles.svgGroup}>
                    {
                        state.links ? state.links.map(l => {
                            // https://codesandbox.io/s/framer-motion-svg-checkbox-kqm7y
                            return (
                                <motion.path
                                    d={diagonal(l)}
                                    className={styles.link}
                                    animate={{pathLength: 1}}
                                    initial={{pathLength: 0}}
                                    transition={{duration: 0.4*(l.source.depth+1), delay: l.source.depth * 0.4}}
                                />
                            )
                        }) : null
                    }

                    {
                        state.nodes ? state.nodes.map(d => {
                            console.log(d)
                            if (d.x > maxYTransform) {
                                maxYTransform = d.x
                            }
                            return (
                                <motion.g
                                    className={
                                        [
                                            d.children ? styles.operatorNode : styles.variableNode,
                                            "node"
                                        ].join(' ')
                                    }
                                    style={{
                                        transform: `translate(${d.y + state.circleRadius}px,${d.x}px)`
                                    }}
                                    initial={{
                                        opacity: 0
                                    }}
                                    animate={{
                                        opacity: 1
                                    }}
                                    transition={{delay: d.depth*0.4}}
                                >
                                    <motion.circle r={state.circleRadius}/>
                                    <motion.text x="0" dy="0.35em">
                                        {
                                            d.data.name
                                        }
                                    </motion.text>

                                </motion.g>

                            )
                        }) : null
                    }
                </motion.g>
            </motion.svg>
        </div>
    )
})

function generateParseTree(data, {circleRadius}) {
    // https://github.com/d3/d3/blob/master/CHANGES.md#shapes-d3-shape
    // https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
    // https://observablehq.com/@d3/tidy-tree
    console.group("Drawing parse tree with data: ", data)
    const size = data.size
    const margin = {top: 20, right: 120, bottom: 20, left: 120}
    const width = 960 - margin.right - margin.left
    const height = (30 * size) - margin.top - margin.bottom
    // const height = 100

    let i = 0

    let root = d3.hierarchy(data.tree[0])
    const tree = d3.tree().size([height, width])
    let maxYTransform = 0

    const treeData = tree(root)


    /*
        const svg = d3.select(containerRef)
            .append('svg')
            .attr('width', width + margin.right + margin.left)
            .attr('height', height + margin.top + margin.bottom)
        const g = svg
            .append('g')
            .attr('style', `transform: translate(${circleRadius}px, ${circleRadius}px);`)
            .attr('class', styles.svgGroup)
    */
    // Compute the new tree layout.
    // https://stackoverflow.com/questions/41087568/d3js-tree-nodes-is-not-a-function
    let nodes = treeData.descendants().reverse()
    // Normalize for fixed-depth.
    nodes.forEach(d => {
        d.y = d.depth * 100
        d.x *= 1.5
        d.x += 12
        console.log(d)
    })
    let links = treeData.links()
    console.groupEnd()
    return {nodes, links}


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
    maxYTransform += circleRadius
    if (actualSize.height > maxYTransform) {
        maxYTransform = actualSize.height
    }
    // https://stackoverflow.com/questions/50813950/how-do-i-make-an-svg-size-to-fit-its-content
    svg.attr('width', actualSize.width + 10 + circleRadius).attr('height', maxYTransform + circleRadius + 10)
}
