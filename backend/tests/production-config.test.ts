import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

test('production startup fails without valid Supabase configuration', () => {
  const result = spawnSync(process.execPath, [
    resolve(process.cwd(), 'dist/server.js')
  ], {
    env: {
      ...process.env,
      NODE_ENV: 'production',
      SUPABASE_URL: '',
      SUPABASE_ANON_KEY: '',
      SUPABASE_SERVICE_ROLE_KEY: ''
    }, encoding: 'utf8', timeout: 10000
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Production requires a valid HTTPS SUPABASE_URL/);
});
