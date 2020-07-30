require('dotenv').config();
const Configstore = require('configstore');
const isUrl = require('is-url');
const chalk = require('chalk');
const pkg = require('../package.json');

const config = new Configstore(pkg.name);

const settings = [
  {
    name: 'Provider token',
    key: 'token',
    env: 'OWS_TOKEN',
    required: true,
    validator() {
      return null;
    },
  },
  {
    name: 'Server URL',
    key: 'server',
    env: 'OWS_SERVER',
    required: false,
    default: 'https://api.open-website-status.com',
    validator(value) {
      if (!isUrl(value)) return 'The provided value is not a valid URL';
      return null;
    },
  },
  {
    name: 'Provider socket path',
    key: 'path',
    env: 'OWS_PATH',
    required: false,
    default: undefined,
    validator() {
      return null;
    },
  },
];

function resolve(commandArguments) {
  const resolvedConfig = {};

  settings.forEach((setting) => {
    const argumentValue = commandArguments[setting.key];
    const envValue = process.env[setting.env];
    const configValue = config.get(setting.key);

    let value = argumentValue || envValue || configValue || undefined;
    if (typeof value === 'string') value = value.trim();

    if (value === undefined || value === '') {
      if (setting.required) {
        console.log(chalk.red(`Setting ${chalk.blue(setting.name)} is required`));
        console.log(chalk.red(
          `You can provide it as a command parameter, set it in config using ${chalk.white(`ows-provider config set ${chalk.blue(`${setting.key} NEW_VALUE`)}`)} or pass it as an environmental variable ${chalk.blue(setting.env)}`,
        ));
        process.exit(10);
        return;
      }
      resolvedConfig[setting.key] = setting.default;
    } else {
      const validationError = setting.validator(value);
      if (validationError !== null) {
        console.log(chalk.red(`Value for setting ${chalk.blue(setting.name)} (${chalk.blue(setting.key)}): "${chalk.white(value)}" is invalid`));
        console.log(chalk.red(validationError));
        process.exit(11);
        return;
      }
      resolvedConfig[setting.key] = value;
    }
  });

  return resolvedConfig;
}

module.exports.config = config;
module.exports.resolve = resolve;
module.exports.settings = settings;
