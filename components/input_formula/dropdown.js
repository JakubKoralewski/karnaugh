import React, {useState} from "react"
import styles from "./dropdown.module.scss"
import {AnimatePresence, motion} from "framer-motion"

/** @typedef {string} Option*/
/** @typedef {({group: Option[], label: string}|Option)[]} Options*/
function DropDownArrow({style, arrowColor, onClick, active}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="8 10 8 4"
            className={[styles.dropDownArrow, active ? styles.dropDownArrowActive : null].join(' ')}
            onClick={onClick}
            style={{
                "--arrow-color": "black",
                ...style,
            }}
        >
            <path d="M12 14l-4-4h8z"/>
        </svg>
    )
}

const mainDivVariants = {
    "exit-top": {
        zIndex: [0, 0, 0],
        y: [0, -50, -100],
        opacity: [1, 0, 0],
    },
    "top": {
        y: -100,
        zIndex: 0,
        opacity: 0
    },
    "bottom": {
        y: 0,
        opacity: 1,
        zIndex: 50,
    }
}

/**
 * @param {Object} obj
 * @param {Options} obj.options
 */
export function DropDown({options, style, onOptionClick: onOptionParentClick, currentText}) {
    const [active, setActive] = useState(false)
    const onArrowClick = () => {
        setActive(old => !old)
    }
    const onOptionClick = (text) => {
        return () => {
            console.log("option", text, "clicked")
            onOptionParentClick(text)
            setActive(false)
        }
    }

    return (
        <>
            <DropDownArrow
                onClick={onArrowClick}
                style={style}
                active={active}
            />
            <AnimatePresence>
                {
                    active &&
                    <div
                        className={styles.dropDownContainer}
                        style={{
                            "--secondary-color": "lightgrey",
                            "--separator-color": "rgb(240,240,240)",
                            "--font-heading-color": "black",
                            ...style,
                        }}
                    >
                        <motion.div
                            className={styles.dropDown}
                            zIndex={40}
                            variants={mainDivVariants}
                            initial="top"
                            animate="bottom"
                            exit="exit-top"
                        >
                            {
                                options.map((opt, i) => {
                                    if (opt.group) {
                                        return (
                                            <motion.div
                                                key={i}
                                                className={styles.optGroup}
                                            >
                                                <div className={styles.label}>
                                                    {opt.label}
                                                </div>
                                                <div className={styles.options}>
                                                    {
                                                        opt.group.map((actual_opt, j) => {
                                                            return (
                                                                <Option
                                                                    key={j}
                                                                    value={actual_opt}
                                                                    onClick={onOptionClick(actual_opt)}
                                                                    className={
                                                                        currentText === actual_opt ?
                                                                            styles.dropDownActive :
                                                                            null
                                                                    }
                                                                />
                                                            )
                                                        })
                                                    }
                                                </div>
                                            </motion.div>
                                        )
                                    } else {
                                        return (
                                            <Option
                                                key={i}
                                                value={opt}
                                                onClick={onOptionClick(opt)}
                                            />
                                        )
                                    }
                                })
                            }
                        </motion.div>
                    </div>
                }
            </AnimatePresence>
        </>
    )
}

/**
 * @param {Object} obj
 * @param {Option} obj.value
 * */
function Option({value, onClick, className}) {
    return (
        <div className={[styles.option, className].join(' ')}>
            <span onClick={onClick}>
                {value}
            </span>
        </div>
    )
}
