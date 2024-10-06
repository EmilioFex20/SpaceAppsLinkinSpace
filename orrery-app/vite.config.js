import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: 'emb.html',  // Tu archivo HTML principal
                iframe: 'index.html' // Tu segundo archivo HTML
            }
        }
    }
});