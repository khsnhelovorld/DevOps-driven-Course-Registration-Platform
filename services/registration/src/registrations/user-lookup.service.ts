import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserLookupService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getEmailAndName(userId: string): Promise<{ email?: string; fullName: string }> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return { email: user?.email ?? undefined, fullName: user?.fullName ?? '' };
  }
}
