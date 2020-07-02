# Open Website Status provider

This is the CLI provider for Open Website Status

## Usage

Install using:
```shell script
npm i @open-website-status/provider -g
```

After installing you can use the terminal command:
```shell script
ows-provider
```
The arguments are:

| Argument             | Description          | Required |
|----------------------|----------------------|----------|
|**-t, --token TOKEN** | **Provider token**   | **YES**  |
| -s, --server URL     | Backend server URL   | no       |
| -p, --path PATH      | Provider socket path | no       |
| -h, --help           | Shows command help   | no       |

Example usage:
```shell script
ows-provider -t MY_FANCY_TOKEN_1234
```
