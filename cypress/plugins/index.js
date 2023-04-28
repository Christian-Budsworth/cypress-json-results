/// <reference types="cypress" />

const CypressReport = require('../../src');
let allResults
/**
 * @type {Cypress.PluginConfig}
 */
// eslint-disable-next-line no-unused-vars
module.exports = (on, config) => {
  const cypressJSONReport = new CypressReport({ on });

  on("before:run", (details) => {
    cypressJSONReport.beforeRunHandler(details);
  });

  on("after:spec", (spec, results) => {
    cypressJSONReport.afterSpecWithDuration(spec, results);
  });

  on("after:run", (results) => {
    cypressJSONReport.afterRunHandler(results);
  });
};