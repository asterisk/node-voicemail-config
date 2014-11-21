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
 * Returns a function closing over voicemail dependencies that returns
 * application configuration.
 *
 * @param {object} dependencies - voicemail dependencies
 */
function getAppConfig(dependencies) {

  return boundGetAppConfig;

  /**
   * Returns application configuration object.
   *
   * @returns {object} config - application config
   */
  function boundGetAppConfig() {
    dependencies.logger.trace('getAppConfig called');

    var appConfigPath = path.resolve('./config.json');
    dependencies.logger.debug('Loading %s', appConfigPath);

    return appConfig;
  }
}

/**
 * Returns a function closing over voicemail dependencies that
 * returns a promise that will return a mailbox configuration.
 *
 * @param {object} dependencies - voicemail dependencies
 */
function getMailboxConfig(dependencies) {

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
    dependencies.logger.trace('getMailboxConfig called');

    var mailboxConfig = {};

    // load defaults
    Object.keys(appConfig.mailbox).forEach(function(option) {
      mailboxConfig[option] = appConfig.mailbox[option];
    });

    // load context configuration
    return dependencies.dal.contextConfig.all(mailbox.getContext())
      .then(function(options) {
        loadDbOptions(options);

        // load mailbox configuration
        return dependencies.dal.mailboxConfig.all(mailbox);
      })
      .then(function(options) {
        loadDbOptions(options);

        dependencies.logger.debug({
          mailboxConfig: mailboxConfig
        }, 'Loaded mailbox config');

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
 * @param {object} dependencies - voicemail dependencies
 * @returns {object} module - module functions
 */
module.exports = function(dependencies) {
  dependencies.logger = dependencies.logger.child({
    component: 'voicemail-config'
  });

  dependencies.logger.info('Voicemail config created');

  return {
    getAppConfig: getAppConfig(dependencies),
    getMailboxConfig: getMailboxConfig(dependencies)
  };
};
