import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Reason: Vite config with React plugin
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  }
});
