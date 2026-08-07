import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const sharedThemePath = resolve(packageRoot, 'theme');

export default function themeConfig() {
  return {
    sharedThemePath,
  };
}
