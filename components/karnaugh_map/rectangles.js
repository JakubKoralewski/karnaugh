import React, {useCallback, useEffect, useReducer, useRef} from "react"
import {motion} from "framer-motion"
import {Rectangles} from "../../project/rectangle"
import {debounce} from "lodash";

export default React.memo(function SVGRectangles(props) {
    const {/** @type {Rectangles} */rectangles, numRows, numColumns, /** @type {HTMLTableRowElement}*/rowRef} = props
    const watcherSizes = (state) => {
        const columnWidth = state.rowWidth / numColumns
        return {
            ...state,
            columnWidth,
            strokeWidth: 4 + columnWidth / 80
        }
    }
    const sizesReducer = () => {
        const newState = {
            rowHeight: rowRef.scrollHeight,
            rowWidth: rowRef.scrollWidth,
        }
        return watcherSizes(newState)

    }
    const initSizes = (init) => {
        return watcherSizes(init)
    }

    let [sizes, dispatch] = useReducer(
        sizesReducer,
        {
            rowHeight: rowRef.scrollHeight,
            rowWidth: rowRef.scrollWidth
        },
        initSizes
    )

    const svgRef = useRef(null)

    console.group("Drawing SVG rectangles: ", props)
    const onRowRefResize = useCallback(debounce(() => {
        console.log("resize")
        dispatch()
    }, 50), [])
    useEffect(() => {
        window.addEventListener("resize", onRowRefResize)
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
