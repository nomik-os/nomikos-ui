import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PDFDocument } from 'pdf-lib';
import { uploadToR2 } from './_r2';

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
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

function isPdf(type: string, name: string): boolean {
  return type === 'application/pdf' || name.toLowerCase().endsWith('.pdf');
}

function isImage(type: string): boolean {
  return ['image/png', 'image/jpeg', 'image/jpg'].includes(type);
}

function isText(type: string, name: string): boolean {
  const lower = name.toLowerCase();
  return type === 'text/plain' || type === 'text/csv' || lower.endsWith('.txt') || lower.endsWith('.csv');
}

async function embedImage(mergedPdf: PDFDocument, buffer: Buffer, type: string): Promise<void> {
  const image = type === 'image/png'
    ? await mergedPdf.embedPng(buffer)
    : await mergedPdf.embedJpg(buffer);

  const { width, height } = image.scale(1);
  const a4W = 595.28;
  const a4H = 841.89;
  const scale = Math.min(a4W / width, a4H / height, 1);

  const page = mergedPdf.addPage([a4W, a4H]);
  page.drawImage(image, {
    x: (a4W - width * scale) / 2,
    y: (a4H - height * scale) / 2,
    width: width * scale,
    height: height * scale,
  });
}

function embedText(mergedPdf: PDFDocument, buffer: Buffer): void {
  const lines = buffer.toString('utf-8').split('\n');
  const perPage = 50;
  const fontSize = 11;
  const margin = 50;
  const a4W = 595.28;
  const a4H = 841.89;

  for (let i = 0; i < lines.length; i += perPage) {
    const chunk = lines.slice(i, i + perPage);
    const page = mergedPdf.addPage([a4W, a4H]);
    let y = a4H - margin;
    for (const line of chunk) {
      if (y < margin) break;
      page.drawText(line.replace(/\r/g, '').substring(0, 90), { x: margin, y, size: fontSize });
      y -= fontSize * 1.4;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')
    return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const files = await parseMultipart(req);

    if (files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 files required for merging' });
    }

    // Upload originals to R2
    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      await uploadToR2(`originals/${timestamp}_${safeName}`, file.buffer, file.type);
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      if (isPdf(file.type, file.name)) {
        const src = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(src, src.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
      } else if (isImage(file.type)) {
        await embedImage(mergedPdf, file.buffer, file.type);
      } else if (isText(file.type, file.name)) {
        embedText(mergedPdf, file.buffer);
      } else {
        const page = mergedPdf.addPage([595.28, 841.89]);
        page.drawText(`Document: ${file.name}`, { x: 50, y: 750, size: 14 });
        page.drawText(`Format: ${file.type}`, { x: 50, y: 720, size: 11 });
        page.drawText('This file format requires conversion to PDF before merging.', { x: 50, y: 680, size: 11 });
      }
    }

    const totalPages = mergedPdf.getPageCount();
    const mergedBytes = await mergedPdf.save();
    const mergedBuffer = Buffer.from(mergedBytes);

    // Upload merged PDF to R2
    const timestamp = Date.now();
    const mergedKey = `merged/${timestamp}_merged_${totalPages}pages.pdf`;
    const mergedUrl = await uploadToR2(mergedKey, mergedBuffer, 'application/pdf');

    // Return the merged PDF as download + store URL in header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="merged_${totalPages}pages.pdf"`);
    res.setHeader('Content-Length', mergedBuffer.length);
    res.setHeader('X-Total-Pages', String(totalPages));
    res.setHeader('X-R2-Url', mergedUrl);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Pages, X-R2-Url');

    return res.status(200).send(mergedBuffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Merge failed';
    return res.status(500).json({ success: false, error: message });
  }
}
