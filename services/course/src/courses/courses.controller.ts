import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import * as fs from 'fs/promises';
import { CoursesService, ClassStatDto } from './courses.service';
import { ClassWithCourseAndCount } from './courses.service';

@Controller()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async list(
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ): Promise<ClassWithCourseAndCount[]> {
    const sem = semester ? parseInt(semester, 10) : undefined;
    const year = academicYear ? parseInt(academicYear, 10) : undefined;
    return this.coursesService.listClasses(sem, year);
  }

  @Get('stats')
  async stats(
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ): Promise<ClassStatDto[]> {
    const sem = semester ? parseInt(semester, 10) : undefined;
    const year = academicYear ? parseInt(academicYear, 10) : undefined;
    return this.coursesService.stats(sem, year);
  }

  @Post('admin/upload')
  @UseInterceptors(FileInterceptor('file', { storage: multer.memoryStorage() }))
  async upload(@UploadedFile() file: Express.Multer.File): Promise<{ courses: number; classes: number }> {
    let buffer: Buffer;
    if (file?.buffer) {
      buffer = file.buffer;
    } else if (file?.path) {
      buffer = await fs.readFile(file.path);
    } else {
      throw new BadRequestException('No file uploaded');
    }
    const ext = file.originalname?.toLowerCase().split('.').pop();
    if (ext !== 'xlsx' && ext !== 'xls') throw new BadRequestException('Only .xlsx files are allowed');
    return this.coursesService.upload(buffer);
  }

  @Delete('admin/clear')
  async clear(
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ): Promise<{ deletedCourses: number; deletedClasses: number }> {
    const sem = semester ? parseInt(semester, 10) : undefined;
    const year = academicYear ? parseInt(academicYear, 10) : undefined;
    return this.coursesService.clearAll(sem, year);
  }
}
