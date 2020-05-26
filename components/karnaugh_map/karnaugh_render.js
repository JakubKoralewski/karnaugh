import React, {useCallback, useEffect, useRef, useState} from "react"
import slideStyles from "../presentation/slide.module.scss"
import inputFormulaStyles from "../input_formula.module.scss"

// https://gist.github.com/renaudtertrais/25fc5a2e64fe5d0e86894094c6989e10
const zip = (arr, ...arrs) => {
    return arr.map((val, i) => arrs.reduce((a, arr) => [...a, arr[i]], [val]));
}
/** Cell Render. Can return both `<th>` and `<td>` elements.
 *  @param {Object} props
 *
 *  @param {Object} props.cell
 *  @param {Array.<string> | null} props.cell.keys - identifier of particular cell, possibly corresponding to
 *      a table cell, if keys is null then the cell is top-left-most variable header.
 *      Keys have the following structure:
 *      a) `${variableNames}${variableValues}`
 *      b) `eval${variableValues}${evalValue}`
 *  @param {boolean} props.cell.isHeader - whether to display `<th>` or `<td>`
 *  @param {string} props.cell.value - text value to be displayed inside element
 *  @param {Array.<string>} props.cell.variables - list of variables in that column/row header
 *      It is used for animation target position, when a particular row/column has more than one T/F
 *      variable, to accurately animate to the correct position.
 *  @param {Rectangle | undefined} props.cell.rectangle - if we're not a header,
 *      corresponding rectangle, used to extract color information about current cell
 *
 *  @param {Object.<{current: HTMLElement | undefined}>} props.refs - all refs (including those not related
 *      to this particular cell!)
 *
 *  @param {boolean} props.show - based on `KarnaughMap`'s `onlyHeaders` prop, whether to show cell
 *
 */
export function CellRender(props) {
    let {
        cell,
        refs,
        cellKey,
        isLast,
        show=true,
        naSymbol="*",
        style: parentStyle,
        ...restOfProps
    } = props

    console.group("cell render key: ", cellKey)
    let thisRef = useRef(null)
    let thisRefCallback = useCallback((node) => {
        if (node !== null) {
            thisRef.current = node
        }
    }, [])
    useEffect(() => {
        console.group("render cell props: ", props)

        // allRefs used only to check if refs.current are not null
        let allRefs = refs ? Object.values(refs) : null
        let table

        //         Need to check if ref has ref to elem, cuz it can have null current
        // refs - make sure refs were passed
        // !allRefs[0].ref - grant access if this cell is the top-left most header
        // allRefs[0] - before checking the next make sure the first element even exists
        // allRefs[0][0].current - make sure refs are not null
        if (refs && (allRefs[0].ref || (allRefs[0] && (allRefs[0][0].current)))) {
            const parent = document.body.querySelector(`.${slideStyles.slide}`)
            table = parent.querySelector(`.${slideStyles.slide} > table`)
            if (!table) {
                table = document.createElement("table")
                table.classList.add(inputFormulaStyles.truthTable)
                table.style.display = "contents"
                parent.appendChild(table)
            }
            let correspondingRefs = []
            if (cell.keys !== null) {
                // make the refs be ordered in a horizontal fashion
                // for animation purposes
                const toBeZipped = []
                for(const key of cell.keys) {
                    if(!(key in refs)) {
                        if(key[key.length-1] === naSymbol) {
                            continue;
                        } else {
                            console.error("key of truth table cell in karnaugh map does not exist")
                            continue;
                        }
                    }
                    toBeZipped.push(refs[key].map(r => ({
                        variableName: key.slice(0,4) === "eval" ? "eval" : key[0],
                        eval: key[key.length-1],
                        ref: r
                    })))
                }
                if(toBeZipped.length > 0) {
                    correspondingRefs = zip(...toBeZipped)
                    correspondingRefs = correspondingRefs.flat()
                } else {
                    // No corresponding refs from table,
                    // meaning undefined, e.g. `p&p` `0&1`
                    thisRef.current.style.opacity = 1;
                }
            } else {
                // cell.keys is null; therefore the current cell is the top left header with variable names
                correspondingRefs = refs
            }
            let row = document.createElement('tr')
            let i = 0
            for (const refObj of correspondingRefs) {
                let {ref, variableName, eval: variableEval} = refObj
                let elem = ref.current
                let thisElem = thisRef.current
                let thisBB = thisElem.getBoundingClientRect()
                let rangeInfo = {left: 0}
                if (document.createRange) {
                    // If the browser has this API, try to get the exact position
                    // of each variable in the headers for more accurate animation
                    const textNode = thisElem.childNodes[0]
                    let textPos = textNode.nodeValue.indexOf(elem.innerText.trim())
                    if (cell.variables && cell.isHeader) {
                        // Fix problem when header is, e.g.: `FF`
                        let newTextPos = cell.variables.indexOf(variableName)
                        if(newTextPos !== -1) {
                            textPos = newTextPos
                        }
                    }
                    if (cell.keys === null) {
                        // Fix problem when left-top-most header has repeating variables
                        /* @author https://stackoverflow.com/a/14482123 */
                        function nthIndex(str, pat, n){
                            const L= str.length;
                            let i= -1;
                            while(n-- && i++<L){
                                i= str.indexOf(pat, i);
                                if (i < 0) break;
                            }
                            return i;
                        }
                        let newTextPos = nthIndex(textNode.nodeValue, variableName, refObj.i+1)
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
                    // row headers
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
                            // Remove the whole animated table which in this scope should be
                            // invisible now anyway
                            table.parentNode.removeChild(table)
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

    let style = {
        // invisible at first if animation, otherwise just show it
        opacity: refs ? 0 : show ? 1 : 0,
        transition: "opacity 0.25s",
        ...parentStyle
    }
    if(cell.keys && cell.rectangle) {
        // DNF Rectangle supplied
        style.backgroundColor = cell.rectangle.color.slice(0, cell.rectangle.color.length-1) + ',0.3)'
        // style.backgroundColor = cell.rectangle.color
    }

    console.groupEnd()
    return (
        cell.isHeader ?
            <th ref={refs ? thisRefCallback : null} style={style} key={cellKey} {...restOfProps}>
                {cell.value}
            </th>
            :
            <td ref={refs ? thisRefCallback : null} style={style} key={cellKey} {...restOfProps}>
                {cell.value}
            </td>
    )
}
