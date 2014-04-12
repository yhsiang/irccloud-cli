IRCCloud CLI
=================
irccloud commandline interface inspire [baseBot](https://github.com/voldyman/baseBot) and [IRCCloud API](https://github.com/irccloud/irccloud-tools/wiki/API-Overview)
![screenshot](https://raw.github.com/yhsiang/irccloud-cli/master/screenshot.png "screenshot")

Developement
=================
1. npm install

Install
=================
1. `$ npm install -g LiveScript`
2. `$ npm install -g irccloud-cli`

Usage
=================
  Usage: `ic -e <email> -p <password>`

  Options:

    -h, --help                     output usage information
    -V, --version                  output the version number
    -e, --email <email>            irccloud account
    -p, --password <password>      irccloud password
    -P, --path <config file path>  config.json file path
    -f, --filter <string>          filter by string // TODO
    -c, --channel <channel>        only show #channel message (need # first)

License
=================
MIT
