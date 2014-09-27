# Asterisk Voicemail Configuration Interface

Configuration interface for Asterisk voicemail. This module supports fetching application, mailbox, and context configuration.

# Installation

```bash
$ git clone https://github.com/asterisk/node-voicemail-config.git
$ cd node-voicemail-config
$ npm install -g .
```

or add the following the your package.json file

```JavaScript
"dependencies": {
  "voicemail-config": "asterisk/node-voicemail-config"
}
```

# Usage

```JavaScript
var config = require('voicemail-config');
var mailbox; // mailbox instance
var context; // context instance

var appConfig = config.getAppConfig();
config.getMailboxConfig(mailbox, context)
  .then(function(mailboxConfig) {
    // use mailbox config
  });
```

appConfig will be an application config object loaded using the parent module's config.json file. It can be used anywhere from a voicemail or voicemail main application to return a parent application config.

mailboxConfig will consist of application level defaults, which can be overridden by the context's configuration or the mailbox's configuration. This allows minimal configuration which can be modified by applying an override to either an entire context or a specific mailbox.

# Development

After cloning the git repository, run the following to install the module and all dev dependencies:

```bash
$ npm install
$ npm link
```

Then run the following to run jshint and mocha tests:

```bash
$ grunt
```

jshint will enforce a minimal style guide. It is also a good idea to create unit tests when adding new features.

# License

Apache, Version 2.0. Copyright (c) 2014, Digium, Inc. All rights reserved.

