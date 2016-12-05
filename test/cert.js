'use strict';

const assert = require('assert');
const sinon = require('sinon');
const cert = require('certificate-expiry');

const Certificate = require('../lib/cert');
const sandbox = sinon.sandbox.create();

const HOST = 'bbc.co.uk';

describe('Certificate', () => {
  beforeEach(() => {
    sandbox.stub(cert, 'daysLeft').withArgs(HOST).yields(null, 100);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('.measure', () => {
    it('measures the number of days remaining on the certificate', (done) => {
      const diagnostic = new Certificate(HOST);

      return diagnostic.measure((err, withinExpiry) => {
        assert.ifError(err);
        assert.strictEqual(withinExpiry, 100);
        done();
      });
    });

    it('returns an error when a failure occurs', (done) => {
      cert.daysLeft.yields(new Error('broken'));

      const diagnostic = new Certificate('anotherProcess');

      return diagnostic.measure((err) => {
        assert.ok(err);
        assert.equal(err.message, 'broken');
        done();
      });
    });
  });

  describe('.createMessage', () => {
    let expectation;

    beforeEach(() => {
      expectation = {
        toString: sandbox.stub().returns('greater than 50')
      };
    });

    it('returns a formatted diagnotic message', () => {
      const diagnostic = new Certificate(HOST, expectation);

      const message = diagnostic.createMessage(100);
      assert.equal(message, 'Expected: days left greater than 50. Actual: 100');
    });
  });

  describe('.run', () => {
    let expectation;

    beforeEach(() => {
      expectation = {
        exec: sandbox.stub().withArgs(100).returns(true),
        toString: sandbox.stub().returns('greater than 50')
      };
    });

    it('measures if a certificate is within the specified days remaining', (done) => {
      const diagnostic = new Certificate(HOST, expectation);

      diagnostic.run((err, results) => {
        assert.ifError(err);
        assert.strictEqual(results.success, true);
        assert.equal(results.message, 'Expected: days left greater than 50. Actual: 100');
        assert.equal(results.id, 'certificate');
        assert.equal(results.description, 'Asserts the certificate days to expiry');
        done();
      });
    });

    it('returns an error when the measurement fails', (done) => {
      cert.daysLeft.yields(new Error('fail'));

      const diagnostic = new Certificate(expectation);

      diagnostic.run((err) => {
        assert.ok(err);
        assert.equal(err.message, 'fail');
        done();
      });
    });
  });
});
