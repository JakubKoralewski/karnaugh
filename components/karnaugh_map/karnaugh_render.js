import React, {useCallback, useEffect, useRef, useState} from "react"
import slideStyles from "../presentation/slide.module.scss"
import inputFormulaStyles from "../input_formula.module.scss"

// https://gist.github.com/renaudtertrais/25fc5a2e64fe5d0e86894094c6989e10
const zip = (arr, ...arrs) => {
    return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
}

export function CellRender(props) {
    // let [elems, setElems] = useState([])
    let {cell, refs, cellKey, isLast, show} = props
    console.log("cell render key: ", cellKey)
    let thisRef = useRef(null)
    let thisRefCallback = useCallback((node) => {
        if (node !== null) {
            thisRef.current = node
        }
    }, [])
    useEffect(() => {
        console.group("render cell props: ", props)
        let allRefs = refs ? Object.values(refs) : null
        let table
        //         Need to check if ref has ref to elem, cuz it can have null current
        if (refs && allRefs[0] && (allRefs[0].current || allRefs[0][0].current)) {
            const parent = document.body.querySelector(`.${slideStyles.slide}`)
            table = parent.querySelector(`.${slideStyles.slide} > table`)
            if (!table) {
                table = document.createElement("table")
                table.classList.add(inputFormulaStyles.truthTable)
                table.style.display = "contents"
                parent.appendChild(table)
            }
            let correspondingRefs
            if (cell.keys !== null) {
                // make the refs be ordered in a horizontal fashion
                correspondingRefs = zip(...cell.keys.map(k => refs[k].map(r => ({
                    variableName: k.slice(0,4) === "eval" ? "eval" : k[0],
                    eval: k[k.length-1],
                    ref: r
                }))))
                correspondingRefs = correspondingRefs.flat()
            } else {
                correspondingRefs = Object.entries(refs).map(([variableName, ref ]) => ({variableName, ref}))
            }
            let row = document.createElement('tr')
            let i = 0
            for (const refObj of correspondingRefs) {
                //FIXME: refObj is undefined
                let {ref, variableName, eval: variableEval} = refObj
                let elem = ref.current
                let thisElem = thisRef.current
                let thisBB = thisElem.getBoundingClientRect()
                let rangeInfo = {left: 0}
                if (document.createRange) {
                    const textNode = thisElem.childNodes[0]
                    let textPos = textNode.nodeValue.indexOf(elem.innerText.trim())
                    if (cell.variables) {
                        let newTextPos = cell.variables.indexOf(variableName)
                        if(newTextPos !== -1) {
                            textPos = newTextPos
                        }
                    }
                    const range = document.createRange()
                    range.setStart(textNode, 0)
                    range.setEnd(textNode, 0)
                    const rangeFirstBB = range.getBoundingClientRect()
                    range.setStart(textNode, textPos)
                    range.setEnd(textNode, textPos)
                    const rangeBB = range.getBoundingClientRect()
                    //FIXME: headings not lined up, padding? (+5 trick)
                    rangeInfo = {
                        left:
                            (thisBB.left - rangeBB.left) -
                            (
                                cell.keys ?
                                    (thisBB.left - rangeFirstBB.left)
                                    : 0
                            ) + ((!cell.keys || !cell.keys[0].includes('eval')) ? 8 : 0)
                    }
                }
                let bb = elem.getBoundingClientRect()
                let thisElemTop = thisElem.offsetTop + thisElem.offsetParent.offsetTop
                let thisElemLeft = thisElem.offsetLeft + thisElem.offsetParent.offsetLeft
                let topPos = elem.offsetTop + elem.offsetParent.offsetTop
                let leftPos = elem.offsetLeft + elem.offsetParent.offsetLeft
                let clonedElem = elem.cloneNode(1)
                if (cell.keys && !cell.keys[0].includes('eval')) {
                    let newClonedElem = document.createElement('th')
                    newClonedElem.innerText = clonedElem.innerText
                    clonedElem = newClonedElem
                }
                Object.assign(clonedElem.style, {
                    position: "absolute",
                    left: `${leftPos}px`,
                    top: `${topPos}px`,
                    width: `${bb.width}px`,
                    height: `${bb.height}px`,
                    border: 'none',
                    fontSize: `1.5rem`,
                    // backgroundColor: cell.keys && !cell.keys[0].includes('eval') ? "white" : "inherit",
                    backgroundColor: "transparent",
                    fontWeight: !cell.keys ? `600` : !cell.keys[0].includes('eval') ? `600` : `300`,
                    transition: `transform 4s, width 4s, height 4s, opacity 1s 3.5s`,
                    padding: '0.5rem 0rem',
                    zIndex: 10,
                    // mixBlendMode: 'darken'
                })
                let cellWait = 0
                if (cell.keys && !cell.keys[0].includes('eval')) {
                    cellWait = cellKey * 1000;
                }

                row.appendChild(clonedElem)
                setTimeout(() => {
                    Object.assign(clonedElem.style, {
                        transform: `translate(${thisElemLeft - leftPos - rangeInfo.left}px, ${thisElemTop - topPos}px)`,
                        width: cell.keys ? `${thisBB.width}px` : undefined,
                        height: `${thisBB.height}px`,
                        // backgroundColor: cell.keys && !cell.keys[0].includes('eval') ? "lightgray" : "inherit",
                        opacity: 0
                    })
                }, 10 + i * 100 + cellWait)
                setTimeout(() => {
                    thisElem.style.opacity = 1;
                    if (isLast) {
                        if (table.parentNode) {
                            // table.parentNode.removeChild(table)
                        }
                    }
                }, 3000 + correspondingRefs.length * 100 + cellWait)
                console.log("corresponding elem: ", elem)
                i++
            }
            table.appendChild(row)
        } else {
            console.log("null refs")
        }
        console.groupEnd()
        return () => table ? table.innerHTML = '' : null
    }, [refs])

    useEffect(() => {
        if(thisRef.current && !show) {
            thisRef.current.style.opacity = 0
        }
    }, [show])

    const style = {
        opacity: 0,
        transition: "opacity 0.25s"
    }


    return (
        cell.isHeader ?
            <th ref={refs ? thisRefCallback : null} style={style}>
                {cell.value}
            </th>
            :
            <td ref={refs ? thisRefCallback : null} style={style}>
                {cell.value}
            </td>
    )
}
