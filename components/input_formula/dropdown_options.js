/** @type {Options}*/
export default [
    {
        label: "Single variable",
        group: [
            "x || ~x",
            "x & ~x",
            "x"
        ]
    },
    {
        label: "Wrapping",
        group: [
            "(~p || ~q || r) || (s & ~s & t)",
            "p <-> q <-> r <-> s <-> t",
            "(p & q & r & s & ~p) || (~q & ~ t)"
        ]
    }
]
