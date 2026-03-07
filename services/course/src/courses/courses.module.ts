import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { Course } from './entities/course.entity';
import { Class } from './entities/class.entity';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { ExcelParserService } from './excel-parser.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Class]),
    MulterModule.register({ storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }),
  ],
  controllers: [CoursesController],
  providers: [CoursesService, ExcelParserService],
  exports: [CoursesService],
})
export class CoursesModule {}
