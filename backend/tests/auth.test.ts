import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { authenticateUser } from '../src/middleware/auth';

async function withServer(run: (base: string) => Promise<void>) {
  const app = express();
  app.get('/protected', authenticateUser, (_req, res) => res.json({ ok: true }));
  const server = app.listen(0);
  try {
    const addr = server.address();
    if (!addr || typeof addr === 'string') throw new Error('No bound port');
    await run(`http://127.0.0.1:${addr.port}`);
  } finally {
    await new Promise<void>((resolve, reject) =>
      server.close(err => err ? reject(err) : resolve()));
  }
}

test('production rejects a missing bearer token', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await withServer(async base => {
      const response = await fetch(base + '/protected');
      assert.equal(response.status, 401);
    });
  } finally { process.env.NODE_ENV = previous; }
});

test('production rejects demo bearer tokens', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await withServer(async base => {
      for (const token of ['demo-token', 'demo-jwt-123']) {
        const response = await fetch(base + '/protected', {
          headers: { authorization: `Bearer ${token}` }
        });
        assert.equal(response.status, 401);
      }
    });
  } finally { process.env.NODE_ENV = previous; }
});

test('missing credentials cannot grant a production session', async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  try {
    await withServer(async base => {
      const response = await fetch(base + '/protected', {
        headers: { authorization: 'Bearer arbitrary-token' }
      });
      assert.equal(response.status, 401);
    });
  } finally { process.env.NODE_ENV = previous; }
});
