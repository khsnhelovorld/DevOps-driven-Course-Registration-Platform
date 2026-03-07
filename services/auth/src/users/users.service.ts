import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findByStudentId(studentId: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { studentId } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  async create(data: {
    studentId: string;
    passwordHash: string;
    fullName: string;
    faculty?: string;
    batch?: string;
    role?: 'admin' | 'student';
    email?: string;
  }): Promise<User> {
    const user = this.userRepo.create(data);
    return this.userRepo.save(user);
  }
}
