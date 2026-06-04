// Hackathon demo server — single-file Node, zero framework.
//
// Serves public/ as static, exposes one bootstrap endpoint, and shows
// where a Claude API proxy would live (commented stub at the bottom).
// Target shape: this file + public/* + src/lib/* + .env, ~150 LOC total.
//
// Run: `node server.js` (requires Node 20.11+).

import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { listKnowledgeItems, describeKnowledgeSource } from './src/lib/knowledge.js';
import { incrementAndGetVisits } from './src/lib/visit-counter.js';
import { getCurrentUser } from './src/lib/auth.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = resolve(__dirname, 'public');
const PORT = Number(process.env.PORT) || 5173;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};

function sendJson(res, status, value) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(value));
}

function serveStatic(req, res) {
  const requested = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const fullPath = resolve(PUBLIC_DIR, '.' + requested);
  if (!fullPath.startsWith(PUBLIC_DIR) || !existsSync(fullPath) || !statSync(fullPath).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
    return;
  }
  const body = readFileSync(fullPath);
  res.writeHead(200, { 'content-type': MIME[extname(fullPath)] || 'application/octet-stream' });
  res.end(body);
}

const server = createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/api/bootstrap') {
    return sendJson(res, 200, {
      user: getCurrentUser(),
      items: listKnowledgeItems(),
      source: describeKnowledgeSource(),
      visits: incrementAndGetVisits(),
    });
  }

  // Sprint-customisation hook: add a Claude API proxy here when a demo
  // needs one. Pattern:
  //
  //   if (req.method === 'POST' && req.url === '/api/llm') {
  //     const body = await new Promise((r) => {
  //       let chunks = ''; req.on('data', (c) => chunks += c); req.on('end', () => r(chunks));
  //     });
  //     const upstream = await fetch('https://api.anthropic.com/v1/messages', {
  //       method: 'POST',
  //       headers: {
  //         'content-type': 'application/json',
  //         'x-api-key': process.env.ANTHROPIC_API_KEY,
  //         'anthropic-version': '2023-06-01',
  //       },
  //       body, // pass through { model, max_tokens, messages }
  //     });
  //     return sendJson(res, upstream.status, await upstream.json());
  //   }
  //
  // Set ANTHROPIC_API_KEY in .env (or your shell). Use the latest model
  // for the demo — see CLAUDE.md for the current model ID convention.

  if (req.method === 'GET') {
    return serveStatic(req, res);
  }
  res.writeHead(405, { 'content-type': 'text/plain' }).end('Method not allowed');
});

server.listen(PORT, () => {
  console.log(`Hackathon demo running at http://localhost:${PORT}`);
});
