import KarnaughMap from "./karnaugh_map"
import React, {createRef, useRef, useState} from "react"
import karnaughStyles from "./karnaugh_map.module.scss"
import useStateWithLocalStorage from "../useStateWithLocalStorage"

export default React.memo(
    function KarnaughMapWithDnf({
                                    table
                                }) {
        /** @type {[DNFIntermediate, Function]} */
        let DNF, setDNF
        if (process.browser) {
            [DNF, setDNF] = useStateWithLocalStorage(`${process.env.staticFolder}-dnf`)
        } else {
            [DNF, setDNF] = useState(null)
        }
        const [rectangles, setRectangles] = useState(null)
        const [highlightRectangleIndexes, setHLRect] = useState(null)

        /** @type {{current: {current: HTMLSpanElement}[]}}*/
        let dnfRefs = useRef([])
        let dnfRefsLength = DNF && DNF.blocks ? DNF.blocks.length : 0

        if (dnfRefsLength !== dnfRefs.current.length) {
            dnfRefs.current = Array(dnfRefsLength)
                .fill(0)
                .map((_, i) => dnfRefs[i] || createRef())
        }
        /** @param {DNFIntermediate} dnf */
        const onReturnDNF = (dnf) => {
            setDNF(dnf)
        }

        /**
         * @type {{current: Object.<number, {block: DNFBlock, ref: {current: HTMLSpanElement}}>}}
         */
        const rectangleIndexToDNFBlockMap = useRef({})

        /** @param {Rectangles} r*/
        const onReturnRectangles = (r) => {
            setRectangles(r)
        }

        /**
         * @param {DNFBlock} block
         * @param {{current: HTMLSpanElement}} ref
         * @param {"!b.active" | boolean} newValue
         */
        const onBlockHover = (block, ref, newValue) => {
            return (_event) => {
                console.log("Hover starting setting to", newValue)

                if (newValue === "!b.active") {
                    block.active = !block.active ?? true
                } else {
                    block.active = newValue
                }
                if (block.active) {
                    setHLRect(block.rectangleIndexes)
                } else {
                    setHLRect(null)
                }
            }
        }
        /** @param {Rectangle[]} highlightedRectangles*/
        const onCellHoverDecisionFactory = (highlightedRectangles) => {
            let onCellHoverDecision = {
                both(on) {
                    return (event) => {
                        console.group("onCellHover")
                        if (!rectangleIndexToDNFBlockMap.current[0]) {
                            console.groupEnd()
                            return;
                        }
                        const blockInfos = highlightedRectangles.map(r => rectangleIndexToDNFBlockMap.current[r.index])
                        console.log("on cell hover ", on, event, highlightedRectangles)
                        console.log("blocks", blockInfos)
                        for (const blockInfo of blockInfos) {
                            if (on === "toggle") {
                                blockInfo.active = !blockInfo.active
                            } else {
                                blockInfo.active = on
                            }
                            if (!blockInfo.ref.current) {
                                continue;
                            }

                            if (blockInfo.active) {
                                blockInfo.ref.current.classList.add(karnaughStyles.dnfBlockResetAnim)
                                window.requestAnimationFrame(() => {
                                    blockInfo.ref.current?.classList.remove(karnaughStyles.dnfBlockResetAnim)
                                })
                                blockInfo.ref.current.classList.add(karnaughStyles.dnfBlockActive)
                            } else {
                                blockInfo.ref.current.classList.remove(karnaughStyles.dnfBlockActive)
                                blockInfo.ref.current.classList.remove(karnaughStyles.dnfBlockResetAnim)
                            }
                        }
                        console.groupEnd()
                    }
                }
            }

            onCellHoverDecision = {
                ...onCellHoverDecision,
                toggle() {
                    return onCellHoverDecision.both("toggle")
                },
                on() {
                    return onCellHoverDecision.both(true)
                },
                off() {
                    return onCellHoverDecision.both(false)
                }
            }

            return onCellHoverDecision
        }
        /** Multiple rectangles in that cell
         * @param {Rectangle[]} highlightedRectangles
         */
        const onCellHover = (highlightedRectangles) => {
            return onCellHoverDecisionFactory(highlightedRectangles)
        }
        const DNFBlocks = () => {
            return DNF.blocks.map((/** @type {DNFBlock}*/b, i) => {
                let ref = dnfRefs.current[i]
                let color
                if (rectangles) {
                    // Know (on hover of rectangle) which dnf block needs to be highlighted
                    b.rectangleIndexes.forEach(i => {
                        rectangleIndexToDNFBlockMap.current[i] = {
                            block: b,
                            ref,
                            active: false
                        }
                        color = rectangles.rectangles[i].color
                    })
                }
                let text = null
                if (i !== DNF.blocks.length - 1) {
                    text = " || "
                }
                return (
                    <React.Fragment key={i}>
                        <span
                            className={
                                [
                                    karnaughStyles.dnfBlock,
                                    karnaughStyles.dnfBlockActual
                                ].join(' ')
                            }
                            style={{
                                borderColor: color,
                                '--wiggle': ref.current ? window.innerWidth / ref.current.scrollWidth / 4 : 15,
                            }}
                            ref={ref}
                            onMouseEnter={onBlockHover(b, ref, true)}
                            onMouseLeave={onBlockHover(b, ref, false)}
                            onTouchStart={onBlockHover(b, ref, "!b.active")}
                        >
                            {b.text}
                        </span>
                        {
                            text ? (
                                <span
                                    style={{fontWeight: `bold`}}
                                >
                                    {text}
                                </span>
                            ) : null
                        }
                    </React.Fragment>
                )
            })
        }
        const tautology = "true"
        const contradiction = "false"

        let DNFBlocksOutput = ""
        if (table && DNF && DNF.blocks) {
            let DNFBlocksText = ""
            let isTautology = rectangles.isTautology
            let isContradiction = rectangles.isContradiction
            if (isTautology && isContradiction) {
                const isTautologyWithOneVariable = table.rows.every(x => x.eval)
                const isContradictionWithOneVariable = table.rows.every(x => !x.eval)
                if (isTautologyWithOneVariable) {
                    DNFBlocksText = tautology
                } else if (isContradictionWithOneVariable) {
                    DNFBlocksText = contradiction
                } else {
                    DNFBlocksText = table.variables[0]
                }
            } else if (isTautology) {
                DNFBlocksText = tautology
            } else if (isContradiction) {
                DNFBlocksText = contradiction
            } else {
                DNFBlocksOutput = DNFBlocks()
            }

            if (!DNFBlocksOutput && DNFBlocksText) {
                DNFBlocksOutput = (
                    <span className={karnaughStyles.dnfBlock}>
                        {DNFBlocksText}
                    </span>
                )
            }
        }

        return (
            <div>
                {
                    table &&
                    <KarnaughMap
                        table={table}
                        symbols={{t: "T", f: "F", na: "*"}}
                        returnDNF={onReturnDNF}
                        returnRectangles={onReturnRectangles}
                        highlightRectangleIndexes={highlightRectangleIndexes}
                        onCellHover={onCellHover}
                        dnf={true}
                        style={
                            {
                                width: "100%",
                                tableLayout: "fixed"
                            }
                        }
                    />
                }
                {
                    table && DNF && DNF.blocks &&
                    <div style={{marginTop: `1rem`}}>
                        {
                            DNFBlocksOutput
                        }
                    </div>
                }
            </div>
        )
    }
)
