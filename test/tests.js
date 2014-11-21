/**
 * Configuration unit tests.
 *
 * @module tests-context
 * @copyright 2014, Digium, Inc.
 * @license Apache License, Version 2.0
 * @author Samuel Fortier-Galarneau <sgalarneau@digium.com>
 */

/*global describe:false*/
/*global it:false*/

'use strict';

var Q = require('q');
var assert = require('assert');

/**
 * Returns a mock dal for testing.
 */
var getMockDal = function() {
  return {
    contextConfig: {
      all: function() {
        /*jshint newcap:false*/
        var promise = Q();

        return promise.then(function() {
          return [{
            key: 'max_sec',
            value: '20'
          }, {
            key: 'max_messages',
            value: '50'}
          ];
        });
      }
    },
    mailboxConfig: {
      all: function() {
        /*jshint newcap:false*/
        var promise = Q();

        return promise.then(function() {
          return [{key: 'max_messages', value: '100'}];
        });
      }
    }
  };
};

/**
 * Returns a mock logger for testing.
 */
var getMockLogger = function() {
  return {
    child: function() {
      return {
        trace: function() {},
        debug: function() {},
        info: function() {},
        warn: function() {},
        error: function() {},
        fatal: function() {},
        child: function() {
          return this;
        }
      };
    }
  };
};

describe('config', function() {

  it('should support loading application config', function(done) {
    var config = require('../lib/config.js')({
      dal: getMockDal(),
      logger: getMockLogger()
    });
    var appConfig = config.getAppConfig();

    assert(appConfig.db.connectionString === 'postgres://user:secret@database');
    assert(appConfig.ari.url === 'http://localhost:8088');
    assert(appConfig.ari.applicationName === 'test');
    assert(appConfig.prompts.mailboxWriter.intro[0].sound === 'sound:vm-intro');

    done();
  });

  it('should support loading mailbox config', function(done) {
    var config = require('../lib/config.js')({
      dal: getMockDal(),
      logger: getMockLogger()
    });
    var mailbox = {
      getContext: function() {
        return {};
      }
    };

    config.getMailboxConfig(mailbox)
      .then(function(mailboxConfig) {
        
        assert(mailboxConfig['min_sec'] === '10');
        assert(mailboxConfig['max_sec'] === '20');
        assert(mailboxConfig['max_messages'] === '100');

        done();
      })
      .done();
  });

});
