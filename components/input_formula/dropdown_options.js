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
            "p & q & r & (s & ~s) || ((~r & ~s) || (r & ~s))",
            "p & q & r & (s & ~s) || ((~p & ~q) || (p & ~q))",
            "p & q & (r & ~r) & s || (~s & ~q)",
            "p & q & r & (s & ~s) || (~q & ~ t)"
        ]
    },
    {
        label: "Problems",
        group: [
            "(~p || ~q || r) || (s & ~s & t)",
        ]
    },
    {
        label: "Interesting examples",
        group: [
            "p <-> q <-> r <-> s <-> t",
        ]
    }
]
