import {test, expect, describe, beforeAll} from "@jest/globals"
import {arraysEqual} from "./dnf/dnf.test"
import {Rectangle, Rectangles} from "./rectangle"

expect.extend({
    /**
     * @param {{right: number[], top: number[], left: number[], bottom: number[]}} actual
     * @param {{right: number[], top: number[], left: number[], bottom: number[]}} expected
     */
    toWrapTheSameAs(actual, expected) {
        const expectedPrint = JSON.stringify(expected)
        const actualPrint = JSON.stringify(actual)
        if (expected === null || actual === null) {
            return {
                pass: false,
                message: () => `Can't compare nulls`
            }
        }

        if (!(expected instanceof Object) || !(actual instanceof Object)) {
            if(expected === undefined && actual === undefined) {
                return {
                    pass: true,
                    message: () => `Both undefined, allowed.`
                }
            }
            return {
                pass: false,
                message: () => `Can only compare objects. Expected was: "${expectedPrint}". Actual was "${actualPrint}".`
            }
        }

        const keys = Object.keys(expected)
        if (keys.length === 0) {
            return {
                pass: false,
                message: () => `Expected object should have more than 0 keys!.\n. Expected was ${expectedPrint}.`
            }
        }

        for(const expectedKey of keys) {
            if (!arraysEqual(expected[expectedKey], actual[expectedKey])) {
                return {
                    pass: false,
                    message: () => `${expectedKey} should be the same in both.
                    Expected was: ${expectedPrint}.
                    Actual was: ${actualPrint}`
                }
            }
        }
        return {
            pass: true,
            message: () => `Correct comparison`
        }
    }
})


const wrapFixtures = [
    {
        visual: [
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
        ],
        input: [
            [0, 1, 2, 3, 12, 13, 14, 15]
        ],
        output: [
            {
                top: [0, 1, 2, 3],
                bottom: [12, 13, 14, 15],
                left: [],
                right: []
            }
        ],
        description: `Wrapping horizontally bottom to top`
    },
    {
        visual: [
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
            [1, 1, 1, 1],
        ],
        input: [
            new Array(4 * 4).fill(0).map((_, i) => i),
            new Array(2 * 4).fill(0).map((_, i) => 5 * 4 + i),
            [
                ...new Array(2 * 4).fill(0).map((_, i) => i),
                ...new Array(2 * 4).fill(0).map((_, i) => 6 * 4 + i)
            ],
        ],
        output: [
            undefined,
            undefined,
            {
                top: new Array(2 * 4).fill(0).map((_, i) => i),
                bottom: new Array(2 * 4).fill(0).map((_, i) => 6 * 4 + i),
                left: [],
                right: []
            }
        ],
        description: `Wrapping vertically bottom to top with one rectangle weird`
    },
    {
        visual: [
            [1, 0, 0, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 0, 0, 1],
        ],
        input: [
            [0, 3, 12, 15]
        ],
        output: [
            {
                top: [0, 3],
                bottom: [12, 15],
                left: [0, 12],
                right: [3, 15]
            }
        ],
        description: `Wrapping diagonally https://commons.wikimedia.org/wiki/File:Karnaugh_map_KV_Torus_1.png`
    },
    {
        visual: [
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
            [1, 0, 0, 1],
        ],
        input: [
            [0, 3, 4, 7, 8, 11, 12, 15]
        ],
        output: [
            {
                left: [0, 4, 8, 12],
                right: [3, 7, 11, 15],
                top: [],
                bottom: []
            }
        ],
        description: `Wrapping horizontally left/right`
    },

]

describe("custom extend toWrapTheSameAs", () => {
    test("should fail for different numbers", () => {
        expect(
            {
                left: [-1, -2, -3],
                right: [-1, -2, -3],
                top: [-1, -2, -3],
                bottom: [-1, -2, -3]
            }
        ).not.toWrapTheSameAs(
            {
                left: [1, 2, 3],
                right: [-1, -2, -3],
                top: [-1, -2, -3],
                bottom: [-1, -2, -3],
            }
        )
    })
    test("should work for same numbers", () => {
        expect(
            {
                left: [-1, -2, -3],
                right: [-1, -2, -3],
                top: [-1, -2, -3],
                bottom: [-1, -2, -3]
            }
        ).toWrapTheSameAs(
            {
                left: [-1, -2, -3],
                right: [-1, -2, -3],
                top: [-1, -2, -3],
                bottom: [-1, -2, -3],
            }
        )
    })
})

describe("wrapping detection", () => {
    for (const fixture of wrapFixtures) {

        describe(fixture.description, () => {

            const rectangles = new Rectangles(
                {
                    rectangles: fixture.input,
                    rowLength: fixture.visual[0].length,
                    columnHeight: fixture.visual.length
                }
            )

            rectangles.rectangles.forEach(
                /** @param {Rectangle} rectangle
                 *  @param {number} rectangleIndex
                 */
                (rectangle, rectangleIndex) => {
                    test(`${rectangleIndex}-th rectangle matches`, () => {
                        expect(rectangle._wrappingRectangles).toWrapTheSameAs(fixture.output[rectangleIndex])
                    })
                })


        })

    }
})
