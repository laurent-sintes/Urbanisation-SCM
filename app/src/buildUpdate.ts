/** Loaded entry points identify the running software independently of model versions. */
export function buildHasChanged(manifest: unknown, loadedAssets: readonly string[]): boolean {
  if (!manifest || typeof manifest !== 'object') return false;
  const data = manifest as { schema_version?: number; files?: Record<string, string> };
  const files = data.files;
  if (data.schema_version !== 1 || !files || !Object.hasOwn(files, 'index.html')) return false;
  return loadedAssets.some((asset) => !Object.hasOwn(files, asset));
}
