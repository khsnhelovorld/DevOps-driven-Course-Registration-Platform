import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface UserPayload {
  sub: string;
  studentId: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'default-secret-change-in-production',
    });
  }

  validate(payload: { sub: string; studentId?: string; role?: string }): UserPayload {
    return {
      sub: payload.sub,
      studentId: payload.studentId ?? payload.sub,
      role: payload.role ?? 'student',
    };
  }
}
