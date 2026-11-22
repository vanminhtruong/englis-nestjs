import { getAllowedFrontendOrigins } from './cors-origins';

describe('CORS origins for the public Tailscale backend', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterAll(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it.each(['development', 'production'])(
    'accepts GitHub Pages and Vite localhost when NODE_ENV=%s',
    (mode) => {
      process.env.NODE_ENV = mode;
      const origins = getAllowedFrontendOrigins('');
      for (const origin of [
        'https://vanminhtruong.github.io',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
      ]) {
        expect(origins.has(origin)).toBe(true);
      }
      expect(origins.has('https://untrusted.example')).toBe(false);
      expect(origins.has('http://localhost:9999')).toBe(false);
    },
  );

  it('allows additional explicit origins without enabling arbitrary origins', () => {
    const origins = getAllowedFrontendOrigins(
      'https://frontend.example.com, http://localhost:5174, ',
    );
    expect(origins.has('https://frontend.example.com')).toBe(true);
    expect(origins.has('http://localhost:5174')).toBe(true);
    expect(origins.has('https://untrusted.example')).toBe(false);
  });
});
