/**
 * @returns A complete public URL prefixed with the public static assets base
 * path.
 * @param path - path to prepend prefix to
 */
export function publicUrl(path) {
  // The baseUrl must be ending with the slash. The reason is if the baseUrl will
  // equal to "/my-base", then passing a path without a leading slash will not
  // give us the expected result due to the URL constructor behavior.
  let baseUrl = import.meta.env.BASE_URL;
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/';
  }

  let isBaseAbsolute = false;
  try {
    new URL(baseUrl);
    isBaseAbsolute = true;
  } catch { /* empty */
  }

  return new URL(
    // The path is not allowed to be starting with the slash as long as it will break the
    // base URL. For instance, having the "/my-base/" base URL and a path starting with "/",
    // we will not get the expected result.
    path.replace(/^\/+/, ''),
    isBaseAbsolute
      ? baseUrl
      : window.location.origin + baseUrl,
  ).toString();
}
