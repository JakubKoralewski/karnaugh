import {abstractTo1D} from "./utils"

const otherFixturesAbstracted = [
    {
        input: [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ],
        output: [
            new Array(4*4).fill(0).map((_,i) => i),
            [0,1,2,3, ...new Array(4*4).fill(0).map((_,i) => 5*4+i)],
        ],
        description: `Wrapping vertically bottom to top`
    },
    {
        input: [
            [1, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 0, 0, 1],
        ],
        output: [
            [0, 3, 12, 15]
        ],
        description: `Wrapping diagonally https://commons.wikimedia.org/wiki/File:Karnaugh_map_KV_Torus_1.png`
    },
    {
        input: [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
        ],
        output: [
            [0, 3, 4, 7, 8, 11, 12, 15]
        ],
        description: `Wrapping horizontally left/right`
    },

]

const fixtures = abstractTo1D(otherFixturesAbstracted)()

export default {
    description: "Rectangles correctly wrap according to the torus topology rules",
    fixtures
}
