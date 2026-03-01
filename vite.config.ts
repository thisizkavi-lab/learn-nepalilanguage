import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: '/learn-nepalilanguage/',
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
