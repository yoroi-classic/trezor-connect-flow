This library wraps `@trezor/connect-web` using TypeScript, exposes the methods, types and constants used by Yoroi and converts the types to Flow so that Yoroi could consume them in a type-safe manner.

## Development

Use Node.js 22 LTS with npm 10. The supported toolchain is recorded in `.nvmrc`, `.npmrc`, `package.json#engines`, and `package.json#packageManager` so local installs and CI use the same baseline.

```sh
npm ci
npm run build
git diff --exit-code -- index.js index.js.flow
npm test
```
