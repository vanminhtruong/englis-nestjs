import { BadRequestException } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { get as httpsGet } from 'https';
import { BlockList, isIP } from 'net';

const MAX_BACKGROUND_BYTES = 5 * 1024 * 1024;
const MAX_URL_LENGTH = 2048;
const REQUEST_TIMEOUT_MS = 10000;
const forbidden = new BlockList();

// Reject private, loopback, link-local, carrier-grade NAT, documentation,
// benchmark, multicast and reserved IPv4 address ranges.
for (const [address, prefix] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.0.2.0', 24],
  ['192.88.99.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['198.51.100.0', 24],
  ['203.0.113.0', 24],
  ['224.0.0.0', 4],
  ['240.0.0.0', 4],
] as const)
  forbidden.addSubnet(address, prefix, 'ipv4');

export function isPublicIpv4(address: string): boolean {
  return isIP(address) === 4 && !forbidden.check(address, 'ipv4');
}

export function validateRemoteBackgroundUrl(value: string): URL {
  if (typeof value !== 'string' || !value || value.length > MAX_URL_LENGTH) {
    throw new BadRequestException('Invalid background image URL');
  }
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new BadRequestException('Invalid background image URL');
  }

  // HTTPS on its standard port only. Prevent credentials, arbitrary ports,
  // redirects, local hostnames, and IP literal tricks from becoming SSRF routes.
  if (
    url.protocol !== 'https:' ||
    url.port !== '' ||
    !!url.username ||
    !!url.password ||
    !url.hostname ||
    url.hostname.length > 253 ||
    url.hostname.startsWith('[') ||
    url.hostname === 'localhost' ||
    url.hostname.endsWith('.localhost') ||
    url.hostname.endsWith('.local') ||
    url.hostname.endsWith('.internal') ||
    url.hostname.endsWith('.test') ||
    url.hostname.endsWith('.invalid') ||
    url.hostname.endsWith('.onion') ||
    url.hostname.endsWith('.')
  ) {
    throw new BadRequestException('Use a direct public HTTPS image URL');
  }
  if (isIP(url.hostname) && !isPublicIpv4(url.hostname)) {
    throw new BadRequestException('Private network URLs are not allowed');
  }
  return url;
}

export interface DownloadedBackground {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
}

export async function downloadRemoteBackground(
  value: string,
): Promise<DownloadedBackground> {
  const url = validateRemoteBackgroundUrl(value);
  let addresses: Array<{ address: string; family: number }>;
  try {
    addresses = await lookup(url.hostname, { all: true, verbatim: true });
  } catch {
    throw new BadRequestException('Image domain could not be resolved');
  }
  // Refuse hosts with any private address, and IPv6-only hosts for simplicity.
  if (
    !addresses.length ||
    addresses.some(
      ({ address }) => isIP(address) === 4 && !isPublicIpv4(address),
    )
  ) {
    throw new BadRequestException(
      'Image domain resolves to a restricted address',
    );
  }
  const selected = addresses.find(({ address }) => isPublicIpv4(address));
  if (!selected) {
    throw new BadRequestException(
      'Image domain has no supported public address',
    );
  }

  return new Promise<DownloadedBackground>((resolve, reject) => {
    let settled = false;
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      reject(
        error instanceof BadRequestException
          ? error
          : new BadRequestException('Unable to download image'),
      );
    };
    const request = httpsGet(
      url,
      {
        agent: false,
        // Pin the outgoing connection to the IP checked above. Re-resolving
        // after the check would allow DNS rebinding into a private network.
        lookup: (_hostname, _options, callback) => {
          callback(null, selected.address, 4);
        },
        headers: {
          Accept: 'image/png,image/jpeg,image/webp',
          'User-Agent': 'VocabMaster-ImageImporter/1.0',
        },
        timeout: REQUEST_TIMEOUT_MS,
        maxHeaderSize: 16384,
      },
      (response) => {
        const status = response.statusCode ?? 0;
        if (status !== 200) {
          response.resume();
          fail(
            new BadRequestException(
              'Image URL must return an image directly (no redirects)',
            ),
          );
          return;
        }

        const mimetype = String(response.headers['content-type'] ?? '')
          .split(';')[0]
          .toLowerCase()
          .trim();
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(mimetype)) {
          response.resume();
          fail(
            new BadRequestException(
              'URL must point directly to a PNG, JPG or WebP image',
            ),
          );
          return;
        }
        const declaredLength = Number(response.headers['content-length']);
        if (
          Number.isFinite(declaredLength) &&
          declaredLength > MAX_BACKGROUND_BYTES
        ) {
          response.resume();
          fail(new BadRequestException('Image exceeds 5 MB'));
          return;
        }
        const chunks: Buffer[] = [];
        let total = 0;
        response.on('data', (chunk: Buffer) => {
          total += chunk.length;
          if (total > MAX_BACKGROUND_BYTES) {
            response.destroy(new BadRequestException('Image exceeds 5 MB'));
            return;
          }
          chunks.push(chunk);
        });
        response.on('end', () => {
          if (settled) return;
          settled = true;
          resolve({
            buffer: Buffer.concat(chunks),
            mimetype,
            originalname:
              (url.pathname.split('/').pop() || 'Image')
                .replace(/[^\p{L}\p{N} ._()-]/gu, '_')
                .slice(0, 100) || 'Image',
          });
        });
        response.on('error', fail);
      },
    );
    request.on('timeout', () =>
      request.destroy(new BadRequestException('Image download timed out')),
    );
    request.on('error', fail);
  });
}
