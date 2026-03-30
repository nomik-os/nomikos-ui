import express from 'express';
import cors from 'cors';
import { PDFDocument } from 'pdf-lib';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const app = express();
const PORT = 3001;

app.use(cors());

// ── R2 Config ──
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '54cd3025809f1236231df961a17bee09';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'nomikos-documents';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-0bda3108aed14bf8a9fbdddedb544014.r2.dev';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

async function uploadToR2(key, body, contentType) {
  if (!R2_ACCESS_KEY_ID) {
    console.log(`  [r2-skip] No R2 credentials, skipping upload for ${key}`);
    return `${R2_PUBLIC_URL}/${key}`;
  }
  await r2Client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
  const url = `${R2_PUBLIC_URL}/${key}`;
  console.log(`  [r2] Uploaded: ${url}`);
  return url;
}

// Parse raw multipart manually
function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
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

function splitMultipart(body, boundary) {
  const files = [];
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

// ── Upload endpoint ──
app.post('/api/upload', async (req, res) => {
  try {
    const files = await parseMultipart(req);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploaded = [];
    for (const f of files) {
      const timestamp = Date.now();
      const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `uploads/${timestamp}_${safeName}`;
      const url = await uploadToR2(key, f.buffer, f.type);

      uploaded.push({
        filename: key,
        originalName: f.name,
        mimetype: f.type,
        size: f.buffer.length,
        path: key,
        url,
      });
    }

    console.log(`[upload] ${uploaded.length} file(s) uploaded`);
    return res.json({ success: true, data: uploaded.length === 1 ? uploaded[0] : uploaded });
  } catch (err) {
    console.error('[upload] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Upload multiple endpoint ──
app.post('/api/upload-multiple', async (req, res) => {
  try {
    const files = await parseMultipart(req);
    if (files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    const uploaded = [];
    for (const f of files) {
      const timestamp = Date.now();
      const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const key = `uploads/${timestamp}_${safeName}`;
      const url = await uploadToR2(key, f.buffer, f.type);

      uploaded.push({
        filename: key,
        originalName: f.name,
        mimetype: f.type,
        size: f.buffer.length,
        path: key,
        url,
      });
    }

    console.log(`[upload-multiple] ${uploaded.length} file(s) uploaded`);
    return res.json({ success: true, data: uploaded });
  } catch (err) {
    console.error('[upload-multiple] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ── Merge endpoint ──
app.post('/api/merge', async (req, res) => {
  try {
    const files = await parseMultipart(req);

    if (files.length < 2) {
      return res.status(400).json({ success: false, error: 'At least 2 files required for merging' });
    }

    console.log(`[merge] Merging ${files.length} files:`, files.map(f => f.name));

    // Upload originals to R2
    for (const file of files) {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      await uploadToR2(`originals/${timestamp}_${safeName}`, file.buffer, file.type);
    }

    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const lower = file.name.toLowerCase();
      const isPdf = file.type === 'application/pdf' || lower.endsWith('.pdf');
      const isImage = ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type);
      const isText = file.type === 'text/plain' || file.type === 'text/csv' || lower.endsWith('.txt') || lower.endsWith('.csv');

      if (isPdf) {
        const src = await PDFDocument.load(file.buffer);
        const pages = await mergedPdf.copyPages(src, src.getPageIndices());
        pages.forEach((p) => mergedPdf.addPage(p));
        console.log(`  [pdf] ${file.name}: ${pages.length} pages`);
      } else if (isImage) {
        const image = file.type === 'image/png'
          ? await mergedPdf.embedPng(file.buffer)
          : await mergedPdf.embedJpg(file.buffer);
        const { width, height } = image.scale(1);
        const a4W = 595.28, a4H = 841.89;
        const scale = Math.min(a4W / width, a4H / height, 1);
        const page = mergedPdf.addPage([a4W, a4H]);
        page.drawImage(image, {
          x: (a4W - width * scale) / 2,
          y: (a4H - height * scale) / 2,
          width: width * scale,
          height: height * scale,
        });
        console.log(`  [image] ${file.name}: 1 page`);
      } else if (isText) {
        const lines = file.buffer.toString('utf-8').split('\n');
        const perPage = 50, fontSize = 11, margin = 50;
        const a4W = 595.28, a4H = 841.89;
        let pageCount = 0;
        for (let i = 0; i < lines.length; i += perPage) {
          const chunk = lines.slice(i, i + perPage);
          const page = mergedPdf.addPage([a4W, a4H]);
          let y = a4H - margin;
          for (const line of chunk) {
            if (y < margin) break;
            page.drawText(line.replace(/\r/g, '').substring(0, 90), { x: margin, y, size: fontSize });
            y -= fontSize * 1.4;
          }
          pageCount++;
        }
        console.log(`  [text] ${file.name}: ${pageCount} pages`);
      } else {
        const page = mergedPdf.addPage([595.28, 841.89]);
        page.drawText(`Document: ${file.name}`, { x: 50, y: 750, size: 14 });
        page.drawText(`Format: ${file.type}`, { x: 50, y: 720, size: 11 });
        page.drawText('This file format requires conversion to PDF before merging.', { x: 50, y: 680, size: 11 });
        console.log(`  [unsupported] ${file.name}: placeholder page`);
      }
    }

    const totalPages = mergedPdf.getPageCount();
    const mergedBytes = await mergedPdf.save();
    const mergedBuffer = Buffer.from(mergedBytes);

    // Upload merged PDF to R2
    const timestamp = Date.now();
    const mergedKey = `merged/${timestamp}_merged_${totalPages}pages.pdf`;
    const mergedUrl = await uploadToR2(mergedKey, mergedBuffer, 'application/pdf');

    console.log(`[merge] Done: ${totalPages} pages, ${mergedBuffer.length} bytes, R2: ${mergedUrl}`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="merged_${totalPages}pages.pdf"`);
    res.setHeader('Content-Length', mergedBuffer.length);
    res.setHeader('X-Total-Pages', String(totalPages));
    res.setHeader('X-R2-Url', mergedUrl);
    res.setHeader('Access-Control-Expose-Headers', 'X-Total-Pages, X-R2-Url');

    return res.status(200).send(mergedBuffer);
  } catch (err) {
    console.error('[merge] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
  console.log(`R2 bucket: ${R2_BUCKET_NAME}`);
  console.log(`R2 credentials: ${R2_ACCESS_KEY_ID ? 'configured' : 'NOT SET — uploads will be skipped'}`);
});
