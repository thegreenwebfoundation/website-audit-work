
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
  console.log(transferByType)
  console.log(transferByTypeFiltered)

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


// // {
// //   Document: 25100,
// //   Script: 639582,
// //   Stylesheet: 79126,
// //   undefined: 39307,
// //   Image: 17279092,
// //   XHR: 28953,
// //   Font: 134522,
// //   Ping: 251
// // }

// {
//   Document: 25100,
//     undefined: 39307,
//       Script: 586927,
//         Stylesheet: 72112,
//           XHR: 27807,
//             Image: 17272209,
//               Font: 106283
// }
