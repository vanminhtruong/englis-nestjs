import { BadRequestException } from '@nestjs/common';
import {
  isPublicIpv4,
  validateRemoteBackgroundUrl,
  downloadRemoteBackground,
} from './services/remote-background-download';

describe('Remote personal background URL safety', () => {
  it('accepts a direct HTTPS URL on the standard port', () => {
    const url = validateRemoteBackgroundUrl(
      'https://images.example.com/backgrounds/snow.webp?size=large',
    );
    expect(url.protocol).toBe('https:');
    expect(url.hostname).toBe('images.example.com');
  });

  it.each([
    'http://example.com/bg.png',
    'data:image/png;base64,AAAA',
    'file:///etc/passwd',
    'https://user:secret@example.com/bg.png',
    'https://example.com:8443/bg.png',
    'https://localhost/image.png',
    'https://foo.localhost/bg.png',
    'https://camera.internal/bg.png',
    'https://127.0.0.1/bg.png',
    'https://0x7f000001/image.png',
    'https://169.254.169.254/latest/meta-data',
    'https://192.168.1.1/image.png',
    'https://[::1]/image.png',
    'https://10.10.1.1/bg.png',
  ])('rejects non-public URL %s before making any request', (url) => {
    expect(() => validateRemoteBackgroundUrl(url)).toThrow(BadRequestException);
  });

  it('classifies reserved, private and public IPv4 correctly', () => {
    for (const ip of [
      '0.0.0.0',
      '10.12.14.16',
      '100.100.100.100',
      '127.0.0.1',
      '169.254.169.254',
      '172.31.20.4',
      '192.168.1.100',
      '198.18.0.1',
      '203.0.113.7',
      '255.255.255.255',
    ]) {
      expect(isPublicIpv4(ip)).toBe(false);
    }
    expect(isPublicIpv4('8.8.8.8')).toBe(true);
    expect(isPublicIpv4('1.1.1.1')).toBe(true);
    expect(isPublicIpv4('::1')).toBe(false);
  });

  it('does not access the network for an unsafe URL', async () => {
    await expect(
      downloadRemoteBackground('http://127.0.0.1/private-image.png'),
    ).rejects.toThrow(BadRequestException);
  });
});
