#!/usr/bin/env node

const updateNotifier = require('update-notifier');
const { ProviderSDK } = require('@open-website-status/provider-sdk');
const chalk = require('chalk');
const { program } = require('commander');
const got = require('got');
const pkg = require('../package.json');

updateNotifier({
  pkg,
  updateCheckInterval: 1000 * 60 * 60 * 8, // 8 hours
}).notify();

program
  .requiredOption('-t, --token <token>', 'Provider token')
  .option('-s, --server <url>', 'Server URL')
  .option('-p, --path <path>', 'Provider socket path');

program.parse(process.argv);

const sdk = new ProviderSDK({
  token: program.token,
  server: program.server,
  path: program.path,
});

sdk.on('connect', () => {
  console.log();
  console.log(chalk.red.green('Connected successfully!'));
});

sdk.on('connect-error', (error) => {
  console.log(`${chalk.red.bold('Failed to connect:')} ${chalk.red(error.message)}`);
});

sdk.on('connect-timeout', () => {
  console.log();
  console.log(chalk.yellow('Connection timed out'));
});

sdk.on('error', (error) => {
  console.log();
  console.log(`${chalk.red.bold('An error occurred:')} ${chalk.red(error)}`);
  process.exit(1);
});

sdk.on('disconnect', () => {
  console.log(chalk.red.bold('Disconnected'));
  console.log();
});

sdk.on('dispatch-job', async (job) => {
  const url = `${job.protocol}//${job.host}${job.path}`;
  console.log(`${chalk.blueBright('New job:')} ${chalk.white.underline(url)}`);
  try {
    await sdk.accept(job.id);
    try {
      const response = await got(url, {
        timeout: 30000,
        retry: {
          limit: 0,
        },
        throwHttpErrors: false,
      });
      try {
        await sdk.complete(job.id, {
          state: 'success',
          executionTime: response.timings.phases.total,
          httpCode: response.statusCode,
        });
        console.log(chalk.blueBright('Success'));
      } catch (completeError) {
        console.log(`${chalk.red.bold('Failed to complete job:')}`);
        console.error(completeError);
      }
    } catch (error) {
      try {
        if (error.name === 'TimeoutError') {
          await sdk.complete(job.id, {
            state: 'timeout',
            executionTime: error.timings.phases.total,
          });
          console.log(chalk.yellowBright('Timeout'));
        } else {
          await sdk.complete(job.id, {
            state: 'error',
            errorCode: error.code,
          });
          console.log(`${chalk.red('Error:')} ${error.code}`);
        }
      } catch (completeError) {
        console.log(`${chalk.red.bold('Failed to complete job:')}`);
        console.error(completeError);
      }
    }
  } catch (acceptError) {
    console.log(`${chalk.red.bold('Failed to accept job:')}`);
    console.error(acceptError);
  }
});
