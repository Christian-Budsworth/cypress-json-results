/// <reference types="cypress" />

const fs = require('fs');
const { updateText } = require('./update-text');

class CypressReport {
  constructor(opt = {}) {
    const defaults = {
      folder: 'cypress',
      filename: 'results.json',
    };
    this.options = { ...defaults, ...opt };
    if (!this.options.on) {
      throw new Error('Missing required option: on');
    }

    this.allResults = null;
    this.testReport = null;
  }

  beforeRunHandler() {
    this.allResults = {}
    this.testReport = {
      results: [],
    };
  }

  afterSpecHandler(spec, results) {
    this.allResults[spec.relative] = {}
    // shortcut
    const r = this.allResults[spec.relative]
    results.tests.forEach((t) => {
      const testTitle = t.title.join(' ')
      r[testTitle] = t.state
    })
  }

  afterSpecWithDuration(spec, results) {
    // shortcut
    results.tests.forEach(t => {
      console.log(t)
      console.log("t.attempts[0]", t.attempts[0])
      const result = {
        feature: spec.relative,
        scenario: t.title.join(' '),
        state: t.state,
        duration: t.attempts[0]?.timings?.test?.fnDuration ?? 0,
      };
      this.testReport.results.push(result);
    });
  }

  afterRunHandler(afterRun) {
    const totals = {
      suites: afterRun.totalSuites,
      tests: afterRun.totalTests,
      failed: afterRun.totalFailed,
      passed: afterRun.totalPassed,
      pending: afterRun.totalPending,
      skipped: afterRun.totalSkipped,
    }
    if (this.allResults) {
      this.allResults.totals = totals
      const str = JSON.stringify(this.allResults, null, 2)
      fs.writeFileSync(`${this.options.folder}/${this.options.filename}`, `${str}\n`);
      console.log('cypress-json-results: wrote results to %s', this.options.filename)
  
    }
    if (this.testReport) {
      this.testReport.totals = totals
      const str = JSON.stringify(this.testReport, null, 2)
      fs.writeFileSync(
        `${this.options.folder}/` + `test-report-services-${this.options.filename}`,
        `${str}\n`,
      );
      console.log('cypress-json-results: wrote results to %s', this.options.filename)

    }


    const str = JSON.stringify(this.allResults, null, 2)
    fs.writeFileSync(this.options.filename, str + '\n')
    console.log('cypress-json-results: wrote results to %s', this.options.filename)

    if (this.options.updateMarkdownFile) {
      const markdownFile = this.options.updateMarkdownFile
      const markdown = fs.readFileSync(markdownFile, 'utf8')
      const updated = updateText(markdown, this.allResults.totals)
      fs.writeFileSync(markdownFile, updated)
      console.log(
        'cypress-json-results: updated Markdown file %s',
        markdownFile,
      )
    }
  }
}

module.exports = CypressReport;