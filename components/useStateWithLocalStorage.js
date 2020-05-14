import React from "react";

const useStateWithLocalStorage = localStorageKey => {
    const [value, setValue] = React.useState(
        window ? (window.localStorage.getItem(localStorageKey) || '') : ''
    );

    React.useEffect(() => {
        window.localStorage.setItem(localStorageKey, value);
    }, [value]);

    return [value, setValue];
}
export default useStateWithLocalStorage