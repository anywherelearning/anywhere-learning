// Vercel Blob URLs are public by default.
// For protected downloads, we proxy through our API route
// which checks auth before streaming the blob content.
// The blob URL is never exposed directly to the client.

export async function getFileUrl(blobUrl: string): Promise<string> {
  return blobUrl;
}

export async function streamBlobToResponse(blobUrl: string): Promise<Response> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.status}`);
  }
  return response;
}
