import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env.APPWRITE_ENDPOINT': JSON.stringify(env.APPWRITE_ENDPOINT || 'https://mentor-db.sustainablegrowthlabs.com/v1'),
      'process.env.APPWRITE_PROJECT': JSON.stringify(env.APPWRITE_PROJECT || '6723a47b7732b1007525'),
      'process.env.APPWRITE_API_KEY': JSON.stringify(env.APPWRITE_API_KEY),
    },
  };
});