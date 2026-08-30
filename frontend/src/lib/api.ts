/**
 * Safely constructs a full API URL, ensuring a valid protocol (http:// or https://)
 * and normalizing slashes to prevent ERR_INVALID_URL errors during SSR / static export.
 */
export function getApiUrl(path: string = ''): string {
    let baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').trim();

    // If protocol is missing, auto-prepend https:// (or http:// for localhost)
    if (!/^https?:\/\//i.test(baseUrl)) {
        if (/^(localhost|127\.0\.0\.1)/i.test(baseUrl)) {
            baseUrl = `http://${baseUrl}`;
        } else {
            baseUrl = `https://${baseUrl}`;
        }
    }

    // Remove trailing slash from base URL
    baseUrl = baseUrl.replace(/\/+$/, '');

    // Ensure path starts with / if path is provided
    const cleanPath = path ? (path.startsWith('/') ? path : `/${path}`) : '';

    return `${baseUrl}${cleanPath}`;
}
