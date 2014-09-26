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
var mockery = require('mockery');
var assert = require('assert');

var mockeryOpts = {
  warnOnReplace: false,
  warnOnUnregistered: false,
  useCleanCache: true
};

describe('config', function() {

  it('should support loading application config', function(done) {
    var config = require('../lib/config.js');
    var appConfig = config.getAppConfig();

    assert(appConfig.db.connectionString === 'postgres://user:secret@database');
    assert(appConfig.ari.url === 'http://localhost:8088');
    assert(appConfig.ari.applicationName === 'test');
    assert(appConfig.prompts.intro[0].sound === 'sound:one');

    done();
  });

  it('should support loading mailbox config', function(done) {
    mockery.enable(mockeryOpts);
    mockery.registerMock('voicemail-data', function(connectionString) {
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
    });
    var config = require('../lib/config.js');

    config.getMailboxConfig()
      .then(function(mailboxConfig) {
        
        assert(mailboxConfig['min_sec'] === '10');
        assert(mailboxConfig['max_sec'] === '20');
        assert(mailboxConfig['max_messages'] === '100');

        mockery.disable();
        done();
      })
      .done();
  });

});
