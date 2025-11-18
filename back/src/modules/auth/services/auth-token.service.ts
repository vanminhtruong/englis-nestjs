import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthTokenService {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  verifyToken(token: string): JwtPayload {
    return this.jwtService.verify(token);
  }
}
