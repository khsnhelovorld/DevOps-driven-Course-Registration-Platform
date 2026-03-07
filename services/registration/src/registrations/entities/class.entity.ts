import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Course } from './course.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ name: 'class_code', length: 64 })
  classCode: string;

  @Column({ name: 'max_students', type: 'int', default: 0 })
  maxStudents: number;

  @Column({ name: 'day_of_week', type: 'varchar', length: 16, nullable: true })
  dayOfWeek: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  periods: string | null;

  @Column({ name: 'lecturer_name', type: 'varchar', length: 255, nullable: true })
  lecturerName: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'bi_weekly', type: 'varchar', length: 16, nullable: true })
  biWeekly: string | null;
}
