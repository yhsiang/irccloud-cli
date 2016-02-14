# IRCCloud CLI [![Build Status](https://travis-ci.org/yhsiang/irccloud-cli.svg?branch=master)](https://travis-ci.org/yhsiang/irccloud-cli) [![Coverage Status](https://coveralls.io/repos/github/yhsiang/irccloud-cli/badge.svg?branch=master&refresh=1)](https://coveralls.io/github/yhsiang/irccloud-cli?branch=master) [![Build status](https://ci.appveyor.com/api/projects/status/ahh7upogc1reaitt?svg=true&refresh=1)](https://ci.appveyor.com/project/yhsiang/irccloud-cli)

irccloud commandline interface inspire [baseBot](https://github.com/voldyman/baseBot) and [IRCCloud API](https://github.com/irccloud/irccloud-tools/wiki/API-Overview)
![screenshot](https://raw.github.com/yhsiang/irccloud-cli/master/screenshot.png "screenshot")

# Development
1. `npm install`

# Install
1. `$ npm install -g irccloud-cli`

# Usage
  Usage: `ic -P <config file path>`

  Options:
  ```
    -h, --help                     output usage information
    -V, --version                  output the version number
    -P, --path <config file path>  config.json file path
  ```
  Config file example:
  ```
  {
    "host": "https://www.irccloud.com",
    "email": "IRCCloud ACCOUNT - EMAIL",
    "password": "PASSWORD"
  }
  ```
  Note: there is no '/' at the end of host url.
#  Changelog

## Version 0.4.0
14 Feb 2016
  * Add test cases
  * Support reconnecting when client is terminated by server.
  * Support user to assign the host.

## Version 0.3.0
13 Feb 2016
  * Rewrite with ES2015, implement the minimal necessary function.
  * Remove log feature.

# License
MIT
