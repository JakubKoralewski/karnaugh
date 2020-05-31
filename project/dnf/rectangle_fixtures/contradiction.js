export default {
    description: "Rectangles correctly don't include any false cells",
    fixtures: {
        [Symbol.iterator]: function* () {
            const minSize = 2;
            const maxSize = 10;
            for(let rows = minSize; rows <=maxSize; rows++) {
                for(let columns = minSize; columns <= maxSize; columns++) {
                    const values = new Array(rows*columns).fill(false)
                    yield {
                        values,
                        colCount: columns,
                        output: [],
                        description: `${rows}x${columns} all 0 should be a single empty array`
                    }
                }
            }
        }
    }
}
