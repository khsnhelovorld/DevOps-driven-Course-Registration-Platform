import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { RegistrationsService } from './registrations.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { UserPayload } from './jwt.strategy';
import { UserLookupService } from './user-lookup.service';

@Controller()
export class RegistrationsController {
  constructor(
    private readonly registrations: RegistrationsService,
    private readonly userLookup: UserLookupService,
  ) {}

  @Get('available-classes')
  @UseGuards(JwtAuthGuard)
  async availableClasses(
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    const sem = semester ? parseInt(semester, 10) : undefined;
    const year = academicYear ? parseInt(academicYear, 10) : undefined;
    return this.registrations.getAvailableClasses(sem, year);
  }

  @Post('enroll')
  @UseGuards(JwtAuthGuard)
  async enroll(@CurrentUser() user: UserPayload, @Body() body: { classIds: string[] }) {
    const { email, fullName } = await this.userLookup.getEmailAndName(user.sub);
    return this.registrations.enroll(user.sub, user.studentId, email, fullName, body.classIds ?? []);
  }

  @Get('my-classes')
  @UseGuards(JwtAuthGuard)
  async myClasses(@CurrentUser() user: UserPayload) {
    return this.registrations.getMyClasses(user.sub);
  }

  @Post('cancel/:enrollmentId')
  @UseGuards(JwtAuthGuard)
  async cancel(
    @CurrentUser() user: UserPayload,
    @Param('enrollmentId') enrollmentId: string,
  ) {
    const { email, fullName } = await this.userLookup.getEmailAndName(user.sub);
    return this.registrations.cancel(user.sub, user.studentId, email, fullName, enrollmentId);
  }
}
