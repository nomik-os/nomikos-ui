import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseMultipart(
  req: VercelRequest
): Promise<{ name: string; buffer: Buffer; type: string }[]> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const body = Buffer.concat(chunks);
      const contentType = req.headers['content-type'] || '';
      const boundaryMatch = contentType.match(/boundary=(.+)/);
      if (!boundaryMatch) {
        reject(new Error('No boundary found'));
        return;
      }
      resolve(splitMultipart(body, boundaryMatch[1]));
    });
    req.on('error', reject);
  });
}

function splitMultipart(
  body: Buffer,
  boundary: string
): { name: string; buffer: Buffer; type: string }[] {
  const files: { name: string; buffer: Buffer; type: string }[] = [];
  const sep = Buffer.from(`--${boundary}`);
  const end = Buffer.from(`--${boundary}--`);
  let start = body.indexOf(sep) + sep.length;

  while (start < body.length) {
    const next = body.indexOf(sep, start);
    if (next === -1) break;

    const part = body.subarray(start, next);
    const hdrEnd = part.indexOf('\r\n\r\n');
    if (hdrEnd === -1) { start = next + sep.length; continue; }

    const hdr = part.subarray(0, hdrEnd).toString();
    const data = part.subarray(hdrEnd + 4, part.length - 2);
    const nameMatch = hdr.match(/filename="([^"]+)"/);
    const typeMatch = hdr.match(/Content-Type:\s*(.+)/i);

    if (nameMatch) {
      files.push({
        name: nameMatch[1],
        buffer: data,
        type: typeMatch ? typeMatch[1].trim() : 'application/octet-stream',
      });
    }
    start = next + sep.length;
    if (body.indexOf(end, next) === next) break;
  }
  return files;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const files = await parseMultipart(req);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploaded = files.map((f) => ({
      filename: f.name,
      originalName: f.name,
      mimetype: f.type,
      size: f.buffer.length,
      path: f.name,
    }));

    return res.status(200).json({
      success: true,
      data: uploaded.length === 1 ? uploaded[0] : uploaded,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return res.status(500).json({ success: false, error: message });
  }
}
