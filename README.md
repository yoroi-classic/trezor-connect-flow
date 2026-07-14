This library wraps `@trezor/connect-web` using TypeScript, exposes the methods, types and constants used by Yoroi and converts the types to Flow so that Yoroi could consume them in a type-safe manner.

## Development

Use Node 22 or 24, matching the CI matrix and `package.json` engine range. npm installs enforce the declared engines through `.npmrc`.

```sh
npm ci
npm run verify
```
