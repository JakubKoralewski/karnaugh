import React, {useCallback, useEffect, useRef, useState} from "react"
import {motion} from "framer-motion"
import {Rectangles} from "../../project/rectangle"
import {debounce} from "lodash";
import karnaughStyles from "./karnaugh_map.module.scss"

/** @author hmak.me https://stackoverflow.com/a/38118843 */
function generatePath({x, y, width: w, height: h, strokeWidth: r}, invisibleEdges) {
    console.log("generating path, invisible edges: ", invisibleEdges)
    if (invisibleEdges) {
        for (const edge of invisibleEdges) {
            switch (edge) {
                case "top": {
                    y -= r;
                    h += r;
                    break;
                }
                case "right": {
                    w += r;
                    break;
                }
                case "left": {
                    x -= r;
                    w += r;
                    break;
                }
                case "bottom": {
                    h += r;
                    break;
                }
            }
        }
    }
    return `M${x},${y} h${w} a${r},${r} 0 0 1 ${r},${r} v${h} a${r},${r} 0 0 1 -${r},${r} h-${w} a${r},${r} 0 0 1 -${r},-${r} v-${h} a${r},${r} 0 0 1 ${r},-${r} z`
}

export default React.memo(
    function SVGRectangles(props) {
        const {
            /** @type {Rectangles} */rectangles,
            numRows,
            numColumns,
            /** @type {{current: HTMLTableRowElement}}*/rowRef,

            /** @type {number[]|null}*/highlightRectangleIndexes
        } = props
        console.groupCollapsed("Drawing rectangles, ", props)

        const initSizes = (numColumns) => {
            console.log("Setting column width with numColumns = ", numColumns)
            console.log("rowref width", rowRef.current.scrollWidth)
            const rowWidth = rowRef.current.scrollWidth
            const columnWidth = rowWidth / numColumns
            return {
                rowHeight: rowRef.current.scrollHeight,
                rowWidth: rowWidth - columnWidth,
                columnWidth,
                strokeWidth: 4 + columnWidth / 80
            }
        }

        let [sizes, setSizes] = useState(
            initSizes(numColumns)
        )
        const firstLoad = useRef(true)
        useEffect(() => {
            if (!firstLoad.current) {
                console.log("setting sizes initSizes in rectangles")
                setSizes(initSizes(numColumns))
            }
        }, [numColumns, rowRef.current.scrollWidth])

        const svgRef = useRef(null)

        const onRowRefResize = useCallback(debounce(() => {
            console.log("resize table in rectangles")
            setSizes(initSizes(numColumns))
        }, 50), [rowRef.current.scrollWidth])

    useEffect(() => {
        window.addEventListener("resize", onRowRefResize)
        return () => window.removeEventListener("resize", onRowRefResize)
    }, [])

        const getPos = (x, y, width, height) => {
            return {
                width: (width * sizes.columnWidth) - sizes.strokeWidth * 3,
                height: (sizes.rowHeight * height) - sizes.strokeWidth * 3,
                x: sizes.strokeWidth * 1.5 + (x * sizes.columnWidth),
                y: y * sizes.rowHeight + sizes.strokeWidth / 2
            }
        }
        useEffect(() => {
            return () => {
                firstLoad.current = true
            }
        }, [])

        const container = {
            hidden: () => {
                console.log("container hidden animation:", firstLoad)
                return {}
            },
            show: (x) => {
                let duration = 5
                let delayChildren = 0
                let staggerChildren = (duration / rectangles.rectangles.length)
                if (x.current) {
                    x.current = false
                    delayChildren = 0.5
                    staggerChildren = Math.max(0.2, staggerChildren - 0.5)
                } else {
                    duration /= 2
                    staggerChildren = Math.max(0.2, staggerChildren - duration / 2)
                }
                const rv = {
                    transition: {
                        duration,
                        delayChildren,
                        staggerChildren,
                        ease: "easeIn"
                    }
                }

                console.log("container animation: ", x, rv)
                return rv
            }
        }

        const item = {
            hidden: {pathLength: 0},
            show: {pathLength: 1},
            exit: {pathLength: 0}
        }

        const rv = (
            <motion.svg
                viewBox={`0 0 ${sizes.rowWidth} ${sizes.rowHeight * numRows}`}
                ref={svgRef}
                style={{
                    position: "absolute",
                    top: `${sizes.rowHeight}px`,
                    left: `${sizes.columnWidth}px`,
                    width: `${sizes.rowWidth}px`,
                    height: `${sizes.rowHeight * numRows}px`,
                    pointerEvents: "none"
                }}
                initial={{opacity: 0}}
                animate={{opacity: 1, transition: {duration: 0.25}}}
            >
                <motion.g
                    variants={container}
                    initial="hidden"
                    animate="show"
                    exit="hidden"
                    custom={firstLoad}
                >
                    {
                        rectangles.rectangles.map((rect, i) => {
                            console.group("Drawing rectangle number ", i, "with rect", rect)
                            const pos = getPos(rect.pos.x, rect.pos.y, rect.width, rect.height)
                            const d = generatePath({strokeWidth: sizes.strokeWidth, ...pos}, rect.invisibleEdges)
                            let shouldHighlight = false
                            if(highlightRectangleIndexes !== null) {
                                shouldHighlight = !highlightRectangleIndexes.includes(i)
                            }
                            const rv = (
                                <motion.path
                                    className={
                                        [
                                            shouldHighlight ? karnaughStyles.svgHighlight : null,
                                            karnaughStyles.svgRect
                                        ].join(' ')
                                    }
                                    d={d}
                                    fill="none"
                                    strokeWidth={sizes.strokeWidth}
                                    stroke={rect.color}
                                    key={`${i}${d}`}
                                    variants={item}
                                />
                            )
                            console.groupEnd()
                            return rv
                        })
                    }
                </motion.g>
            </motion.svg>
        )
        console.groupEnd()
        return rv
    })
