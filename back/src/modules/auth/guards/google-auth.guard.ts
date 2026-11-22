import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { getAllowedFrontendOrigins } from '../../../config/cors-origins';

/** Return the frontend base URL (origin + path) if its origin is allowed, otherwise null. */
export function resolveFrontendReturnUrl(value?: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!getAllowedFrontendOrigins().has(url.origin)) return null;
    return (url.origin + url.pathname).replace(/\/+$/, '');
  } catch {
    return null;
  }
}

/**
 * Google login guard. The frontend (localhost or GitHub Pages) sends
 * ?redirect_to=<its own base URL>; it travels through Google in `state`
 * so one registered callback URL serves every environment.
 */
@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    const target = resolveFrontendReturnUrl(req.query?.redirect_to as string);
    return target
      ? { state: Buffer.from(target, 'utf8').toString('base64url') }
      : {};
  }
}

export function decodeFrontendState(state?: string): string | null {
  if (!state) return null;
  try {
    return resolveFrontendReturnUrl(
      Buffer.from(state, 'base64url').toString('utf8'),
    );
  } catch {
    return null;
  }
}
