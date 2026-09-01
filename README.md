# @kingandpartners/nuxt-theme

Shared Nuxt theme components, templates, icons, and Sass foundations for King &
Partners projects.

## Usage

Install the package:

```bash
yarn add @kingandpartners/nuxt-theme
```

Compose its shared theme path into the platform configuration:

```js
import platformConfig from '@kingandpartners/nuxt-platform/config';
import themeConfig from '@kingandpartners/nuxt-theme/config';

export default defineNuxtConfig(platformConfig(themeConfig()));
```

The platform uses the supplied path to register shared components and templates,
load shared base Sass, and resolve the `!!shared` Sass alias. The consumer
continues to own `src/themes/<site>`, so project-specific components and styles
can override or extend the shared theme.

## Breakpoints

`breakpoint()` resolves a name from the shared scale in
`src/theme/assets/scss/abstracts/_breakpoints.scss`:

```scss
.hero {
  @include breakpoint(tablet) { padding: 4rem; }
}
```

An unknown name emits no media query — the declarations inside are dropped — and
warns at compile time. Nothing errors, so watch for the warning; the symptom is
missing CSS rather than a failed build.

### Adding a project-specific breakpoint

Configure `$custom-breakpoints` where your theme forwards the shared abstracts,
usually `src/themes/<site>/assets/scss/abstracts/index.scss`:

```scss
@forward '!!shared/assets/scss/abstracts' with (
  $custom-breakpoints: (
    midMobile: (
      min-width: 500px,
    ),
  )
);
@forward 'colors';
@forward 'fonts';
```

Custom entries are merged over the shared scale, so a same-named entry retunes an
existing breakpoint for that project instead of adding one. `breakpoint()` picks
these up with no further wiring.

Two constraints worth knowing:

- Configure it on the barrel your components already load. Each component
  stylesheet is its own Sass compilation, so configuration applied anywhere else
  will not be visible to them.
- The merged scale is `$all-breakpoints`. `$breakpoints` remains the shared scale
  only, so read `$all-breakpoints` if you need the map directly.

## ACF field definitions

A shared component usually needs a matching ACF field group, so this repo ships
both halves and publishes them to two registries from a single git tag:

| Registry | Installed to | Contains |
| --- | --- | --- |
| npm (GitHub Packages) | `node_modules/@kingandpartners/nuxt-theme` | `src/` — the Vue SFCs and Sass |
| Composer (VCS) | `web/app/mu-plugins/nuxt-theme` | `cms/` — the ACF field groups |

One tag, one version number, so a component and its schema cannot drift.

The split exists because `node_modules` never reaches the WordPress container —
a project's `Dockerfile.deploy` copies only `wordpress/`, `cms/`, `src/` and
`bin/`. Field definitions therefore have to travel over Composer.

`.gitattributes` keeps each distribution lean: `src/` is `export-ignore`d so it
stays out of the mu-plugin, and npm packs from the `files` list in
`package.json` so `cms/` stays out of the node package.

Consumers do not require this package directly. `kp-starter` depends on it, and
its loader globs the `cms/shared` tree of every sibling mu-plugin package,
registering what it finds with `shared` priority — so a project can still
override anything shipped here from its own `cms/` or `src/themes/<site>/` tree.

### Adding a component with fields

1. `src/theme/components/<Name>/<Name>.vue` (plus `.scss`) — auto-registered
   through the platform's component paths.
2. `cms/shared/components/<Name>/fields.json` — a normal field group config,
   whose `group.name` becomes the `group_<name>` key other configs can clone.

Nothing else is required; there is no registration list to update.

