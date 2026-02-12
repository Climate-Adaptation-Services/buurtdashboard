// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import {
  BUURT_GEOJSON_URL,
  MUNICIPALITY_JSON_URL,
  DEFAULT_INDICATORS_CONFIG_URL,
  DEFAULT_CSV_DATA_URL,
  DORDRECHT_INDICATORS_CONFIG_URL,
  DORDRECHT_CSV_DATA_URL
} from '$lib/datasets';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Remove X-Frame-Options to allow embedding
  response.headers.delete('X-Frame-Options');

  // Add the hint only to HTML documents
  if (response.headers.get('content-type')?.startsWith('text/html')) {
    // Get config parameter to determine which URLs to preload
    // Check if we're in a prerendering environment
    const configParam = import.meta.env.SSR && !import.meta.env.DEV ? 'default' : event.url.searchParams.get('config') || 'default';
    
    // Add preload for GeoJSON data (gzipped)
    response.headers.append(
      'Link',
      `<${BUURT_GEOJSON_URL}>; ` +
        'rel=preload; as=fetch; type="application/gzip"; ' +
        'crossorigin; fetchpriority=high'
    );
    
    // Add preload for Municipality GeoJSON data
    response.headers.append(
      'Link',
      `<${MUNICIPALITY_JSON_URL}>; ` +
        'rel=preload; as=fetch; type="application/json"; ' +
        'crossorigin; fetchpriority=high'
    );
    
    // Add preload for indicators config and CSV data based on config
    if (configParam === 'dordrecht') {
      // Preload Dordrecht indicators config
      response.headers.append(
        'Link',
        `<${DORDRECHT_INDICATORS_CONFIG_URL}>; ` +
          'rel=preload; as=fetch; type="text/csv"; ' +
          'crossorigin; fetchpriority=high'
      );

      // Preload Dordrecht CSV data
      response.headers.append(
        'Link',
        `<${DORDRECHT_CSV_DATA_URL}>; ` +
          'rel=preload; as=fetch; type="application/zip"; ' +
          'crossorigin; fetchpriority=high'
      );
    } else {
      // Preload default indicators config (English translations applied client-side)
      response.headers.append(
        'Link',
        `<${DEFAULT_INDICATORS_CONFIG_URL}>; ` +
          'rel=preload; as=fetch; type="text/csv"; ' +
          'crossorigin; fetchpriority=high'
      );

      // Preload default CSV data
      response.headers.append(
        'Link',
        `<${DEFAULT_CSV_DATA_URL}>; ` +
          'rel=preload; as=fetch; type="application/gzip"; ' +
          'crossorigin; fetchpriority=high'
      );
    }
  }

  return response;
};
