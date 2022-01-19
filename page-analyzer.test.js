
const PageAnalyzer = require("./page-analyzer");
const analyzer = new PageAnalyzer();

test('pulling out transfer from Lighthouse Result', () => {
  result = require('./lh-runs/about-current.json')
  const transferByType = analyzer.analyseTransfer(result)
  console.log(transferByType)
  expect(Object.values(transferByType).length).toBe(6);
});
