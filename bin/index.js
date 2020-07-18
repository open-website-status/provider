#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const { program } = require('commander');
const pkg = require('../package.json');
const mainAction = require('../lib/actions/main');
const { configSetAction, configResetAction, configGetAction } = require('../lib/actions/config');

updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 8, // 8 hours
}).notify();

program
  .option('-t, --token <token>', 'Provider token')
  .option('-s, --server <url>', 'Server URL')
  .option('-p, --path <path>', 'Provider socket path')
  .action(mainAction);

program
  .command('config-set <setting> <value>')
  .description('Sets a new setting value')
  .action(configSetAction);

program
  .command('config-reset <setting>')
  .description('Resets the value of a setting')
  .action(configResetAction);

program
  .command('config-get <setting>')
  .description('Gets the current value of a setting')
  .action(configGetAction);

program.parse(process.argv);
