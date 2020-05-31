import {abstractTo1D} from "./utils"

const otherFixturesAbstracted = [
    {
        input: [
            [1, 1, 0, 1],
            [1, 1, 1, 1]
        ],
        output: [
            [0, 1, 4, 5],
            [4, 5, 6, 7],
            [3, 7]
        ],
        description: `Non 2^n overlapping`
    }
]

const fixtures = abstractTo1D(otherFixturesAbstracted)()

export default {
    description: "Rectangles correctly overlap to achieve largest rectangles",
    fixtures
}
