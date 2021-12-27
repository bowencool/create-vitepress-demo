import { defineConfig } from 'rollup';
import genBaseConfig, { INPUT_PATH } from './rollup.config.base';

const componentsConfig = defineConfig([
  {
    ...genBaseConfig(),
    input: `${INPUT_PATH}/index.ts`,
    output: [
      {
        // file: 'es/index.js',
        dir: 'es',
        format: 'es',
        preserveModules: true,
        preserveModulesRoot: 'packages',
      },
    ],
  },
  {
    ...genBaseConfig(),
    input: `${INPUT_PATH}/index.ts`,
    output: [
      {
        // file: 'es/index.js',
        dir: 'cjs',
        format: 'cjs',
        preserveModules: true,
        preserveModulesRoot: 'packages',
      },
    ],
  },
]);

export default componentsConfig;
