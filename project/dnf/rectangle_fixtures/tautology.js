export default {
    description: "Rectangles correctly include all true cells",
    fixtures: {
        [Symbol.iterator]: function* () {
            const minSize = 2;
            const maxPower = 5;
            for (let rows = minSize; rows <= 2**maxPower; rows*=2) {
                for (let columns = minSize; columns <= 2**maxPower; columns*=2) {
                    const output = new Array(rows*columns)
                        .fill(1)
                        .flatMap(
                            (_, i) => i
                        )
                    const values = output.map(_ => true)
                    yield {
                        values,
                        colCount: columns,
                        output: [output],
                        description:
                            `${rows}x${columns} full of 1 should be a single whole rectangle`
                    }
                }
            }
        }
    }
}
