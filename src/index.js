/*
 * LightningChartJS example that showcases visualization of a Flow Cytometry data set (FSC + SSC properties).
 */
// Import LightningChartJS
const lcjs = require('@lightningchart/lcjs')

const { lightningChart, PalettedFill, LUT, PointShape, ColorRGBA, emptyLine, Themes } = lcjs

const chart = lightningChart({
            resourcesBaseUrl: new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'resources/',
        })
    .ChartXY({
        theme: Themes[new URLSearchParams(window.location.search).get('theme') || 'darkGold'] || undefined,
    })
    .setTitle('Flow Cytometry Visualization')
    .setUserInteractions(undefined)

// Example: Fixed aspect ratio, extra space is allocated as chart padding
const aspectRatio = 1.8 // width / height
chart.addEventListener('layoutchange', (info) => {
    const spaceAvailable = { x: info.viewportWidth + chart.getPadding().right, y: info.viewportHeight + chart.getPadding().bottom }
    // Fit desired aspect ratio within space available in chart.
    let width
    let height
    if (spaceAvailable.x / spaceAvailable.y > aspectRatio) {
        height = spaceAvailable.y
        width = height * aspectRatio
    } else {
        width = spaceAvailable.x
        height = width / aspectRatio
    }
    chart.setPadding({
        right: chart.getPadding().right + (info.viewportWidth - width) + 20,
        bottom: chart.getPadding().bottom + (info.viewportHeight - height) + 20,
    })
})

const axisX = chart.getDefaultAxisX().setInterval({ start: 1.3, end: 10 }).setTitle('FSC-A (10⁶)')

const axisY = chart.getDefaultAxisY().setInterval({ start: -0.2, end: 1.8 }).setTitle('SSC-A (10⁶)')

const pointSeries = chart
    .addPointLineAreaSeries({
        dataPattern: null,
        lookupValues: true,
    })
    .setStrokeStyle(emptyLine)
    .setPointShape(PointShape.Square)
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

fetch(new URL(document.head.baseURI).origin + new URL(document.head.baseURI).pathname + 'examples/assets/0019/flowCytometryChart-data.json')
    .then((r) => r.json())
    .then((data) => {
        // Align Chart Axis area so that each data point occupies exactly 1 pixel.
        const columns = data.data.length
        const rows = data.data[0].length

        const pxLocationAxisStart = chart.translateCoordinate(
            { x: axisX.getInterval().start, y: axisY.getInterval().start },
            chart.coordsAxis,
            chart.coordsRelative,
        )
        const pxLocationAxisEnd = chart.translateCoordinate(
            { x: axisX.getInterval().end, y: axisY.getInterval().end },
            chart.coordsAxis,
            chart.coordsRelative,
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
                if (!sample) return
                points.push({
                    x: data.x.start + (iColumn * (data.x.end - data.x.start)) / data.data.length,
                    y: data.y.start + (iRow * (data.y.end - data.y.start)) / data.data[0].length,
                    value: sample,
                })
            })
        })
        pointSeries.appendJSON(points, { x: 'x', y: 'y', lookupValue: 'value' })
    })
