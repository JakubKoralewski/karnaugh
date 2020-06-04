import React, {useRef, createRef, useEffect, useState} from "react"
import styles from "./slides.module.scss"
import InputFormulaAll from "../../components/input_formula_all"
import {BasicAnimation, SimpleOpacityAnimation} from "../animations"
import KarnaughMap from "../../components/karnaugh_map/karnaugh_map"
import makeTruthTable from "../../project/truth_table"
import {DNFIntermediate} from "../../project/dnf/dnf"

function DNF(props) {
    const [state, setState] = useState({statement: '', table: null})

    /** @type {[DNFIntermediate, Function]} */
    const [DNF, setDNF] = useState(null)
    const [rectangles, setRectangles] = useState(null)
    const [highlightRectangleIndex, setHLRect] = useState(null)

    /** @type {{current: {current: HTMLSpanElement[]}[]}}*/
    let dnfRefs = useRef([])
    let dnfRefsLength = DNF ? DNF.blocks.length : 0

    if (dnfRefsLength !== dnfRefs.current.length) {
        dnfRefs.current = Array(dnfRefsLength)
            .fill(0)
            .map((_, i) => dnfRefs[i] || createRef())
    }

    const onStatementChange = (statement) => {
        setState(oldState => {
                const truthTable = makeTruthTable(statement)
                return {
                    ...oldState,
                    statement,
                    table: truthTable,
                }
            }
        )
    }
    /** @param {DNFIntermediate} dnf */
    const onReturnDNF = (dnf) => {
        setDNF(dnf)
    }
    const onReturnRectangles = (r) => {
        setRectangles(r)
    }

    useEffect(() => {
        if (!state.statement) {
            props.canGoForward("Please input a formula")
        } else {
            props.canGoForward(true)
        }
    }, [props.step, state.statement])

    useEffect(() => {
        let prevBG = document.body.style.backgroundColor
        document.body.style.background = "coral"
        return () => document.body.style.backgroundColor = prevBG
    }, [])

    /**
     * @param {DNFBlock} block
     * @param {{current: HTMLSpanElement}} ref
     * @param {"!b.active" | boolean} newValue
     */
    const onBlockHover = (block, ref, newValue) => {
        return (event) => {
            console.log("Hover starting setting to", newValue)

            if (newValue === "!b.active") {
                block.active = !block.active ?? true
            } else {
                block.active = newValue
            }
            if (block.active) {
                ref.current.classList.add("active")
                setHLRect(block.rectangleIndex)
            } else {
                ref.current.classList.remove("active")
                setHLRect(null)
            }
        }
    }

    return (
        <div className={styles.titular} style={{background: "coral"}}>
            <BasicAnimation>
                <h2>Generating DNF</h2>
            </BasicAnimation>
            <main style={{height: "100%", marginTop: "calc(2rem + 5vh)"}}>
                <ol>
                    <SimpleOpacityAnimation delay={0.2} duration={1}>
                        <InputFormulaAll
                            onChange={onStatementChange}
                            animate={children => <SimpleOpacityAnimation>{children}</SimpleOpacityAnimation>}
                        />
                    </SimpleOpacityAnimation>
                    <div style={{display: "flex", width: "100%", justifyContent: "center"}}>
                        <SimpleOpacityAnimation style={{width: "66.6%"}}>
                            <div>
                                {
                                    state.table &&
                                    <KarnaughMap
                                        table={state.table}
                                        symbols={{t: "T", f: "F", na: "*"}}
                                        returnDNF={onReturnDNF}
                                        returnRectangles={onReturnRectangles}
                                        highlightRectangleIndex={highlightRectangleIndex}
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
                                    state.table && DNF &&
                                    <div style={{marginTop: `1rem`}}>
                                        {
                                            DNF.blocks.map((/** @type {DNFBlock}*/b, i) => {
                                                let rect
                                                if (rectangles) {
                                                    rect = rectangles.rectangles[b.rectangleIndex]
                                                }
                                                let text = null
                                                if (i !== DNF.blocks.length - 1) {
                                                    text = " || "
                                                }
                                                let ref = dnfRefs.current[i]
                                                return (
                                                    <>
                                                        <span
                                                            style={{
                                                                padding: `2px 8px`,
                                                                cursor: `pointer`,
                                                                background: `white`,
                                                                borderRadius: `8px`,
                                                                borderColor: rect.color,
                                                                borderWidth: `5px`,
                                                                borderStyle: `solid`,
                                                                boxShadow: `3px 3px 10px rgba(0,0,0,0.1)`,
                                                            }}
                                                            ref={ref}
                                                            onMouseEnter={onBlockHover(b, ref, true)}
                                                            onMouseLeave={onBlockHover(b, ref, false)}
                                                            onTouchStart={onBlockHover(b, ref, "!b.active")}
                                                        >
                                                            {b.text}
                                                        </span>
                                                        {
                                                            text ? <span style={{fontWeight: `bold`}}>
                                                                {text}
                                                            </span>
                                                                : null
                                                        }
                                                    </>
                                                )
                                            })
                                        }
                                    </div>
                                }
                            </div>
                        </SimpleOpacityAnimation>
                    </div>
                </ol>
            </main>
        </div>
    );
}

export default {
    Slide: DNF,
}
