const fs = require("fs");
// 3rd party
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");

const SECONDS = 1000;

/** A simple wrapper class for Google Lighthouse. */
class PageAnalyzer {
  /**
   * @param  {URL} url - a url as parsed using the node WHATWG URL API
   *
   * Accept an url, and use chrome to run a Lighthouse against the given url
   * using a slightly modified desktop config. With this config, we account
   * for very slow pages, to make it possible to check a url against the
   * Web Archive.
   */
  async runLighthouse(url) {
    const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
    const desktopConfig = require("lighthouse/lighthouse-core/config/lr-desktop-config");

    // override desktop to allow for looooong load times
    // from the webarchive
    desktopConfig.settings.maxWaitForFcp = 180 * SECONDS;
    desktopConfig.settings.maxWaitForLoad = 180 * SECONDS;

    const options = { logLevel: "warn", output: "html", port: chrome.port };

    const runnerResult = await lighthouse(url, options, desktopConfig);

    await chrome.kill();
    return runnerResult;
  }

  /**
   * @param  {LighthouseResultObject} runnerResult - a Lighthouse Result object
   * @param  {string} reportName -a string for the path on the file system to use.
   *
   * Take the Lighthouse result and write the human readable HTML report, as well as
   * dumping the JSON representation.
   * We assume `reportName` has been sanitised and is safe to use.
   */
  async writeLHResult(runnerResult, reportName) {
    const reportHTML = runnerResult.report;
    const reportJSON = JSON.stringify(runnerResult.lhr);
    fs.writeFileSync(`${reportName}.html`, reportHTML);
    fs.writeFileSync(`${reportName}.json`, reportJSON);
  }

  /**
   * @param  {String} pathToReportJSON - a path to a json file to load and parse
   * @return {object|null} - the parsed report to work with
   */
  loadReport(pathToReportJSON) {
    try {
      const contents = fs.readFileSync(pathToReportJSON)
      const report = JSON.parse(contents)
      return report
    } catch (error) {
      console.error(`no parseable file found at ${pathToReportJSON}`);
      return;
    }
  }

  loadTransferForPageVariants(pageName) {

    const files = fs.readdirSync('./lh-runs/');
    const matchingRuns = this.lighthouseRunsForName(files, pageName)
    const rows = []

    for (const runFile of matchingRuns) {

      const loadPath = `./lh-runs/${runFile}`

      if (fs.statSync(loadPath)) {
        const result = this.loadReport(loadPath)
        const transfer = this.analyseTransfer(result)
        const variant = runFile.replace(`${pageName}-`, "").replace('.json', '')
        transfer.Name = variant
        rows.push(transfer)
      }
    }
    return rows
  }


  /**
   * @param  {LighthouseResultObject} lighthouseResult
   *
   * Accept a Lighthouse Result, and pull out the total transfer,
   * broken down by file type.
   *
   */
  analyseTransfer(lighthouseResult, skipWebArchive) {
    const items = lighthouseResult.audits['network-requests'].details.items

    function breakdownByType(transferByType, item) {


      const fileTypes = [
        "Document",
        "Script",
        "Stylesheet",
        "Image",
        "XHR",
        "Font",
      ]

      // reject resource types we aren't interested in
      if (!fileTypes.includes(item.resourceType)) {
        return transferByType
      }

      // return early to skip counting web archive page furniture
      // all urls from the original capture begin with the string below
      const telltaleWebArchiveCapturePath = "web.archive.org/web"
      if (!item.url.includes(telltaleWebArchiveCapturePath) && skipWebArchive) {
        return transferByType
      }

      if (transferByType[item.resourceType]) {
        transferByType[item.resourceType] += item.transferSize
      } else {
        transferByType[item.resourceType] = item.transferSize
      }
      return transferByType
    }
    return items.reduce(breakdownByType, {})
  }
  /**
   * @param  {string} files - a set of file names from listing the
   * contents of a directory
   * @param  {string} fileName - file name to search for matching runs for
   *
   * Return the matching json files from the list that match the string fileName
   */
  lighthouseRunsForName(files, fileName) {
    return files
      .filter((file) => file.startsWith(fileName))
      .filter((file) => file.match('.json'))
  }
}

module.exports = PageAnalyzer;
