# CML migration audit

Issue #2 asks for the remaining EMURGO Cardano Serialization Lib packages to move to dcSpark Cardano Multiplatform Lib where feasible.

## Current dependency path

This package does not import CSL directly and does not declare CSL in `package.json`.

The current CSL lockfile entries are transitive:

```text
trezor-connect-flow
`-- @trezor/connect-web@9.6.4
    `-- @trezor/connect@9.6.4
        `-- @fivebinaries/coin-selection@3.0.0
            |-- @emurgo/cardano-serialization-lib-browser@13.2.1
            `-- @emurgo/cardano-serialization-lib-nodejs@13.2.0
```

## CML package checks

The published dcSpark packages verified for this audit are:

- `@dcspark/cardano-multiplatform-lib-browser@6.2.0`
- `@dcspark/cardano-multiplatform-lib-nodejs@6.2.0`

Both publish `cardano_multiplatform_lib.js` as `main` and `cardano_multiplatform_lib.d.ts` as `types`.

An npm override alias from the EMURGO package names to those CML packages is not a safe drop-in replacement for `@fivebinaries/coin-selection@3.0.0`. The package loads CSL APIs such as `NetworkInfo.testnet_preprod()` and `NetworkInfo.testnet_preview()`, while CML 6.2.0 exposes `NetworkInfo.preprod()` and `NetworkInfo.preview()` instead. A local smoke check of `require('@fivebinaries/coin-selection')` fails with that alias.

Older CML versions sampled during the audit (`0.3.0`, `1.0.3`, `2.0.1`, `3.1.2`, `4.0.2`, and `5.3.1`) also do not expose the full CSL API shape required by `@fivebinaries/coin-selection@3.0.0`.

## Safe migration path

The safe next step is to replace or upgrade the coin-selection dependency to a release that is built against CML, then regenerate `package-lock.json` and verify that no `registry.npmjs.org/@emurgo/cardano-serialization-lib-*` tarballs remain.

Until that dependency exists, this repo should not use a package alias override to point CSL imports at CML because it breaks the transitive consumer at module load time.
