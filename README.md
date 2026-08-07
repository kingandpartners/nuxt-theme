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

ACF field definitions are intentionally not bundled into the frontend package.
They belong to the WordPress/CMS boundary and should live in the consumer's
`cms/shared/components` tree (or a future shared CMS package).

