import dotenv from "dotenv"
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // Node.js built-in module
import { fileURLToPath } from 'url';

dotenv.config()

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  build: {
    // eslint-disable-next-line no-undef
    outDir: process.env.BUILD_PATH || path.resolve(__dirname, 'dist'), // Default to 'dist' if BUILD_PATH isn't set
    emptyOutDir: true
  }
});
