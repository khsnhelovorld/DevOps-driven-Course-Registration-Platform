import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, FindOptionsWhere } from 'typeorm';
import { Course } from './entities/course.entity';
import { Class } from './entities/class.entity';
import { ExcelParserService, ParsedRow } from './excel-parser.service';
import { SheetType } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Class)
    private readonly classRepo: Repository<Class>,
    private readonly excelParser: ExcelParserService,
  ) {}

  async upload(buffer: Buffer): Promise<{ courses: number; classes: number }> {
    let theory: ParsedRow[] = [];
    let practice: ParsedRow[] = [];
    try {
      const parsed = await this.excelParser.parse(buffer);
      theory = parsed.theory;
      practice = parsed.practice;
    } catch (err: unknown) {
      throw err;
    }
    if (theory.length === 0 && practice.length === 0) {
      throw new BadRequestException(
        'Không đọc được dữ liệu. File Excel cần có sheet (TKB LT / TKB TH), dòng đầu là tiêu đề cột: Mã MH, Mã Lớp, Tên môn học, Sĩ số, ...',
      );
    }
    for (const row of theory) {
      const course = await this.findOrCreateCourse(row, 'theory');
      await this.upsertClassForCourse(course, row);
    }
    for (const row of practice) {
      const course = await this.findOrCreateCourse(row, 'practice');
      await this.upsertClassForCourse(course, row);
    }
    return {
      courses: await this.courseRepo.count(),
      classes: await this.classRepo.count(),
    };
  }

  private async findOrCreateCourse(row: ParsedRow, sheetType: SheetType): Promise<Course> {
    let course = await this.courseRepo.findOne({
      where: {
        courseCode: row.courseCode,
        semester: row.semester,
        academicYear: row.academicYear,
        sheetType,
      },
    });
    if (!course) {
      course = this.courseRepo.create({
        courseCode: row.courseCode,
        name: row.courseName,
        credits: row.credits,
        semester: row.semester,
        academicYear: row.academicYear,
        sheetType,
      });
      await this.courseRepo.save(course);
    } else {
      course.name = row.courseName;
      course.credits = row.credits;
      await this.courseRepo.save(course);
    }
    return course;
  }

  private async upsertClassForCourse(course: Course, row: ParsedRow): Promise<Class | null> {
    let cls = await this.classRepo.findOne({
      where: { courseId: course.id, classCode: row.classCode },
    });
    if (!cls) {
      cls = this.classRepo.create({
        courseId: course.id,
        classCode: row.classCode,
        maxStudents: row.maxStudents,
        dayOfWeek: row.dayOfWeek,
        periods: row.periods,
        room: row.room,
        lecturerId: row.lecturerId,
        lecturerName: row.lecturerName,
        startDate: row.startDate ?? undefined,
        endDate: row.endDate ?? undefined,
        biWeekly: row.biWeekly,
        facultyCode: row.facultyCode,
        trainingSystem: row.trainingSystem,
        notes: row.notes,
      });
      await this.classRepo.save(cls);
      return cls;
    }
    cls.maxStudents = row.maxStudents;
    cls.dayOfWeek = row.dayOfWeek;
    cls.periods = row.periods;
    cls.room = row.room;
    cls.lecturerId = row.lecturerId;
    cls.lecturerName = row.lecturerName;
    cls.startDate = row.startDate ?? null;
    cls.endDate = row.endDate ?? null;
    cls.biWeekly = row.biWeekly;
    cls.facultyCode = row.facultyCode;
    cls.trainingSystem = row.trainingSystem;
    cls.notes = row.notes;
    await this.classRepo.save(cls);
    return null;
  }

  async listClasses(semester?: number, academicYear?: number): Promise<ClassWithCourseAndCount[]> {
    const qb = this.classRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.course', 'course');
    if (semester != null) qb.andWhere('course.semester = :semester', { semester });
    if (academicYear != null) qb.andWhere('course.academic_year = :academicYear', { academicYear });
    const classes = await qb.getMany();
    const counts = await this.getRegisteredCounts(classes.map((c) => c.id));
    return classes.map((c) => ({
      ...c,
      registeredCount: counts[c.id] ?? 0,
    })) as ClassWithCourseAndCount[];
  }

  private async getRegisteredCounts(classIds: string[]): Promise<Record<string, number>> {
    if (classIds.length === 0) return {};
    const result = await this.classRepo.manager.query(
      `SELECT class_id, COUNT(*)::int AS cnt FROM enrollments WHERE status = 'registered' AND class_id = ANY($1::uuid[]) GROUP BY class_id`,
      [classIds],
    );
    const map: Record<string, number> = {};
    for (const row of result) map[row.class_id] = row.cnt;
    return map;
  }

  async stats(semester?: number, academicYear?: number): Promise<ClassStatDto[]> {
    const list = await this.listClasses(semester, academicYear);
    return list.map((c) => ({
      classId: c.id,
      classCode: c.classCode,
      courseCode: c.course?.courseCode,
      courseName: c.course?.name,
      credits: c.course?.credits ?? 0,
      maxStudents: c.maxStudents,
      registeredCount: c.registeredCount ?? 0,
      dayOfWeek: c.dayOfWeek ?? null,
      periods: c.periods ?? null,
      lecturerName: c.lecturerName ?? null,
      startDate: c.startDate ? (c.startDate instanceof Date ? c.startDate.toISOString().slice(0, 10) : String(c.startDate)) : null,
      endDate: c.endDate ? (c.endDate instanceof Date ? c.endDate.toISOString().slice(0, 10) : String(c.endDate)) : null,
      biWeekly: c.biWeekly ?? null,
    }));
  }

  async clearAll(semester?: number, academicYear?: number): Promise<{ deletedCourses: number; deletedClasses: number }> {
    const where: FindOptionsWhere<Course> = {};
    if (semester != null) where.semester = semester;
    if (academicYear != null) where.academicYear = academicYear;
    const coursesToDelete = await this.courseRepo.find({ where, select: { id: true } });
    const courseIds = coursesToDelete.map((c) => c.id);
    if (courseIds.length === 0) {
      return { deletedCourses: 0, deletedClasses: 0 };
    }
    const deletedClasses = await this.classRepo.count({ where: { courseId: In(courseIds) } });
    await this.courseRepo.delete({ id: In(courseIds) });
    return { deletedCourses: courseIds.length, deletedClasses };
  }
}

export interface ClassWithCourseAndCount extends Omit<Class, 'course'> {
  course?: Course;
  registeredCount: number;
}

export interface ClassStatDto {
  classId: string;
  classCode: string;
  courseCode?: string;
  courseName?: string;
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
