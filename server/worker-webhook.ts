import { callbackUrl, type WebhookTransport } from './webhook.js';
/** Workers fetch handles TLS/DNS. Restrict destinations to explicitly trusted callback
 * hostnames; do not use an arbitrary DNS lookup followed by an unpinned fetch. */
export function workerWebhook(hosts: string): WebhookTransport {
  const allowed = new Set(hosts.split(',').map(s => s.trim()).filter(Boolean));
  if ([...allowed].some(host => !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/.test(host))) throw new Error('Invalid callback allowlist');
  return async (input, body, headers, authorize) => {
    const url = callbackUrl(input);
    if (!allowed.has(url.hostname)) throw new Error('Callback host is not configured');
    if (Buffer.byteLength(body) > 256 * 1024) throw new Error('Webhook payload too large');
    await authorize?.();
    const response = await fetch(url, { method: 'POST', headers, body, redirect: 'manual', signal: AbortSignal.timeout(10000) });
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = []; let size = 0;
    if (reader) try {
      while (true) {
        const part = await reader.read(); if (part.done) break;
        size += part.value.byteLength;
        if (size > 65536) throw new Error('Webhook response too large');
        chunks.push(part.value);
      }
    } finally { await reader.cancel(); }
    return { status: response.status, body: Buffer.concat(chunks).toString('utf8') };
  };
}
