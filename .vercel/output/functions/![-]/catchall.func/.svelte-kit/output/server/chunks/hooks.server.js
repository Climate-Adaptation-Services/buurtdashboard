import { B as BUURT_GEOJSON_URL, M as MUNICIPALITY_JSON_URL, a as DEFAULT_METADATA_URL, c as DEFAULT_METADATA_ENGLISH_URL, e as DEFAULT_CSV_DATA_URL } from "./datasets.js";
const handle = async ({ event, resolve }) => {
  const response = await resolve(event);
  if (response.headers.get("content-type")?.startsWith("text/html")) {
    response.headers.append(
      "Link",
      `<${BUURT_GEOJSON_URL}>; rel=preload; as=fetch; type="application/json"; crossorigin; fetchpriority=high`
    );
    response.headers.append(
      "Link",
      `<${MUNICIPALITY_JSON_URL}>; rel=preload; as=fetch; type="application/json"; crossorigin; fetchpriority=high`
    );
    {
      response.headers.append(
        "Link",
        `<${DEFAULT_METADATA_URL}>; rel=preload; as=fetch; type="text/csv"; crossorigin; fetchpriority=high`
      );
      response.headers.append(
        "Link",
        `<${DEFAULT_METADATA_ENGLISH_URL}>; rel=preload; as=fetch; type="text/csv"; crossorigin; fetchpriority=high`
      );
      response.headers.append(
        "Link",
        `<${DEFAULT_CSV_DATA_URL}>; rel=preload; as=fetch; type="application/gzip"; crossorigin; fetchpriority=high`
      );
    }
  }
  return response;
};
export {
  handle
};
