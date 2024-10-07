import { defineConfig } from 'vite';
import vanilla from '@vite/js/plugins-vanilla'

export default defineConfig({
  base: '/SpaceAppsLinkinSpace/', // Reemplaza 'nombre-del-repo' por el nombre de tu repositorio de GitHub
  plugins: [vanilla()]
});
