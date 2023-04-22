import { svelte } from "buchta/plugins/svelte";
import { BuchtaConfig } from "buchta/src/buchta";

export default {
    rootDir: import.meta.dir,

    port: 3000,
    ssr: true,
    plugins: [svelte()],
} as BuchtaConfig;
