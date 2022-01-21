const fs = require('fs')
const { parse } = require('csv-parse/sync');

const { buildCSVofComparablePages, writeCSVofComparablePages } = require("./lh-check-urls")
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

test("generate data structure for comparing transfer for pages", () => {

  // for a given page return the transfer variants

  pageName = "academic-units"
  const rows = analyzer.loadTransferForPageVariants(pageName)
  expect(rows.length).toBe(3)

  // do we have our names?
  const expectedNames = ['current', 'previous', 'webarchive']
  const names = rows.map((row) => row.Name)
  for (const name of names) {
    expect(expectedNames).toContain(name)
  }
})

test("rebuild datastructure for matching pages", () => {
  // here we iterate through our main key files, and then recombine them
  // data structure we can turn into a CSV to support comparisons
  const pathToCSV = './input-data/website-check-urls.csv'
  const csvOutput = buildCSVofComparablePages(pathToCSV);

  // do we have the pages we
  const pages = ["home",
    "covid",
    "educational-programmes",
    "open-competitions-for-admin-posts",
    "political-and-social-sciences",
    "job-opportunities",
    "open-competitions-for-academic-posts",
    "services",
    "about",
    "library",
    "using-webmail",
    "max-weber-programme",
    "school-of-tg",
    "academic-units",
    "people",
    "events",
    "apply-cms-programmes",
    "historical-archives",
    "apply-max-weber-fellowships"]

  const parsedCSV = parse(csvOutput,
    {
      columns: true
    }
  )

  // do we have all the pages in our list?
  const generatedPages = parsedCSV.map((row) => row.PageName)
  for (const page of pages) {
    expect(generatedPages).toContain(page)
  }
})

describe("writing to files", () => {
  beforeAll(() => {
    const outputPath = "test.output.csv"
    fs.unlinkSync(outputPath)
  })
  test("write CSV datastructure for matching pages to file", () => {
    const pathToCSV = './input-data/website-check-urls.csv'
    const outputPath = "test.output.csv"
    writeCSVofComparablePages(pathToCSV, outputPath);

    // is there a CSV file at the location?
    const CSVcontents = fs.readFileSync(outputPath)
    const parsedOutput = parse(CSVcontents)
    // is this an array of row like objects?
    expect(parsedOutput.length).toBeGreaterThan(0)

    const headerRow = parsedOutput[0]

    // do we have our columns?
    const cols = [
      'Document',
      'Script',
      'Stylesheet',
      'Image',
      'Font',
      'XHR',
      'Name',
      'PageName',
    ]
    for (const col of cols) {
      expect(headerRow).toContain(col)
    }
  })

})

