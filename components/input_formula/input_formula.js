import React, {useState, useEffect, useCallback, useReducer, useRef, useMemo} from "react"
import useStateWithLocalStorage from "../useStateWithLocalStorage"
import Statement from "../../project/statement";
import styles from './styles.module.scss'
import {debounce} from "lodash"

const initialState = {
    statement: null,
    isValid: null,
    errorMessage: "text",
    showErrorMessage: false
}

/**
 * @param {Object} state
 * @param {Object} action
 * @param {'add'|'show_error'} action.type
 * @param {string} action.text - statement text
 * @param {boolean} action.show - should show error message?
 */
function reducer(state, {type, text, show}) {
    switch (type) {
        case 'add': {
            let errorMessage
            let isValid = true
            let statement
            try {
                statement = new Statement(text.trim())
            } catch (error) {
                isValid = false
                errorMessage = error
            }
            return {
                statement: statement ?? state.statement,
                isValid,
                errorMessage: errorMessage ?? state.errorMessage
            }
        }
        case 'show_error': {
            return {
                ...state,
                showErrorMessage: show
            }
        }
    }
}

export default function InputFormula({onChange, dropDownInfusedStatement}) {
    let text, setText

    // if the below condition is not checked the useStateWithLocalStorage hook
    // will throw `window is undefined` error for N/A reasons
    if (process.browser) {
        [text, setText] =
            useStateWithLocalStorage(
                `${process.env.staticFolder}-input-formula-text`
            );
    } else {
        [text, setText] = useState('');
    }

    // https://reactjs.org/docs/hooks-reference.html#usereducer
    const [state, dispatch] = useReducer(reducer, initialState)
    let inputElem = useRef()
    useEffect(() => {
        inputElem.current.value = text
        dispatch({type: 'add', text})
    }, [])

    useEffect(() => {
        if (dropDownInfusedStatement) {
            console.log("Overwriting input formula with", dropDownInfusedStatement)
            setText(dropDownInfusedStatement)
            dispatch({type: 'add', text: dropDownInfusedStatement})
            inputElem.current.value = dropDownInfusedStatement
        }
    }, [dropDownInfusedStatement])

    useEffect(() => {
        if (state.statement) {
            onChange(state.statement)
        }
    }, [state.statement])

    // debounce
    // https://stackoverflow.com/questions/59358092/set-input-value-with-a-debounced-onchange-handler
    // https://stackoverflow.com/a/58594348/10854888
    let debouncedHandler = useCallback(debounce((text) => {
        dispatch({type: 'add', text})
    }, 200), [])

    return (<>
            <div
                className={[styles.error, state.showError && isValid === false ? styles.showError : ''].join(' ')}>
                {state.errorMessage.toString()}
            </div>
            <input
                autoComplete="off"
                autoCorrect="off"
                spellCheck="false"
                className={[state.isValid ? styles.valid : styles.invalid, styles.inputFormula].join(' ')}
                onChange={(event) => {
                    let newText = event.target.value.trim()
                    if (newText !== text) {
                        setText(newText)
                        debouncedHandler(newText)
                    }
                }}
                ref={inputElem}
                onMouseEnter={() => {
                    dispatch({type: 'show_error', show: true})
                }}
                onMouseLeave={() => {
                    dispatch({type: 'show_error', show: false})
                }}
            >
            </input>
        </>
    )
}

