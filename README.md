# Switchboard Add-in Support

## To set this up for development with Switchboard, the first step is to get [this](https://github.com/switchboard-xyz/switchboard-core/blob/main/switchboard_v2/tests/addin-tests.ts) to work.

- [install anchor](https://book.anchor-lang.com/getting_started/installation.html#installing-using-anchor-version-manager-avm-recommended) if you don't currently have it installed
- navigate to the `switchboard_v2` directory within `switchboard-core` and run `anchor test`. This will build switchboardv2 and run the addin-tests.ts script, which will set up a realm, governance, queue, oracles, permissions, and proposal.
- you will need to make sure the pubkeys of the governance program and switchboard program throughout the codebase are pointed to your local pubkeys of those programs:
- you can determine the pubkeys of the localnet switchboardv2 and governance programs by navigating to `switchboard-core/switchboard_v2/target/deploy` and running `solana-keygen pubkey switchboard_v2-keypair.json` and `solana-keygen pubkey spl_governance-keypair.json` respectively
- You'll need to set the `declare_id!(...)` in Switchboardv2's `lib.rs` to point at your localnet switchboard program's pubkey, and you'll need to set Switchboardv2's `lib.rs` `GOVERNANCE_PID` variable to the spl_governance pubkey.
- you'll also need to ensure that `sbv2.ts` variable GOVERNANCE_PID points at the correct pubkey for your localnet governance program
- when you want to run the UI, start a local validator by running `solana-test-validator`. This will created a directory called `test-ledger` in the location you run the command.
- run the addin test suite, `anchor test`
- start the governance-ui by running `yarn dev`

## Working on governance-ui

- most of the work is in `hooks/useRealm.ts` and `hooks/useVotingPlugins.ts` in the governance-ui. The UI work is in `components/TokenBalance`

# NextJS Typescript Boilerplate

Bootstrap a developer-friendly NextJS app configured with:

- [Typescript](https://www.typescriptlang.org/)
- Linting with [ESLint](https://eslint.org/)
- Formatting with [Prettier](https://prettier.io/)
- Linting, typechecking and formatting on by default using [`husky`](https://github.com/typicode/husky) for commit hooks
- Testing with [Jest](https://jestjs.io/) and [`react-testing-library`](https://testing-library.com/docs/react-testing-library/intro)

## Deploy your own

Deploy the example using [Vercel](https://vercel.com?utm_source=github&utm_medium=readme&utm_campaign=next-example):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/vercel/next.js/tree/canary/examples/with-typescript-eslint-jest&project-name=with-typescript-eslint-jest&repository-name=with-typescript-eslint-jest)

## How to use

Execute [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app) with [npm](https://docs.npmjs.com/cli/init) or [Yarn](https://yarnpkg.com/lang/en/docs/cli/create/) to bootstrap the example:

```bash
npx create-next-app --example with-typescript-eslint-jest with-typescript-eslint-jest-app
# or
yarn create next-app --example with-typescript-eslint-jest with-typescript-eslint-jest-app
```

Deploy it to the cloud with [Vercel](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=next-example) ([Documentation](https://nextjs.org/docs/deployment)).
