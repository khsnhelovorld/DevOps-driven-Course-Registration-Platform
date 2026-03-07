import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';

export interface ParsedRow {
  courseCode: string;
  classCode: string;
  courseName: string;
  maxStudents: number;
  credits: number;
  dayOfWeek: string | null;
  periods: string | null;
  room: string | null;
  lecturerId: string | null;
  lecturerName: string | null;
  startDate: Date | null;
  endDate: Date | null;
  biWeekly: string | null;
  semester: number;
  academicYear: number;
  facultyCode: string | null;
  trainingSystem: string | null;
  notes: string | null;
}

const empty = (v: unknown): boolean =>
  v === null || v === undefined || (typeof v === 'string' && (v.trim() === '' || v.trim() === '*'));

function num(v: unknown): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number' && !Number.isNaN(v)) return v;
  const n = Number(String(v).replace(/,/g, '.'));
  return Number.isNaN(n) ? 0 : n;
}

function str(v: unknown): string | null {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  return s === '' || s === '*' ? null : s;
}

function excelDateToJsDate(excelDate: number): Date {
  return new Date((excelDate - 25569) * 86400 * 1000);
}

function date(v: unknown): Date | null {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) return v;
  const n = Number(v);
  if (!Number.isNaN(n) && n > 0) {
    return excelDateToJsDate(n);
  }
  const s = String(v).trim();
  if (!s || s === '*') return null;
  const parsed = new Date(s);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function sheetTypeFromName(name: string): 'theory' | 'practice' {
  const lower = name.toLowerCase();
  if (lower.includes('th') && !lower.includes('lt')) return 'practice';
  return 'theory';
}

@Injectable()
export class ExcelParserService {
  private buildHeaderMap(headerRow: ExcelJS.Row): Map<string, number> {
    const headers = new Map<string, number>();
    headerRow.eachCell((cell, colNumber) => {
      const text = String(cell?.value ?? '').trim().toUpperCase();
      if (text) headers.set(text, colNumber);
    });
    return headers;
  }

  private hasRequiredColumns(headers: Map<string, number>): boolean {
    const col = (key: string): number => headers.get(key) ?? 0;
    const maMh = col('MÃ MH') || col('MA MH') || col('MÃ MÔN HỌC') || col('MA MON HOC') || col('MÔN HỌC') || col('MON HOC');
    const maLop = col('MÃ LỚP') || col('MA LOP') || col('MÃ LỚP HỌC') || col('MA LOP HOC') || col('LỚP') || col('LOP');
    const tenMh = col('TÊN MÔN HỌC') || col('TEN MON HOC') || col('TÊN MÔN') || col('TEN MON');
    return !!(maMh && maLop && tenMh);
  }
  async parse(buffer: Buffer): Promise<{ theory: ParsedRow[]; practice: ParsedRow[] }> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
    const theory: ParsedRow[] = [];
    const practice: ParsedRow[] = [];
    for (const sheet of workbook.worksheets) {
      const rows = this.parseSheet(sheet);
      const type = sheetTypeFromName(sheet.name);
      if (type === 'practice') practice.push(...rows);
      else theory.push(...rows);
    }
    return { theory, practice };
  }

  private static readonly MAX_HEADER_LOOKUP_ROWS = 10;

  private parseSheet(sheet: ExcelJS.Worksheet): ParsedRow[] {
    const rows: ParsedRow[] = [];
    const maxRow = Math.min(ExcelParserService.MAX_HEADER_LOOKUP_ROWS, sheet.rowCount || 0);
    let headerRowIndex = 0;
    let headers: Map<string, number> = new Map();
    for (let r = 1; r <= maxRow; r++) {
      const candidateRow = sheet.getRow(r);
      const candidateHeaders = this.buildHeaderMap(candidateRow);
      if (this.hasRequiredColumns(candidateHeaders)) {
        headerRowIndex = r;
        headers = candidateHeaders;
        break;
      }
    }
    if (headerRowIndex === 0) return rows;

    const col = (key: string): number => headers.get(key) ?? 0;
    const maMh = col('MÃ MH') || col('MA MH') || col('MÃ MÔN HỌC') || col('MA MON HOC') || col('MÔN HỌC') || col('MON HOC');
    const maLop = col('MÃ LỚP') || col('MA LOP') || col('MÃ LỚP HỌC') || col('MA LOP HOC') || col('LỚP') || col('LOP');
    const tenMh = col('TÊN MÔN HỌC') || col('TEN MON HOC') || col('TÊN MÔN') || col('TEN MON');
    const siSo = col('SĨ SỐ') || col('SI SO') || col('SỈ SỐ') || col('SỐ SV');
    const soTc = col('TỔ TC') || col('SỐ TC') || col('SO TC') || col('TỐ TC') || col('TOT TC');
    const thu = col('THỨ') || col('THU');
    const tiet = col('TIẾT') || col('TIET');
    const phong = col('PHÒNG HỌC') || col('PHONG HOC');
    const maGv = col('MÃ GIẢNG VIÊN') || col('MA GIANG VIEN');
    const tenGv = col('TÊN GIẢNG VIÊN') || col('TÊN TRỢ GIẢNG') || col('TEN GIANG VIEN') || col('TEN TRO GIANG');
    const nbd = col('NHĐ') || col('NBD') || col('NGÀY BẮT ĐẦU');
    const nkt = col('NKT') || col('NGÀY KẾT THÚC');
    const cachTuan = col('CÁCH TUẦN') || col('CACH TUAN');
    const hocKy = col('HỌC KỲ') || col('HOC KY');
    const namHoc = col('NĂM HỌC') || col('NAM HOC');
    const heDt = col('HỆ ĐT') || col('HE DT');
    const khoa = col('KHOA HỌC') || col('KHOA') || col('KHOA HOC') || col('KHOÁ HỌC') || col('KHOA QL');
    const ghiChu = col('GHICHU') || col('GHI CHÚ');

    const dataStartRow = headerRowIndex + 1;
    for (let i = dataStartRow; i <= (sheet.rowCount || 0); i++) {
      const row = sheet.getRow(i);
      const get = (c: number) => row.getCell(c).value;
      const courseCode = str(get(maMh));
      const classCode = str(get(maLop));
      const courseName = str(get(tenMh));
      if (empty(courseCode) || empty(classCode) || empty(courseName)) continue;

      rows.push({
        courseCode: courseCode!,
        classCode: classCode!,
        courseName: courseName!,
        maxStudents: num(get(siSo)),
        credits: num(get(soTc)) || 0,
        dayOfWeek: str(get(thu)),
        periods: str(get(tiet)),
        room: str(get(phong)),
        lecturerId: str(get(maGv)),
        lecturerName: str(get(tenGv)),
        startDate: date(get(nbd)),
        endDate: date(get(nkt)),
        biWeekly: str(get(cachTuan)),
        semester: num(get(hocKy)) || 2,
        academicYear: num(get(namHoc)) || new Date().getFullYear(),
        facultyCode: str(get(khoa)),
        trainingSystem: str(get(heDt)),
        notes: str(get(ghiChu)),
      });
    }
    return rows;
  }
}
