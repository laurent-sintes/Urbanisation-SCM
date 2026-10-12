// Downloads need real HTTP: route.fulfill() can emit an event and then cancel the transfer in Chromium.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

export async function downloadServer(dist, prefix) {
  const mime = { '.json': 'application/json; charset=utf-8', '.yaml': 'application/yaml; charset=utf-8', '.pdf': 'application/pdf' };
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      if (!pathname.startsWith(prefix)) throw new Error('prefix');
      const filename = resolve(dist, pathname.slice(prefix.length));
      if (!filename.startsWith(dist + sep) || !mime[extname(filename)]) throw new Error('path');
      const bytes = await readFile(filename);
      response.writeHead(200, { 'Content-Type': mime[extname(filename)], 'Content-Length': bytes.length });
      response.end(request.method === 'HEAD' ? undefined : bytes);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain' });
      response.end('Missing fixture');
    }
  });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  return { base: `http://127.0.0.1:${server.address().port}${prefix}`,
    close: () => new Promise((resolve) => { server.close(resolve); server.closeAllConnections(); }) };
}
