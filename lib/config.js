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

/**
 * Returns application configuration object.
 *
 * @returns {object} config - application config
 */
function getAppConfig() {
  return appConfig;
}

/**
 * Returns a function closing over the data access layer that returns a promise
 * that will return a mailbox configuration.
 */
function getMailboxConfig(dal) {

  return boundGetMailboxConfig;

  /**
   * Returns a promise containing a mailbox configuration object. Default
   * options are first applied, followed by context options, and finally by
   * mailbox options.
   *
   * @param {Mailbox} mailbox - mailbox instance
   * @returns {Q} promise - promise containing mailbox configuration object
   */
  function boundGetMailboxConfig(mailbox) {
    var mailboxConfig = {};

    // load defaults
    Object.keys(appConfig.mailbox).forEach(function(option) {
      mailboxConfig[option] = appConfig.mailbox[option];
    });

    // load context configuration
    return dal.contextConfig.all(mailbox.getContext())
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
}

/**
 * Returns methods for accessing configuration objects.
 *
 * @param {object} dal - voicemail data access layer
 * @returns {object} module - module functions
 */
module.exports = function(dal) {
  return {
    getAppConfig: getAppConfig,
    getMailboxConfig: getMailboxConfig(dal)
  };
};
