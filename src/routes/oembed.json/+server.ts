// src/routes/oembed.json/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
  const pageUrl = url.searchParams.get('url') || 'https://testbasiskaartgroenengrijs.vercel.app/';
  const maxWidth = url.searchParams.get('maxwidth') || '800';
  const maxHeight = url.searchParams.get('maxheight') || '600';

  // Return oEmbed response for rich content
  return json({
    version: '1.0',
    type: 'rich',
    provider_name: 'Buurtdashboard',
    provider_url: 'https://testbasiskaartgroenengrijs.vercel.app/',
    title: 'Buurtdashboard - Interactive neighborhood dashboard',
    author_name: 'CAS',
    width: parseInt(maxWidth),
    height: parseInt(maxHeight),
    html: `<iframe src="${pageUrl}" width="${maxWidth}" height="${maxHeight}" frameborder="0" style="border: none;" allowfullscreen></iframe>`
  });
};
