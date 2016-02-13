import 'babel-polyfill'
import fs from 'fs'
import path from 'path'
import program from 'commander'
import * as irccloud from '../lib'

const {version} = JSON.parse(fs.readFileSync(__dirname + '/../package.json'), 'utf8')
let config;

program
  .version(version)
  .option('-P, --path <config file path>', 'config.json file path')
  .parse(process.argv)

if (program.path) {
  config = JSON.parse(fs.readFileSync(path.resolve(program.path) + '/config.json'), 'utf8')
}

if (!config) {
  program.help()
  process.exit(-1)
}

irccloud.connect(config)
