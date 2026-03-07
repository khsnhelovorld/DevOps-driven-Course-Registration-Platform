import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Course } from './course.entity';

@Entity('classes')
export class Class {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  courseId: string;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
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

  @Column({ type: 'varchar', length: 64, nullable: true })
  room: string | null;

  @Column({ name: 'lecturer_id', type: 'varchar', length: 32, nullable: true })
  lecturerId: string | null;

  @Column({ name: 'lecturer_name', type: 'varchar', length: 255, nullable: true })
  lecturerName: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date | null;

  @Column({ name: 'bi_weekly', type: 'varchar', length: 16, nullable: true })
  biWeekly: string | null;

  @Column({ name: 'faculty_code', type: 'varchar', length: 32, nullable: true })
  facultyCode: string | null;

  @Column({ name: 'training_system', type: 'varchar', length: 32, nullable: true })
  trainingSystem: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
