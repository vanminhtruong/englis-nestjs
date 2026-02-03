import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) { }

  generateToken(userId: string, email: string, rememberMe?: boolean): string {
    const payload: JwtPayload = { sub: userId, email };
    const expiresIn = rememberMe ? '30d' : '1d';
    return this.jwtService.sign(payload, { expiresIn });
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
