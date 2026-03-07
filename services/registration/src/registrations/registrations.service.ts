import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Class } from './entities/class.entity';
import { Course } from './entities/course.entity';
import { Enrollment } from './entities/enrollment.entity';
import { RabbitMQService } from './rabbitmq.service';

export interface AvailableClassDto {
  id: string;
  classCode: string;
  courseCode: string;
  courseName: string;
  credits: number;
  maxStudents: number;
  registeredCount: number;
  dayOfWeek: string | null;
  periods: string | null;
  lecturerName: string | null;
  startDate: string | null;
  endDate: string | null;
  biWeekly: string | null;
}

export interface MyClassDto {
  enrollmentId: string;
  classId: string;
  classCode: string;
  courseCode: string;
  courseName: string;
  credits: number;
  maxStudents: number;
  registeredCount: number;
  dayOfWeek: string | null;
  periods: string | null;
  lecturerName: string | null;
  startDate: string | null;
  endDate: string | null;
}

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    private readonly rabbit: RabbitMQService,
  ) {}

  async getAvailableClasses(semester?: number, academicYear?: number): Promise<AvailableClassDto[]> {
    const qb = this.classRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.course', 'course')
      .orderBy('c.class_code');
    if (semester != null) qb.andWhere('course.semester = :semester', { semester });
    if (academicYear != null) qb.andWhere('course.academic_year = :academicYear', { academicYear });
    const classes = await qb.getMany();
    const counts = await this.getRegisteredCounts(classes.map((c) => c.id));
    return classes.map((c) => ({
      id: c.id,
      classCode: c.classCode,
      courseCode: c.course?.courseCode ?? '',
      courseName: c.course?.name ?? '',
      credits: c.course?.credits ?? 0,
      maxStudents: c.maxStudents,
      registeredCount: counts[c.id] ?? 0,
      dayOfWeek: c.dayOfWeek,
      periods: c.periods,
      lecturerName: c.lecturerName,
      startDate: this.toDateString(c.startDate),
      endDate: this.toDateString(c.endDate),
      biWeekly: c.biWeekly,
    }));
  }

  private toDateString(v: Date | string | null | undefined): string | null {
    if (v == null) return null;
    if (typeof v === 'string') return v.slice(0, 10);
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.toISOString().slice(0, 10);
    return null;
  }

  private async getRegisteredCounts(classIds: string[]): Promise<Record<string, number>> {
    if (classIds.length === 0) return {};
    const result = await this.enrollmentRepo
      .createQueryBuilder('e')
      .select('e.class_id', 'classId')
      .addSelect('COUNT(*)', 'cnt')
      .where('e.class_id IN (:...ids)', { ids: classIds })
      .andWhere("e.status = 'registered'")
      .groupBy('e.class_id')
      .getRawMany();
    const map: Record<string, number> = {};
    for (const row of result) {
      const id = (row as { classId?: string; class_id?: string }).classId ?? (row as { class_id?: string }).class_id;
      const cnt = (row as { cnt?: string }).cnt ?? '0';
      if (id != null) map[id] = parseInt(cnt, 10);
    }
    return map;
  }

  async enroll(
    userId: string,
    studentId: string,
    email: string | undefined,
    fullName: string | undefined,
    classIds: string[],
  ): Promise<{ enrolled: string[]; failed: { classCode: string; reason: string }[] }> {
    if (!classIds?.length) throw new BadRequestException('Chọn ít nhất một lớp');
    const classesById = await this.classRepo.find({
      where: { id: In(classIds) },
      relations: ['course'],
    });
    const classMap = new Map(classesById.map((c) => [c.id, c]));
    const counts = await this.getRegisteredCounts(classIds);
    const existing = await this.enrollmentRepo.find({
      where: { userId, status: 'registered' },
      relations: ['class', 'class.course'],
    });
    const enrolled: string[] = [];
    const failed: { classCode: string; reason: string }[] = [];
    const toInsert: Enrollment[] = [];
    const enrolledClassesThisBatch: Class[] = [];

    for (const classId of classIds) {
      const c = classMap.get(classId);
      if (!c) {
        failed.push({ classCode: classId, reason: 'Lớp không tồn tại' });
        continue;
      }
      if (existing.some((e) => e.classId === classId)) {
        failed.push({ classCode: c.classCode, reason: 'Đã đăng ký lớp này' });
        continue;
      }
      if ((counts[c.id] ?? 0) >= c.maxStudents && c.maxStudents > 0) {
        failed.push({ classCode: c.classCode, reason: 'Lớp đã đầy' });
        continue;
      }
      const conflictWithExisting = this.hasScheduleConflict(existing, c);
      const conflictWithBatch = this.hasScheduleConflictWithClasses(enrolledClassesThisBatch, c);
      if (conflictWithExisting || conflictWithBatch) {
        failed.push({ classCode: c.classCode, reason: 'Trùng lịch học' });
        continue;
      }
      toInsert.push(this.enrollmentRepo.create({ userId, classId: c.id, status: 'registered' }));
      enrolled.push(c.classCode);
      enrolledClassesThisBatch.push(c);
    }

    if (toInsert.length > 0) {
      await this.enrollmentRepo.save(toInsert);
      const classDetails = toInsert.map(({ classId }) => {
        const c = classMap.get(classId)!;
        return { classCode: c.classCode, courseName: c.course?.name ?? '' };
      });
      await this.rabbit.publishEnrolled({
        userId,
        studentId,
        email,
        fullName,
        classIds: toInsert.map((t) => t.classId),
        classDetails,
      });
    }

    return { enrolled, failed };
  }

  private hasScheduleConflictWithClasses(classes: Class[], newClass: Class): boolean {
    const existing = classes.map((c) => ({ class: c }));
    return this.hasScheduleConflict(
      existing as (Enrollment & { class: Class & { course?: Course } })[],
      newClass,
    );
  }

  private dateToTime(v: Date | string | null | undefined): number | null {
    if (v == null) return null;
    if (v instanceof Date && !Number.isNaN(v.getTime())) return v.getTime();
    if (typeof v === 'string') {
      const t = new Date(v).getTime();
      return Number.isNaN(t) ? null : t;
    }
    return null;
  }

  private hasScheduleConflict(
    existing: (Enrollment & { class: Class & { course?: Course } })[],
    newClass: Class,
  ): boolean {
    const newDay = newClass.dayOfWeek;
    const newPeriods = newClass.periods ?? '';
    const newStart = this.dateToTime(newClass.startDate);
    const newEnd = this.dateToTime(newClass.endDate);
    if (!newDay || !newPeriods) return false;
    const newSet = new Set(newPeriods.replace(/,/g, '').split(''));
    for (const e of existing) {
      const c = e.class;
      if (c.dayOfWeek !== newDay) continue;
      const periods = (c.periods ?? '').replace(/,/g, '').split('');
      if (periods.some((p) => newSet.has(p))) {
        const cStart = this.dateToTime(c.startDate);
        const cEnd = this.dateToTime(c.endDate);
        if (newStart != null && newEnd != null && cStart != null && cEnd != null) {
          if (!(newEnd < cStart || newStart > cEnd)) return true;
        } else return true;
      }
    }
    return false;
  }

  async getMyClasses(userId: string): Promise<MyClassDto[]> {
    const enrollments = await this.enrollmentRepo.find({
      where: { userId, status: 'registered' },
      relations: ['class', 'class.course'],
    });
    const classIds = enrollments.map((e) => e.classId);
    const counts = await this.getRegisteredCounts(classIds);
    return enrollments.map((e) => {
      const c = e.class;
      return {
        enrollmentId: e.id,
        classId: c.id,
        classCode: c.classCode,
        courseCode: c.course?.courseCode ?? '',
        courseName: c.course?.name ?? '',
        credits: c.course?.credits ?? 0,
        maxStudents: c.maxStudents,
        registeredCount: counts[c.id] ?? 0,
        dayOfWeek: c.dayOfWeek,
        periods: c.periods,
        lecturerName: c.lecturerName,
        startDate: this.toDateString(c.startDate),
        endDate: this.toDateString(c.endDate),
      };
    });
  }

  async cancel(
    userId: string,
    studentId: string,
    email: string | undefined,
    fullName: string | undefined,
    enrollmentId: string,
  ): Promise<{ success: true; message: string }> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { id: enrollmentId, userId },
      relations: ['class', 'class.course'],
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== 'registered') throw new BadRequestException('Already cancelled');
    enrollment.status = 'cancelled';
    enrollment.cancelledAt = new Date();
    await this.enrollmentRepo.save(enrollment);
    await this.rabbit.publishCancelled({
      userId,
      studentId,
      email,
      fullName,
      enrollmentId,
      classCode: enrollment.class.classCode,
      courseName: enrollment.class.course?.name ?? '',
    });
    return { success: true, message: 'Đã hủy đăng ký' };
  }
}
