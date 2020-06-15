import React, {useEffect, useReducer, useState, useMemo, useRef} from "react"
import styles from "./input_formula/styles.module.scss"
import * as d3 from "d3"
import {motion} from "framer-motion"

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
                JSON.parse(window.localStorage.getItem(localStorageKey)) || null
            ) : null,
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
    }
}

const linkVariants = {
    initial: ({initial, link}) => {
        console.log("animate link initial isInitial: ", initial)
        return {
            pathLength: 0,
        }
    },
    animate: ({initial, link}) => {
        let transition = {}
        if (initial.current) {
            transition = {
                delay: (link.source.depth + 1) * 0.4 + link.target.height * 0.3,
                duration: 0.4 * (link.source.depth + 1) + link.target.height * 0.3,
            }
        } else {
            transition = {
                delay: 0,
                duration: 0.5
            }
        }
        console.log("animate link animate isInitial: ", initial, transition)
        return {
            pathLength: 1,
            transition
        }
    }
}

const nodeVariants = {
    initial: ({initial, d}) => {
        console.log("animate d initial isInitial: ", initial)
        return {
            opacity: 0,
        }
    },
    animate: ({initial, d}) => {
        let transition = {}
        if (initial.current) {
            transition = {
                delay: d.depth * 0.4 + d.height * 0.3,
                duration: 0.4 * d.depth + d.height * 0.3,
            }
        } else {
            transition = {
                delay: 0,
                duration: 0.5
            }
        }
        console.log("animate d animate isInitial: ", initial, transition)
        return {
            opacity: 1,
            transition
        }
    }
}


export default React.memo(function ParseTree({statement}) {
    console.log("rendering parse tree", statement)
    const [state, dispatch] = useReducer(reducer, initialState, init)
    const [svgSize, setSvgSize] = useState([-1, -1])

    useMemo(() => {
        dispatch({type: 'generate_parse_tree', statement})
    }, [statement])

    let isInitialRender = useRef(true)
    useEffect(() => {
        console.log("Setting isInitialRender to false!")
        isInitialRender.current = false
    }, [])

    let mainGroupRef = useRef()
    let maxYTransform = 0

    useEffect(() => {
        const actualSize = mainGroupRef.current.getBoundingClientRect()
        maxYTransform += state.circleRadius
        if (actualSize.height > maxYTransform) {
            maxYTransform = actualSize.height
        }
        // https://stackoverflow.com/questions/50813950/how-do-i-make-an-svg-size-to-fit-its-content
        setSvgSize([actualSize.width + 10 + state.circleRadius, maxYTransform + state.circleRadius + 10])
    }, [statement])

    let diagonal = function link(d) {
        return "M" + d.source.y + "," + d.source.x
            + "C" + (d.source.y + d.target.y) / 2 + "," + d.source.x
            + " " + (d.source.y + d.target.y) / 2 + "," + d.target.x
            + " " + d.target.y + "," + d.target.x;
    }

    return (
        <div
            className={styles.parseTreeContainer}
        >
            <motion.svg width={svgSize[0]} height={svgSize[1]}>
                <motion.g ref={mainGroupRef} className={styles.svgGroup}>
                    {
                        state.links ? state.links.map((l, i) => {
                            const key = [i, l.source.data.name, l.target.data.name]
                            let x = [l.target]
                            while (x.length !== 0) {
                                let node = x.pop()
                                key.push(node.data.name)
                                if (!node.children) {
                                    continue;
                                }
                                x.push(...node.children)
                            }

                            // https://codesandbox.io/s/framer-motion-svg-checkbox-kqm7y
                            return (
                                <motion.path
                                    d={diagonal(l)}
                                    className={styles.link}
                                    animate="animate"
                                    initial="initial"
                                    variants={linkVariants}
                                    custom={{initial: isInitialRender, link: l}}
                                    key={key.join('')}
                                />
                            )

                        }) : null
                    }

                    {
                        state.nodes ? state.nodes.map((d, i) => {
                            console.log("node isInitialRender:", isInitialRender.current, d)
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
                                    initial="initial"
                                    animate="animate"
                                    custom={{initial: isInitialRender, d}}
                                    variants={nodeVariants}
                                    key={`${d.data.name}${i}`}
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

function generateParseTree(data) {
    // https://github.com/d3/d3/blob/master/CHANGES.md#shapes-d3-shape
    // https://github.com/d3/d3-hierarchy/blob/master/README.md#tree
    // https://observablehq.com/@d3/tidy-tree
    console.group("Drawing parse tree with data: ", data)
    const size = data.size
    const margin = {top: 20, right: 120, bottom: 20, left: 120}
    const width = 960 - margin.right - margin.left
    const height = (30 * size) - margin.top - margin.bottom

    let i = 0

    let root = d3.hierarchy(data.tree[0])
    const tree = d3.tree().size([height, width])

    const treeData = tree(root)

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
}
