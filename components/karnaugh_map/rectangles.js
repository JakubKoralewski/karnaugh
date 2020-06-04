import React, {createRef, useCallback, useEffect, useRef, useState} from "react"
import {AnimatePresence, motion, useMotionValue} from "framer-motion"
import {Rectangles} from "../../project/rectangle"
import {debounce} from "lodash";
import karnaughStyles from "./karnaugh_map.module.scss"

export default function SVGRectangles(props) {
    const {
        /** @type {Rectangles} */rectangles,
        numRows,
        numColumns,
        /** @type {{current: HTMLTableRowElement}}*/rowRef,

        /** @type {number|null|undefined}*/highlightRectangleIndex
    } = props
    console.groupCollapsed("Drawing rectangles, ", props)

    const initSizes = (numColumns) => {
        console.log("Setting column width with numColumns = ", numColumns)
        console.log("rowref width", rowRef.current.scrollWidth)
        const rowWidth = rowRef.current.scrollWidth
        const columnWidth = rowWidth / numColumns
        return {
            rowHeight: rowRef.current.scrollHeight,
            rowWidth,
            columnWidth,
            strokeWidth: 4 + columnWidth / 80
        }
    }

    let [sizes, setSizes] = useState(
        initSizes(numColumns)
    )
    useEffect(() => {
        setSizes(initSizes(numColumns))
    }, [numColumns, rowRef.current.scrollWidth])

    const svgRef = useRef(null)

    const onRowRefResize = useCallback(debounce(() => {
        console.log("resize table in rectangles")
        setSizes(initSizes(numColumns))
    }, 50), [rowRef.current.scrollWidth])

    useEffect(() => {
        window.addEventListener("resize", () => onRowRefResize)
        return () => window.removeEventListener("resize", onRowRefResize)
    }, [])

    const getPos = (x, y, width, height) => {
        return {
            width: (width * sizes.columnWidth) - sizes.strokeWidth * 3,
            height: (sizes.rowHeight * height) - sizes.strokeWidth * 3,
            x: sizes.strokeWidth * 1.5 + ((x + 1) * sizes.columnWidth),
            y: ((y + 1) * sizes.rowHeight) + sizes.strokeWidth / 2
        }
    }
    const drawRectPath = ({x, y, width: w, height: h}, r = sizes.strokeWidth) => {
        return `M${x},${y} h${w} a${r},${r} 0 0 1 ${r},${r} v${h} a${r},${r} 0 0 1 -${r},${r} h-${w} a${r},${r} 0 0 1 -${r},-${r} v-${h} a${r},${r} 0 0 1 ${r},-${r} z`
    }

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                duration: 5,
                delayChildren: 0.5,
                staggerChildren: 0.25
            }
        }
    }

    const item = {
        hidden: { pathLength: 0 },
        show: { pathLength: 1}
    }

    const rv = (
        <motion.svg
            viewBox={`0 0 ${sizes.rowWidth} ${sizes.rowHeight * numRows}`}
            ref={svgRef}
            style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: `${sizes.rowWidth}px`,
                height: `${sizes.rowHeight * numRows}px`,
                pointerEvents: "none"
            }}
            variants={container}
            initial="hidden"
            animate="show"
        >
            {
                rectangles.rectangles.map((rect, i) => {
                    console.group("Drawing rectangle number ", i, "with rect", rect)
                    const pathLength = 10
                    const pos = getPos(rect.pos.x, rect.pos.y, rect.width, rect.height)
                    const d = drawRectPath(pos)
                    console.groupEnd()
                    return (
                        <motion.path
                            className={
                                [
                                    highlightRectangleIndex !== null &&
                                    highlightRectangleIndex !== i ? karnaughStyles.svgHighlight : null,
                                    karnaughStyles.svgRect
                                ].join(' ')
                            }
                            d={d}
                            fill="none"
                            strokeWidth={sizes.strokeWidth}
                            stroke={rect.color}
                            key={i}
                            variants={item}
                        />
                    )
                })
            }
        </motion.svg>
    )
    console.groupEnd()
    return rv
}

