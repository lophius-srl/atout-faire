import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    // Dublin : la même région que la base Supabase (eu-west-1), pour des échanges rapides.
    adapter: adapter({ regions: ["dub1"] }),
  },
};

export default config;
