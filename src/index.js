/// <reference types="cypress" />

const fs = require('fs')

function registerCypressJsonResults(options = {}) {
  const defaults = {
    filename: 'results.json',
  }
  options = { ...options, defaults }
  if (!options.on) {
    throw new Error('Missing required option: on')
  }

  // keeps all test results by spec
  let allResults

  // `on` is used to hook into various events Cypress emits
  options.on('before:run', () => {
    allResults = {}
  })

  options.on('after:spec', (spec, results) => {
    allResults[spec.relative] = {}
    // shortcut
    const r = allResults[spec.relative]
    results.tests.forEach((t) => {
      const testTitle = t.title.join(' ')
      r[testTitle] = t.state
    })
  })

  options.on('after:run', () => {
    const str = JSON.stringify(allResults, null, 2)
    fs.writeFileSync(options.filename, str + '\n')
    console.log('cypress-json-results: wrote results to %s', options.filename)
  })
}

module.exports = registerCypressJsonResults
