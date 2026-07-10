import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig({
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: {
                name: 'Montana PQH Team', short_name: 'PQH Team', description: 'Daily performance and goals for the Montana PQH team.',
                theme_color: '#9bd436', background_color: '#071008', display: 'standalone', start_url: '/'
            } })]
});
