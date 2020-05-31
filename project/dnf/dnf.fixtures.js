const transformedTable = {
    "100": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    },
    "101": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    },
    "110": {
        "10": true,
        "11": false,
        "01": false,
        "00": true
    },
    "111": {
        "10": false,
        "11": true,
        "01": false,
        "00": true
    },
    "011": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    },
    "010": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    },
    "001": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    },
    "000": {
        "10": true,
        "11": true,
        "01": true,
        "00": true
    }
}


const rowHeaders = [
    "p",
    "t",
    "z"
]

const columnHeaders = [
    "q",
    "d"
]

const rowGrayCode = [
    [
        0,
        0,
        0
    ],
    [
        0,
        0,
        1
    ],
    [
        0,
        1,
        1
    ],
    [
        0,
        1,
        0
    ],
    [
        1,
        1,
        0
    ],
    [
        1,
        1,
        1
    ],
    [
        1,
        0,
        1
    ],
    [
        1,
        0,
        0
    ]
]

const columnGrayCode = [
    [
        0,
        0
    ],
    [
        0,
        1
    ],
    [
        1,
        1
    ],
    [
        1,
        0
    ]
]


const table = {
    "statement": "p -> t -> ( z & q <-> d)",
    "variables": [
        "p",
        "t",
        "z",
        "q",
        "d"
    ],
    "rows": [
        {
            "p": true,
            "t": true,
            "z": true,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": true,
            "t": true,
            "z": true,
            "q": true,
            "d": false,
            "eval": false
        },
        {
            "p": true,
            "t": true,
            "z": true,
            "q": false,
            "d": true,
            "eval": false
        },
        {
            "p": true,
            "t": true,
            "z": true,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": true,
            "z": false,
            "q": true,
            "d": true,
            "eval": false
        },
        {
            "p": true,
            "t": true,
            "z": false,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": true,
            "z": false,
            "q": false,
            "d": true,
            "eval": false
        },
        {
            "p": true,
            "t": true,
            "z": false,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": true,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": true,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": true,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": true,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": false,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": false,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": false,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": true,
            "t": false,
            "z": false,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": true,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": true,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": true,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": true,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": false,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": false,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": false,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": true,
            "z": false,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": true,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": true,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": true,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": true,
            "q": false,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": false,
            "q": true,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": false,
            "q": true,
            "d": false,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": false,
            "q": false,
            "d": true,
            "eval": true
        },
        {
            "p": false,
            "t": false,
            "z": false,
            "q": false,
            "d": false,
            "eval": true
        }
    ]
}

const expectedOutput = [
    [
        0,
        1,
        2,
        3,
        4,
        5,
        6,
        7,
        8,
        9,
        10,
        11,
        12,
        13,
        14,
        15
    ],
    [
        16
    ],
    [
        19
    ],
    [
        20
    ],
    [
        22
    ],
    [
        24,
        25,
        26,
        27,
        28,
        29,
        30,
        31
    ]
]

export {transformedTable, columnHeaders, rowHeaders, rowGrayCode, columnGrayCode}
