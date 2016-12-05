'use strict';

const Diagnostic = require('@ibl/ops-doctor').diagnostic;
const cert = require('certificate-expiry');

class Certificate extends Diagnostic {
  constructor(host, expectation) {
    super(host, expectation);
    this._host = host;
  }

  measure(cb) {
    cert.daysLeft(this._host, cb);
  }

  createMessage(actual) {
    return `Expected: days left ${this._expectation}. Actual: ${actual}`;
  }

  description() {
    return 'Asserts the certificate days to expiry';
  }
}

module.exports = Certificate;
