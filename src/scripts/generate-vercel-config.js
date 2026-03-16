import { writeFileSync } from 'fs';

const vercelConfig = {
  rewrites: [
    {
      source: '/(.*)',
      destination: '/index.html'
    }
  ]
};

writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
console.log('✅ Generated vercel.json');
