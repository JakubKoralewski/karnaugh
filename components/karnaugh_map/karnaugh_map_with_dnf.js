import KarnaughMap from "./karnaugh_map";
import makeTruthTable from "../../project/truth_table";
import React, {createRef, useRef, useState} from "react";
import karnaughStyles from "./karnaugh_map.module.scss"

export default React.memo(
    function KarnaughMapWithDnf({
                                    table
                                }) {
        /** @type {[DNFIntermediate, Function]} */
        const [DNF, setDNF] = useState(null)
        const [rectangles, setRectangles] = useState(null)
        const [highlightRectangleIndex, setHLRect] = useState(null)

        /** @type {{current: {current: HTMLSpanElement}[]}}*/
        let dnfRefs = useRef([])
        let dnfRefsLength = DNF ? DNF.blocks.length : 0

        if (dnfRefsLength !== dnfRefs.current.length) {
            dnfRefs.current = Array(dnfRefsLength)
                .fill(0)
                .map((_, i) => dnfRefs[i] || createRef())
        }
        /** @param {DNFIntermediate} dnf */
        const onReturnDNF = (dnf) => {
            setDNF(dnf)
        }
        const onReturnRectangles = (r) => {
            setRectangles(r)
        }

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
        /** @type {{current: Object.<number, {block: DNFBlock, ref: {current: HTMLSpanElement}, active: boolean}>}}*/
        const rectangleIndexToDNFBlockMap = useRef({})
        let onCellHover = {
            both(rectangleIndex, on) {
                return (event) => {
                    const blockInfo = rectangleIndexToDNFBlockMap.current[rectangleIndex]
                    console.log("on cell hover ", on, event, rectangleIndex)
                    console.log("block", blockInfo)
                    if (on === "toggle") {
                        blockInfo.active = !blockInfo.active
                    } else {
                        blockInfo.active = on
                    }

                    if (blockInfo.active) {
                        blockInfo.ref.current.classList.add(karnaughStyles.dnfBlockActive)
                    } else {
                        blockInfo.ref.current.classList.remove(karnaughStyles.dnfBlockActive)
                    }
                }
            }
        }

        onCellHover = {
            ...onCellHover,
            toggle(rectangleIndex) {
                return onCellHover.both(rectangleIndex, "toggle")
            },
            on(rectangleIndex) {
                return onCellHover.both(rectangleIndex, true)
            },
            off(rectangleIndex) {
                return onCellHover.both(rectangleIndex, false)
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
                        highlightRectangleIndex={highlightRectangleIndex}
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
                    table && DNF &&
                    <div style={{marginTop: `1rem`}}>
                        {
                            DNF.blocks.map((/** @type {DNFBlock}*/b, i) => {
                                let ref = dnfRefs.current[i]
                                let rect
                                if (rectangles) {
                                    rect = rectangles.rectangles[b.rectangleIndex]
                                    rectangleIndexToDNFBlockMap.current[b.rectangleIndex] = {
                                        block: b,
                                        ref,
                                        active: false
                                    }
                                }
                                let text = null
                                if (i !== DNF.blocks.length - 1) {
                                    text = " || "
                                }
                                return (
                                    <React.Fragment key={i}>
                                        <span
                                            className={karnaughStyles.dnfBlock}
                                            style={{
                                                borderColor: rect.color,
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
                    </div>
                }
            </div>
        )
    }
)
