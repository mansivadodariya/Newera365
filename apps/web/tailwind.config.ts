import type { Config } from 'tailwindcss';
// Cache-bust note: bump this file when editing the preset in packages/config —
// the dev server does not watch preset changes across workspace packages. (v5)
import preset from '@newera365/config/tailwind-preset';

const config: Config = {
  presets: [preset],
  content: ['./src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
