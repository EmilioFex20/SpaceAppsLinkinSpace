import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'index.html',  // Tu archivo HTML principal
                iframe: 'emb.html' // Tu segundo archivo HTML
            }
        }
    }
});