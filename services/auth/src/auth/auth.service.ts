import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(studentId: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByStudentId(studentId);
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.passwordHash);
    return ok ? user : null;
  }

  async login(
    studentId: string,
    password: string,
  ): Promise<{ accessToken: string; user: ProfileResponse }> {
    const user = await this.validateUser(studentId, password);
    if (!user) {
      throw new UnauthorizedException('Invalid student ID or password');
    }
    const payload = { sub: user.id, studentId: user.studentId, role: user.role };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: this.getProfile(user),
    };
  }

  getProfile(user: User): ProfileResponse {
    return {
      id: user.id,
      studentId: user.studentId,
      fullName: user.fullName,
      faculty: user.faculty ?? undefined,
      batch: user.batch ?? undefined,
      role: user.role,
      email: user.email ?? undefined,
    };
  }
}

export interface ProfileResponse {
  id: string;
  studentId: string;
  fullName: string;
  faculty?: string;
  batch?: string;
  role: string;
  email?: string;
}
