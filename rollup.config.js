import typescript from 'rollup-plugin-typescript2';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';

import packageJson from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'auto',
    },
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      exports: 'auto',
    },
    {
      name: 'ReactTags',
      file: packageJson.browser,
      format: 'umd',
      sourcemap: true,
      globals: { react: 'React' },
    },
  ],
  plugins: [peerDepsExternal(), resolve(), commonjs(), typescript(), terser()],
};
