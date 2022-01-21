const fs = require("fs");
const { URL } = require("url");

const slugify = require("slugify");
const { parse } = require('csv-parse/sync');
const { stringify } = require('csv-stringify/sync');

const PageAnalyzer = require("./page-analyzer");
const analyzer = new PageAnalyzer();

/**
 * @param  {string} pathToCSV - the path to the csv file containing urls check
 *
 * Accept a path to a csv file, with columns for:
 * page name, current url, previous url, web archive url
 *
 * Then for each url that is valid, run lighthouse against them, generating
 * reports and data for later analysis.
 */
async function parseCSVAndcheckUrls(pathToCSV) {
  const csvContents = fs.readFileSync(pathToCSV);
  const parsed = parse(csvContents, { columns: true });

  for (const row of parsed) {
    await runLighthouseforPage(row);
  }
}
/**
 * @param  {object} siteObject - an object representing a csv row
 *
 * Accept an object for a webpage and the urls for it's variant
 * incarnations over time. For each valid url, run a lighthouse check.
 */
async function runLighthouseforPage(siteObject) {
  function safelyParseURL(url) {
    try {
      return new URL(url);
    } catch (error) {
      return;
    }
  }

  const currentUrl = safelyParseURL(siteObject.current);
  const previousURl = safelyParseURL(siteObject.previous);
  const webarchiveURL = safelyParseURL(siteObject.webarchive);

  const checkedURLPairs = [
    ["current", currentUrl],
    ["previous", previousURl],
    ["webarchive", webarchiveURL],
  ];

  for (const [kind, checkUrl] of checkedURLPairs) {
    if (checkUrl) {
      const slug = slugify(siteObject.name).toLowerCase();
      console.log(`Checking:  ${slug}-${kind}`);
      const result = await analyzer.runLighthouse(checkUrl);

      analyzer.writeLHResult(result, `runs/${slug}-${kind}`);
      console.log(`Checked OK: ${slug}-${kind}`);
    }
  }
}


function buildCSVofComparablePages(pathToCSV) {

  const csvContents = fs.readFileSync(pathToCSV);
  const parsed = parse(csvContents,
    {
      columns: true
    }
  );
  // list our page names
  const pageNames = parsed.map((row) => { return slugify(row.name).toLowerCase() })

  const rows = []
  for (const name of pageNames) {
    // console.log({ name })
    const pageVariants = analyzer.loadTransferForPageVariants(name)
    // console.log({ pageVariants })
    for (const variant of pageVariants) {
      variant.PageName = name
      rows.push(variant)
    }
  }


  return stringify(rows, {
    header: true,
  })

}

// for each json file for page, find the variants we captured

// then for each variant write the page name, the variant, and transfer,
// broken down by file type




// We want to show the each page, grouped by the key amounts, comparing the old version with the new version, as this allows us to compare what we have, compared to the counter factual as if nothing had changed





const pathToCSV = "./input-data/website-check-urls.csv";

// parseCSVAndcheckUrls(pathToCSV);
// buildCSVofComparablePages(pathToCSV)

module.exports = {
  buildCSVofComparablePages
}
