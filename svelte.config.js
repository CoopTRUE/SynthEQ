import adapter from '@sveltejs/adapter-node'
import preprocess from 'svelte-preprocess'
import path from 'path'
import autoprefixer from 'autoprefixer'

const __dirname = path.resolve()

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [
    preprocess({
      postcss: {
        plugins: [autoprefixer()]
      }
    })
  ],

  kit: {
    adapter: adapter({ precompress: true }),
    alias: {
      $components: path.resolve(__dirname, './src/lib/components'),
      $client: path.resolve(__dirname, './src/lib/client'),
      $server: path.resolve(__dirname, './src/lib/server'),
      '@constants': path.resolve(__dirname, './src/constants.ts')
    }
  }
}

export default config
