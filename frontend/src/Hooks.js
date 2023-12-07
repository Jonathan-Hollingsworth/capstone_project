import { useState } from "react";

function useLocalStorage(key, initVal) {
    const [val, setVal] = useState(initVal)
    localStorage.setItem(key, val)

    function setLocalStorage(value) {
        setVal(value)
        if (val) {
            localStorage.setItem(key, val)
        } else {
            localStorage.removeItem(key)
        }
    }

    return [val, setLocalStorage]
}

export default useLocalStorage