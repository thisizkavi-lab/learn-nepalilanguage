import path from 'path';
import { cpSync } from 'node:fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  const root = import.meta.dirname;
  return {
    base: '/learn-nepalilanguage/',
    resolve: {
      alias: {
        '@': root,
      },
    },
    // The site also runs directly on GitHub Pages, using classic scripts and
    // runtime image URLs in lesson data. Include those in the preview build.
    plugins: [{
      name: 'copy-static-learning-content',
      apply: 'build',
      writeBundle(options) {
        const output = path.resolve(root, options.dir || 'dist');
        for (const entry of ['js', 'css', 'assets', 'practice.html', 'reading.html', 'quiz.html']) {
          cpSync(path.join(root, entry), path.join(output, entry), { recursive: true });
        }
      },
    }],
  };
});
