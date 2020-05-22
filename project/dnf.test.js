import {getRectangles, getDnf} from "./dnf"
import {transformedTable, columnGrayCode, rowGrayCode, rowHeaders, columnHeaders} from "./dnf.fixtures"
import {test, expect, describe, beforeAll} from "@jest/globals";

const config = {transformedTable, columnGrayCode, rowGrayCode, rowHeaders, columnHeaders}

test('generates rectangles', () => {
    const generatedRectangles = getRectangles(config)
    expect(generatedRectangles).toBeDefined()
    expect(generatedRectangles).toHaveLength(6)
})

function visualizeMap({rowGrayCode, columnGrayCode, transformedTable}) {
    const rv = []
    let row = 0
    for(const rowCode of rowGrayCode) {
        rv.push([])
        for(const columnCode of columnGrayCode) {
            rv[row].push(transformedTable[rowCode.join('')][columnCode.join('')])
        }
        row++
    }
    return rv
}

describe('given it generates rectangles', () => {
    let rectangles
    beforeAll( () => {
        rectangles = getRectangles(config)
    })

    test('rectangles have right shape', () => {
        for(const rectangle of rectangles) {
            expect(rectangle.length === 1 || rectangle.length % 2 === 0).toBeTruthy()
        }
    })

    test('rectangles have only ones', () => {
        const twoDimensionalMap = visualizeMap({rowGrayCode, columnGrayCode, transformedTable})
        const rowLength = rowGrayCode.length
        const columnLength = columnGrayCode.length
        for(const rectangle of rectangles) {
            for(const cell of rectangle) {
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
        for(const rectangle of rectangles) {
            for(const cell of rectangle) {
                const row = Math.floor(cell / columnLength);
                const column = cell % columnLength
                twoDimensionalMap[row][column] = null
            }
        }
        for(const row of twoDimensionalMap) {
            expect(row.filter(x => !!x)).toHaveLength(0)
        }
    })
    //TODO: no larger possible combination of rectangles?

    test('generates dnf', () => {
        const dnf = getDnf({rectangles, ...config})
        expect(dnf).toBeDefined()
    })
})
