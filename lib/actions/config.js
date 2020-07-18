const chalk = require('chalk');
const ConfigManager = require('../config-manager');

function findSetting(key) {
  const setting = ConfigManager.settings.find((item) => item.key === key);

  if (!setting) {
    console.log(chalk.red(`Unknown setting: ${chalk.blue(key)}`));
    process.exit(12);
  }

  return setting;
}

function configSetAction(key, value) {
  const setting = findSetting(key);

  const validationError = setting.validator(value.trim());
  if (validationError !== null) {
    console.log(chalk.red(`Value for setting ${chalk.blue(setting.name)} (${chalk.blue(setting.key)}): "${chalk.white(value.trim())}" is invalid`));
    console.log(chalk.red(validationError));
    process.exit(11);
  }

  ConfigManager.config.set(key, value.trim());
  console.log(chalk.green(`Set ${chalk.blue(setting.name)} to ${chalk.white(value.trim())}`));
}

function configResetAction(key) {
  const setting = findSetting(key);
  ConfigManager.config.delete(key);
  console.log(chalk.green(`Reset ${chalk.blue(setting.name)}`));
}

function configGetAction(key) {
  const setting = findSetting(key);
  const value = ConfigManager.config.get(key);
  if (value === undefined) {
    console.log(chalk.yellowBright(`Setting ${chalk.blue(setting.name)} isn't currently set`));
  } else {
    console.log(chalk.green(`Setting ${chalk.blue(setting.name)} is currently set to: ${chalk.white(value)}`));
  }
}

module.exports.configSetAction = configSetAction;
module.exports.configResetAction = configResetAction;
module.exports.configGetAction = configGetAction;
