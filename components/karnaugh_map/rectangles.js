import React, {useCallback, useEffect, useRef, useState} from "react"
import {motion} from "framer-motion"
import {Rectangles} from "../../project/rectangle"
import {debounce} from "lodash";
import karnaughStyles from "./karnaugh_map.module.scss"

export default React.memo(function SVGRectangles(props) {
    const {
        /** @type {Rectangles} */rectangles,
        numRows,
        numColumns,
        /** @type {HTMLTableRowElement}*/rowRef,

        /** @type {number|null|undefined}*/highlightRectangleIndex
    } = props
    console.groupCollapsed("Drawing rectangles, ", props)

    const initSizes = (numColumns) => {
        console.log("Setting column width with numColumns = ", numColumns)
        console.log("rowref width", rowRef.scrollWidth)
        const rowWidth = rowRef.scrollWidth
        const columnWidth = rowWidth / numColumns
        return {
            rowHeight: rowRef.scrollHeight,
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
    }, [numColumns])

    const svgRef = useRef(null)

    const onRowRefResize = useCallback(debounce(() => {
        console.log("resize table in rectangles")
        setSizes(initSizes(numColumns))
    }, 50), [])

    useEffect(() => {
        window.addEventListener("resize", () => onRowRefResize)
        return () => window.removeEventListener("resize", onRowRefResize)
    }, [])

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
        >
            {
                rectangles.rectangles.map((rect, i) => {
                    console.log("Drawing rectangle number ", i, "with rect", rect)
                    return (
                        <motion.rect
                            className={
                                [
                                    highlightRectangleIndex !== null &&
                                    highlightRectangleIndex !== i ? karnaughStyles.svgHighlight : null,
                                    karnaughStyles.svgRect
                                ].join(' ')
                            }
                            width={(rect.width * sizes.columnWidth) - sizes.strokeWidth}
                            height={(sizes.rowHeight * rect.height) - sizes.strokeWidth}
                            x={sizes.strokeWidth / 2 + ((rect.pos.x + 1) * sizes.columnWidth)}
                            y={sizes.strokeWidth / 2 + ((rect.pos.y + 1) * sizes.rowHeight)}
                            rx={sizes.strokeWidth}
                            ry={sizes.strokeWidth}
                            fill="none"
                            strokeWidth={sizes.strokeWidth}
                            stroke={rect.color}
                            key={i}
                        >
                        </motion.rect>
                    )
                })
            }
        </motion.svg>
    )
    console.groupEnd()
    return rv
})
