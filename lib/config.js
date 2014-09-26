/**
 * Configuration module for Asterisk voicemail.
 *
 * @module tests-context
 * @copyright 2014, Digium, Inc.
 * @license Apache License, Version 2.0
 * @author Samuel Fortier-Galarneau <sgalarneau@digium.com>
 */

'use strict';

var path = require('path');
var appConfig = require(path.resolve('./config.json'));
var data = require('voicemail-data');

/**
 * Returns application configuration object.
 *
 * @returns {object} config - application config
 */
function getAppConfig() {
  return appConfig;
}

/**
 * Returns a promise containing a mailbox configuration object. Default options
 * are first applied, followed by context options, and finally by mailbox
 * options.
 *
 * @param {Mailbox} mailbox - mailbox instance
 * @param {Context} context - context instance
 * @returns {Q} promise - promise containing mailbox configuration object
 */
function getMailboxConfig(mailbox, context) {
  var dal = data(appConfig.db.connectionString);
  var mailboxConfig = {};

  // load defaults
  Object.keys(appConfig.mailbox).forEach(function(option) {
    mailboxConfig[option] = appConfig.mailbox[option];
  });

  // load context configuration
  return dal.contextConfig.all(context)
    .then(function(options) {
      loadDbOptions(options);

      // load mailbox configuration
      return dal.mailboxConfig.all(mailbox);
    })
    .then(function(options) {
      loadDbOptions(options);

      return mailboxConfig;
    });

  function loadDbOptions(options) {
    options.forEach(function(option) {
      mailboxConfig[option.key] = option.value;
    });
  }
}

module.exports = {
  getAppConfig: getAppConfig,
  getMailboxConfig: getMailboxConfig
};
