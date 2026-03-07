import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Class } from './class.entity';

export type SheetType = 'theory' | 'practice';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_code', length: 32 })
  courseCode: string;

  @Column({ length: 512 })
  name: string;

  @Column({ type: 'int', default: 0 })
  credits: number;

  @Column({ type: 'int' })
  semester: number;

  @Column({ name: 'academic_year', type: 'int' })
  academicYear: number;

  @Column({ name: 'sheet_type', type: 'enum', enum: ['theory', 'practice'], default: 'theory' })
  sheetType: SheetType;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Class, (c) => c.course)
  classes: Class[];
}
