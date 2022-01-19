
const PageAnalyzer = require("./page-analyzer");
const analyzer = new PageAnalyzer();

test('pull out transfer from Lighthouse Result broken down by file type', () => {
  result = require('./lh-runs/home-webarchive.json')
  const transferByType = analyzer.analyseTransfer(result)
  console.log(transferByType)

  const fileTypes = [
    "Document",
    "Script",
    "Stylesheet",
    "Image",
    "XHR",
    "Font",

  ]
  for (const filetype of fileTypes) {
    expect(Object.keys(transferByType)).toContain(filetype)
  }
});

test('strip out webarchive page furniture when needed', () => {
  result = require('./lh-runs/home-webarchive.json')

  const transferByType = analyzer.analyseTransfer(result)
  const skipWebArchive = true
  const transferByTypeFiltered = analyzer.analyseTransfer(result, skipWebArchive)

  const fileTypes = [
    "Document",
    "Script",
    "Stylesheet",
    "Image",
    "XHR",
    "Font",
  ]
  cumulativeDifference = 0
  for (const fileType of fileTypes) {
    const difference = transferByType[fileType] - transferByTypeFiltered[fileType]
    cumulativeDifference += difference
  }
  expect(cumulativeDifference).toBeGreaterThan(0)
  const KILOBYTES = 1024
  console.log(`Cumulative difference: ${cumulativeDifference / KILOBYTES} kb`)
});


