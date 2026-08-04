import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCipheriv, createDecipheriv, pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

const here = dirname(fileURLToPath(import.meta.url));
const project = resolve(here, '..');
const source = process.argv[2];
const target = process.argv[3] ?? 'assets/main-report.enc.json';
const password = process.env.REPORT_PASSWORD;

if (!source || !password) {
  throw new Error('Usage: REPORT_PASSWORD=... node scripts/encrypt-report.mjs <source.html> [output.json]');
}

const iterations = 310000;
const salt = randomBytes(16);
const iv = randomBytes(12);
const key = pbkdf2Sync(password, salt, iterations, 32, 'sha256');
const cipher = createCipheriv('aes-256-gcm', key, iv);
const html = await readFile(resolve(project, source));
const body = Buffer.concat([cipher.update(html), cipher.final()]);
const tag = cipher.getAuthTag();
const encrypted = Buffer.concat([body, tag]);
const output = resolve(project, target);

const decipher = createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(tag);
const verified = Buffer.concat([decipher.update(body), decipher.final()]);
if (verified.length !== html.length || !timingSafeEqual(verified, html)) {
  throw new Error('Encryption verification failed');
}

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify({
  version: 1,
  algorithm: 'AES-GCM',
  kdf: 'PBKDF2-SHA256',
  iterations,
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  ciphertext: encrypted.toString('base64')
}));

console.log(`Encrypted report written to ${output}`);
