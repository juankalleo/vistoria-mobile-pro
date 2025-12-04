export async function cachePdfBlob(filename: string, blob: Blob) {
  try {
    const cache = await caches.open("pdfs-cache");
    const url = `/offline-pdfs/${filename}`; // key usada para recuperar
    const resp = new Response(blob, { headers: { "Content-Type": "application/pdf" } });
    await cache.put(url, resp);
    return url;
  } catch (err) {
    console.warn("cachePdfBlob failed", err);
    return null;
  }
}

export async function getCachedPdfUrl(filename: string) {
  const cache = await caches.open("pdfs-cache");
  const url = `/offline-pdfs/${filename}`;
  const match = await cache.match(url);
  if (!match) return null;
  const blob = await match.blob();
  return URL.createObjectURL(blob);
}