import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'course_code', type: 'varchar', length: 32 })
  courseCode: string;

  @Column({ type: 'varchar', length: 512 })
  name: string;

  @Column({ type: 'int', default: 0 })
  credits: number;

  @Column({ type: 'int' })
  semester: number;

  @Column({ name: 'academic_year', type: 'int' })
  academicYear: number;

  @Column({ name: 'sheet_type', type: 'enum', enum: ['theory', 'practice'], default: 'theory' })
  sheetType: string;
}
