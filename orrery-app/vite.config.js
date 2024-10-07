import { defineConfig } from 'vite';

export default defineConfig({
  base: '/SpaceAppsLinkinSpace/', // Reemplaza 'nombre-del-repo' por el nombre de tu repositorio de GitHub
  build: {
    outDir: 'docs', // Cambia la carpeta de salida a 'docs' para GitHub Pages
  }
});
