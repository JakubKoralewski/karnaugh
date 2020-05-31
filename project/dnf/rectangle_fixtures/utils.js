const assert = require("assert")
/**
 * @param {[{output: number[][], input: number[][], description: string}]} inputFixtures
 * @yields {{values: number[], output: number[][], description: string}}
 */
export function abstractTo1D(inputFixtures) {
    return function*() {
        for(const fixture of inputFixtures) {
            assertValid2DFixture(fixture)
            const oneD = new Array(fixture.input.length*fixture.input.length)
            fixture.input.forEach((row, i) => {
                row.forEach((val, j) => {
                    oneD[i*row.length + j] = val
                })
            })
            yield {
                colCount: fixture.input[0].length,
                values: oneD,
                ...fixture
            }
        }
    }
}
/**
 * @param {{input: Array.<Array.<number>>}} fixture
 * @return {boolean} true if valid, else throws error
 */
export function assertValid2DFixture(fixture) {
    if(fixture.input.length === 0) {
        return true
    }
    const isPowerOfTwo = (x) => {
        return (x !== 0) && ((x & (x - 1)) === 0)
    }
    if(fixture.input.length !== 1) {
        assert.strictEqual(fixture.input.length % 2, 0, `Rows can't have odd number. ${JSON.stringify(fixture)}`)
        assert.strictEqual(isPowerOfTwo(fixture.input.length), true, `Rows have to be power of two. ${JSON.stringify(fixture)}`)
    }
    if(fixture.input[0].length !== 1) {
        assert.strictEqual(fixture.input[0].length % 2, 0, `Columns can't have odd number. ${JSON.stringify(fixture)}`)
        assert.strictEqual(isPowerOfTwo(fixture.input[0].length), true, `Columns have to be power of two. ${JSON.stringify(fixture)}`)
    }

    // All are equal to each other
    const firstLength = fixture.input[0].length
    fixture.input.slice(1).forEach(x => {
        assert.strictEqual(x.length, firstLength)
    })
    return true
}
