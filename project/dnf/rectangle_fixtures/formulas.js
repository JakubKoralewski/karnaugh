import {abstractTo1D} from "./utils"

const otherFixturesAbstracted = [
    {
        input: [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 0, 0, 1],
            [1, 0, 1, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1]
        ],
        output: [
                [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
                [7,11,15,19],
                [16,20,24,28],
                [22,26],
                [24,25,26,27,28,29,30,31]
            ],
        description:
            `Formula: p -> t -> ( z & q <-> d)`
    }
]

const fixtures = abstractTo1D(otherFixturesAbstracted)()

export default {
    description: "Actual formulas",
    fixtures
}
