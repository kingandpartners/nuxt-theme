# Tests

`node --test test/*.test.mjs` (or `yarn test`).

These compile Sass the way a consumer project does — through the `!!theme` and
`!!shared` prefixes, resolved by the same `findFileUrl` importer that
`@kingandpartners/nuxt-platform` configures in Vite — so that behaviour
depending on Sass module load order and configuration is covered. Nothing here
ships: `files` in `package.json` is limited to `src` and `README.md`.

`fixtures/consumer-theme/` stands in for a project theme (`src/themes/<site>/`),
supplying the `colors` and `fonts` modules the shared abstracts expect.
