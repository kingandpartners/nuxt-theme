import assert from 'node:assert/strict';
import { rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import test from 'node:test';
import * as sass from 'sass';

const root = resolve(import.meta.dirname, '..');
const sharedPath = join(root, 'src/theme');
const themePath = join(root, 'test/fixtures/consumer-theme');
const barrelPath = join(themePath, 'assets/scss/abstracts/index.scss');
const componentPath = join(themePath, 'probe.scss');

// The same prefix resolution @kingandpartners/nuxt-platform configures in Vite,
// so these tests exercise the real module graph a consumer compiles through.
const importer = {
  findFileUrl(url) {
    if (url.startsWith('!!theme/')) return new URL(`file://${join(themePath, url.slice('!!theme/'.length))}`);
    if (url.startsWith('!!shared/')) return new URL(`file://${join(sharedPath, url.slice('!!shared/'.length))}`);
    return null;
  },
};

// `@forward ... with` is resolved at load time, so the theme barrel carrying the
// configuration has to be a real file on disk for the importer to find.
const compileConsumer = (barrelConfig, rules) => {
  writeFileSync(barrelPath, `@forward '!!shared/assets/scss/abstracts'${barrelConfig};\n@forward 'colors';\n@forward 'fonts';\n`);
  writeFileSync(componentPath, `@use '!!theme/assets/scss/abstracts' as *;\n${rules}\n`);

  const warnings = [];
  try {
    const { css } = sass.compile(componentPath, {
      importers: [importer],
      logger: { warn: message => warnings.push(message) },
    });
    return { css, warnings };
  } finally {
    rmSync(barrelPath, { force: true });
    rmSync(componentPath, { force: true });
  }
};

const CUSTOM = ` with (
  $custom-breakpoints: (
    tiny: (min-width: 320px),
    tablet: (min-width: 800px),
  )
)`;

test('shared breakpoints resolve when a consumer configures nothing', () => {
  const { css, warnings } = compileConsumer('', '.p { @include breakpoint(tablet) { color: red; } }');

  assert.match(css, /@media \(min-width: 768px\)/);
  assert.deepEqual(warnings, []);
});

test('midMobile is part of the shared scale', () => {
  const { css } = compileConsumer('', '.p { @include breakpoint(midMobile) { color: red; } }');

  assert.match(css, /@media \(min-width: 500px\)/);
});

test('a consumer can add a project-specific breakpoint', () => {
  const { css, warnings } = compileConsumer(CUSTOM, '.p { @include breakpoint(tiny) { color: red; } }');

  assert.match(css, /@media \(min-width: 320px\)/);
  assert.deepEqual(warnings, []);
});

test('a consumer breakpoint overrides a same-named shared one', () => {
  const { css } = compileConsumer(CUSTOM, '.p { @include breakpoint(tablet) { color: red; } }');

  assert.match(css, /@media \(min-width: 800px\)/);
  assert.doesNotMatch(css, /@media \(min-width: 768px\)/);
});

test('configuring custom breakpoints leaves the rest of the shared scale intact', () => {
  const { css } = compileConsumer(CUSTOM, '.p { @include breakpoint(desktop) { color: red; } }');

  assert.match(css, /@media \(min-width: 1200px\)/);
});

test('an unknown breakpoint warns, names the key, and lists what is available', () => {
  const { css, warnings } = compileConsumer('', '.p { @include breakpoint(nope) { color: red; } }');

  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /Unknown breakpoint `nope`/);
  assert.match(warnings[0], /midMobile/);
  assert.match(warnings[0], /\$custom-breakpoints/);
  assert.doesNotMatch(css, /@media/);
});

test('an unknown breakpoint drops its declarations rather than emitting them unwrapped', () => {
  const { css } = compileConsumer('', '.p { color: blue; @include breakpoint(nope) { color: red; } }');

  assert.match(css, /color: blue/);
  assert.doesNotMatch(css, /color: red/);
});
