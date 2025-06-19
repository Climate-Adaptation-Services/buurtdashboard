// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { 
  BUURT_GEOJSON_URL,
  MUNICIPALITY_JSON_URL,
  DEFAULT_METADATA_URL, 
  DEFAULT_METADATA_ENGLISH_URL,
  DEFAULT_CSV_DATA_URL,
  DORDRECHT_METADATA_URL,
  DORDRECHT_METADATA_ENGLISH_URL,
  DORDRECHT_CSV_DATA_URL
} from '$lib/datasets';

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Add the hint only to HTML documents
  if (response.headers.get('content-type')?.startsWith('text/html')) {
    // Get config parameter to determine which URLs to preload
    const configParam = event.url.searchParams.get('config') || 'default';
    
    // Add preload for GeoJSON data
    response.headers.append(
      'Link',
      `<${BUURT_GEOJSON_URL}>; ` +
        'rel=preload; as=fetch; type="application/json"; ' +
        'crossorigin; fetchpriority=high'
    );
    
    // Add preload for Municipality GeoJSON data
    response.headers.append(
      'Link',
      `<${MUNICIPALITY_JSON_URL}>; ` +
        'rel=preload; as=fetch; type="application/json"; ' +
        'crossorigin; fetchpriority=high'
    );
    
    // Add preload for metadata and CSV data based on config
    if (configParam === 'dordrecht') {
      // Preload Dordrecht metadata
      response.headers.append(
        'Link',
        `<${DORDRECHT_METADATA_URL}>; ` +
          'rel=preload; as=fetch; type="text/csv"; ' +
          'crossorigin; fetchpriority=high'
      );
      
      // Preload Dordrecht English metadata
      response.headers.append(
        'Link',
        `<${DORDRECHT_METADATA_ENGLISH_URL}>; ` +
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
      // Preload default metadata
      response.headers.append(
        'Link',
        `<${DEFAULT_METADATA_URL}>; ` +
          'rel=preload; as=fetch; type="text/csv"; ' +
          'crossorigin; fetchpriority=high'
      );
      
      // Preload default English metadata
      response.headers.append(
        'Link',
        `<${DEFAULT_METADATA_ENGLISH_URL}>; ` +
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
