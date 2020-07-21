const { ProviderSDK } = require('@open-website-status/provider-sdk');
const chalk = require('chalk');
const got = require('got');
const ConfigManager = require('../config-manager');

module.exports = function mainAction(cmdObject) {
  const config = ConfigManager.resolve(cmdObject);

  const sdk = new ProviderSDK({
    token: config.token,
    server: config.server,
    path: config.path,
  });

  sdk.onConnect(() => {
    console.log();
    console.log(chalk.red.green('Connected successfully!'));
  });

  sdk.onConnectError((error) => {
    console.log(`${chalk.red.bold('Failed to connect:')} ${chalk.red(error.message)}`);
  });

  sdk.onConnectTimeout(() => {
    console.log();
    console.log(chalk.yellow('Connection timed out'));
  });

  sdk.onError((error) => {
    console.log();
    console.log(`${chalk.red.bold('An error occurred:')} ${chalk.red(error)}`);
    process.exit(1);
  });

  sdk.onDisconnect(() => {
    console.log(chalk.red.bold('Disconnected'));
    console.log();
  });

  sdk.onDispatchJob(async (job) => {
    const url = `${job.protocol}//${job.hostname}${job.port === undefined ? '' : `:${job.port}`}${job.pathname}${job.search}`;
    console.log(`${chalk.blueBright('New job:')} ${chalk.white.underline(url)}`);
    try {
      await sdk.accept(job.jobId);
      try {
        const response = await got(url, {
          timeout: 30000,
          retry: {
            limit: 0,
          },
          throwHttpErrors: false,
        });
        try {
          await sdk.complete(job.jobId, {
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
            await sdk.complete(job.jobId, {
              state: 'timeout',
              executionTime: error.timings.phases.total,
            });
            console.log(chalk.yellowBright('Timeout'));
          } else {
            await sdk.complete(job.jobId, {
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
};
