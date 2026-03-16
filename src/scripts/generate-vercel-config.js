import { writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';

const vercelConfig = {
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html'
    }
  ]
};

// Write vercel.json to root for Vercel to find
writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ Generated vercel.json in root');

// Ensure _redirects is a file, not a directory
const redirectsPath = join('public', '_redirects');
if (existsSync(redirectsPath)) {
  const stats = await import('fs').then(fs => fs.statSync(redirectsPath));
  if (stats.isDirectory()) {
    console.log('⚠️  _redirects is a directory, removing it...');
    rmSync(redirectsPath, { recursive: true, force: true });
  }
}

// Write _redirects file
writeFileSync(redirectsPath, '/*    /index.html   200\n');
console.log('✅ Generated _redirects file');