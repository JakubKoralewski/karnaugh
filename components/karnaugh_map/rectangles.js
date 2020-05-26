import React from "react"
import {motion} from "framer-motion"
import { Rectangle, Rectangles } from "../../project/rectangle"

export default React.memo(function SVGRectangles(props) {
    const {/** @type {Rectangles} */rectangles, numRows, numColumns, rowHeight, rowWidth} = props
    console.group("Drawing SVG rectangles: ", props)
    const columnWidth = rowWidth / numColumns
    const strokeWidth = 4 + columnWidth/80
    console.groupEnd()
    const rv = (
        <motion.svg
            viewBox={`0 0 ${rowWidth} ${rowHeight * numRows}`}
            style={{
                position: "absolute",
                top: "0px",
                left: "0px",
                width: `${rowWidth}px`,
                height:`${rowHeight*numRows}px`,
                pointerEvents: "none"
            }}
        >
            {
                rectangles.rectangles.map((rect,i) => {
                    console.log("Drawing rectangle number ", i, "with rect", rect)
                    return (
                        <motion.rect
                            width={(rect.width * columnWidth) - strokeWidth }
                            height={(rowHeight * rect.height)-strokeWidth}
                            x={strokeWidth/2 + ((rect.pos.x + 1) * columnWidth)}
                            y={strokeWidth/2 + ((rect.pos.y + 1) * rowHeight)}
                            rx={strokeWidth}
                            ry={strokeWidth}
                            fill="none"
                            strokeWidth={strokeWidth}
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
