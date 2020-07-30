# Open Website Status provider
![npm](https://img.shields.io/npm/v/@open-website-status/provider)

This is the CLI provider for Open Website Status

## Usage

Install using:
```shell script
npm i @open-website-status/provider -g
```

After installing, you can use the terminal command:
```shell script
ows-provider
```
The configuration can be provider in the following ways:
 - As a command parameter
```shell script
ows-provider -t MY_TOKEN -s http://example.com:1234
```
 - Set in the config
```shell script
ows-provider config-set token MY_TOKEN
ows-provider config-set server http://example.com:1234
```
 - Passed as an environmental variable
 - Provided in a .env file (using the same key as the Environmental variable)
 ```.dotenv
OWS_TOKEN=MY_TOKEN
OWS_SERVER=http://example.com:1234
```

If you provide the setting in multiple ways (eg. as a command line parameter and as an environmental variable) the priority is the same as the order of the list above

| Command argument  | Config key | Environmental variable | Description          | Required |
|-------------------|------------|------------------------|----------------------|----------|
| -t, --token TOKEN | token      | OWS_TOKEN              | Provider token       | **YES**  |
| -s, --server URL  | server     | OWS_SERVER             | Backend server URL   | **YES**  |
| -p, --path PATH   | path       | OWS_PATH               | Provider socket path | no       |

## Running as a service

If you want to run the script as a service you can use a tool such as [pm2](http://pm2.io/).

Install **pm2** using
```shell script
npm i -g pm2
```
You can then start the service using
```shell script
pm2 start ows-provider
```
To stop it just run
```shell script
pm2 stop ows-provider
```
***NOTE:** for some reason this doesn't work on Windows. Check [Unitech/pm2#2037](https://github.com/Unitech/pm2/issues/2037) for more details.*

Check [this pm2 guide](https://pm2.keymetrics.io/docs/usage/startup/) for instructions to start the service on system boot.
