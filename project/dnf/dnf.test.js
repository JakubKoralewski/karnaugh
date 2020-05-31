import {getRectangles, getDnf, testables} from "./dnf"
import {transformedTable, columnGrayCode, rowGrayCode, rowHeaders, columnHeaders} from "./dnf.fixtures"
import {test, expect, describe, beforeAll} from "@jest/globals";
import rectangleFixtures from "./rectangle_fixtures"

function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; ++i) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

expect.extend({
    /**
     * @param {Array.<Array.<number>>} expected
     * @param {Array.<Array.<number>>} actual
     */
    toBeArrayContainingTheSameArraysAs(actual, expected) {
        if (expected == null || actual == null) {
            return {
                pass: false,
                message: () => `Can't compare nulls`
            }
        }

        if (!(expected instanceof Array) || !(actual instanceof Array)) {
            return {
                pass: false,
                message: () => `Can only compare arrays. Expected was: "${expected}". Actual was "${actual}".`
            }
        }

        if (expected.length !== actual.length) {
            return {
                pass: false,
                message: () =>
                        `Length of expected (${expected.length}) was different from actual length (${actual.length}).
                        Expected was: "${JSON.stringify(expected)}". 
                        Actual was: "${JSON.stringify(actual)}".`
            }
        }

        if (expected.length === 0) {
            return {
                pass: true,
                message: () => `Two empty arrays are equal`
            }
        }

        expected.forEach((expArr, i) => {
            let found = false
            for (const actArr of actual) {
                if (arraysEqual(actArr, expArr)) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                return {
                    pass: false,
                    message: () => `Couldn't find expected's ${i}-th array (${expArr}) inside actual array.
                    Expected was: ${JSON.stringify(expected)}.
                    Actual was: ${JSON.stringify(actual)}`
                }
            }
        })
        return {
            pass: true,
            message: () => `Arrays contain same arrays`
        }
    }
})
describe("custom toBeArrayContainingTheSameArraysAs extend", () => {
    test("different order same contents equal", () => {
        expect([[1,2,3], [1,2,2]]).toBeArrayContainingTheSameArraysAs([[1,2,2], [1,2,3]])
    })

    test("same order same contents equal", () => {
        expect([[1,2,3], [1,2,2]]).toBeArrayContainingTheSameArraysAs([[1,2,3], [1,2,2]])
    })
    test("different lengths are not equal", () => {
        expect([[1,2,3]]).not.toBeArrayContainingTheSameArraysAs([[1,2,3], [1,2,2]])
    })
    test("empty arrays are equal", () => {
        expect([]).toBeArrayContainingTheSameArraysAs([])
    })
    test("throws when wrong args", () => {
        expect("xd").not.toBeArrayContainingTheSameArraysAs([])
    })
})

describe("rectangle fixtures", () => {
    for (const fixture of rectangleFixtures) {
        describe(fixture.description, () => {
            for (const fixtureElement of fixture.fixtures) {
                test(fixtureElement.description, () => {
                    expect(
                        testables._getRectangles(
                            fixtureElement
                        )
                    ).toBeArrayContainingTheSameArraysAs(fixtureElement.output)
                })
            }
        })
    }
})

const config = {transformedTable, columnGrayCode, rowGrayCode, rowHeaders, columnHeaders}

test('generates rectangles', () => {
    const generatedRectangles = getRectangles(config)
    expect(generatedRectangles).toBeDefined()
    expect(generatedRectangles).toHaveLength(6)
})

function visualizeMap({rowGrayCode, columnGrayCode, transformedTable}) {
    const rv = []
    let row = 0
    for (const rowCode of rowGrayCode) {
        rv.push([])
        for (const columnCode of columnGrayCode) {
            rv[row].push(transformedTable[rowCode.join('')][columnCode.join('')])
        }
        row++
    }
    return rv
}

describe('given it generates rectangles', () => {
    let rectangles
    beforeAll(() => {
        rectangles = getRectangles(config)
    })

    test('rectangles have right shape', () => {
        for (const rectangle of rectangles) {
            expect(rectangle.length === 1 || rectangle.length % 2 === 0).toBeTruthy()
        }
    })

    test('rectangles have only ones', () => {
        const twoDimensionalMap = visualizeMap({rowGrayCode, columnGrayCode, transformedTable})
        const rowLength = rowGrayCode.length
        const columnLength = columnGrayCode.length
        for (const rectangle of rectangles) {
            for (const cell of rectangle) {
                const row = Math.floor(cell / columnLength);
                const column = cell % columnLength
                expect(twoDimensionalMap[row][column]).toBe(true)
            }
        }
    })
    test('no ones are left out', () => {
        const twoDimensionalMap = visualizeMap({rowGrayCode, columnGrayCode, transformedTable})
        const rowLength = rowGrayCode.length
        const columnLength = columnGrayCode.length
        for (const rectangle of rectangles) {
            for (const cell of rectangle) {
                const row = Math.floor(cell / columnLength);
                const column = cell % columnLength
                twoDimensionalMap[row][column] = null
            }
        }
        for (const row of twoDimensionalMap) {
            expect(row.filter(x => !!x)).toHaveLength(0)
        }
    })
    //TODO: no larger possible combination of rectangles?

    test('generates dnf', () => {
        const dnf = getDnf({rectangles, ...config})
        expect(dnf).toBeDefined()
    })
})
