/*
 * LightningChartJS example that showcases visualization of a Flow Cytometry data set (FSC + SSC properties).
 */
// Import LightningChartJS
const lcjs = require("@arction/lcjs");

const {
    lightningChart,
    PalettedFill,
    LUT,
    ColorRGBA,
    PointShape,
    translatePoint,
    Themes,
} = lcjs;

const chart = lightningChart()
    .ChartXY({
        // theme: Themes.darkGold
    })
    .setTitle('Flow Cytometry Visualization')
    .setMouseInteractions(false)
    .setPadding(0)

const axisX = chart
    .getDefaultAxisX()
    .setInterval(1.3, 10, false, true)
    .setTitle('FSC-A (10⁶)')
    .setMouseInteractions(false)
    .setThickness(60)

const axisY = chart
    .getDefaultAxisY()
    .setInterval(-0.2, 1.8, false, true)
    .setTitle('SSC-A (10⁶)')
    .setMouseInteractions(false)
    .setThickness(80)

const pointSeries = chart.addPointSeries({
    pointShape: PointShape.Square
})
    .setCursorEnabled(false)
    .setIndividualPointValueEnabled(true)
    .setPointSize(2)
    .setPointFillStyle(
        new PalettedFill({
            lookUpProperty: 'value',
            lut: new LUT({
                interpolate: true,
                steps: [
                    { value: 0, color: ColorRGBA(0, 0, 0, 0) },
                    { value: 1, color: ColorRGBA(0, 0, 255) },
                    { value: 10, color: ColorRGBA(50, 50, 255) },
                    { value: 50, color: ColorRGBA(0, 255, 0) },
                    { value: 100, color: ColorRGBA(255, 255, 0) },
                    { value: 150, color: ColorRGBA(255, 0, 0) },
                ],
            }),
        }),
    )

fetch(
    document.head.baseURI +
      "examples/assets/lcjs_example_0019_flowCytometryChart-flowCytometryChart-data.json"
  )
    .then((r) => r.json())
    .then((data) => {
        // Align Chart Axis area so that each data point occupies exactly 1 pixel.
        const columns = data.data.length
        const rows = data.data[0].length

        const pxLocationAxisStart = translatePoint(
            { x: axisX.getInterval().start, y: axisY.getInterval().start },
            { x: axisX, y: axisY },
            chart.engine.scale,
        )
        const pxLocationAxisEnd = translatePoint(
            { x: axisX.getInterval().end, y: axisY.getInterval().end },
            { x: axisX, y: axisY },
            chart.engine.scale,
        )
        const pxAxisSize = {
            x: Math.ceil(pxLocationAxisEnd.x - pxLocationAxisStart.x),
            y: Math.ceil(pxLocationAxisEnd.y - pxLocationAxisStart.y),
        }

        const pointSize = 2
        // Set chart paddings so that each column/row in data set occupies exactly 1 pixel.
        const horizontalPadding = Math.max(pxAxisSize.x - columns * pointSize, 0)
        const verticalPadding = Math.max(pxAxisSize.y - rows * pointSize, 0)
        chart.setPadding({
            left: horizontalPadding / 2,
            right: horizontalPadding / 2,
            top: verticalPadding / 2,
            bottom: verticalPadding / 2,
        })

        // Unpack data from [[sample, sample, ...], [...], [...]] format to list of XY+Value points.
        const points = []
        data.data.forEach((column, iColumn) => {
            column.forEach((sample, iRow) => {
                if (sample === 0) return
                points.push({
                    x: data.x.start + iColumn * (data.x.end - data.x.start) / data.data.length, 
                    y: data.y.start + iRow * (data.y.end - data.y.start) / data.data[0].length,
                    value: sample, 
                })
            })
        })
        pointSeries.add(points)
    })
