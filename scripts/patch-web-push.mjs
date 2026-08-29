import { readFile, writeFile } from 'node:fs/promises';

const target = new URL('../node_modules/@block65/webcrypto-web-push/dist/lib/isomorphic-crypto.js', import.meta.url);
const incompatible = `const impl = globalThis.crypto
    ? globalThis.crypto
    : await import('node:crypto');`;
const workerCompatible = 'const impl = globalThis.crypto;';
const source = await readFile(target, 'utf8');

if (source.includes(incompatible)) {
  await writeFile(target, source.replace(incompatible, workerCompatible));
} else if (!source.includes(workerCompatible)) {
  throw new Error('web-push 호환 패치 대상 코드가 변경되었습니다. 패키지 버전을 확인해 주세요.');
}
