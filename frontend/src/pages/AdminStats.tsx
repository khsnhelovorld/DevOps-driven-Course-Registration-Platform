import { useEffect, useState } from 'react';
import { Card, Table, Select, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { coursesApi } from '../api/client';

interface StatRow {
  classId: string;
  classCode: string;
  courseCode?: string;
  courseName?: string;
  credits: number;
  registeredCount: number;
  maxStudents: number;
  dayOfWeek?: string | null;
  periods?: string | null;
  lecturerName?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  biWeekly?: string | null;
}

const dayMap: Record<string, string> = {
  '2': 'Thứ 2',
  '3': 'Thứ 3',
  '4': 'Thứ 4',
  '5': 'Thứ 5',
  '6': 'Thứ 6',
  '7': 'Thứ 7',
};

function formatSchedule(r: StatRow): string {
  const day = r.dayOfWeek ? dayMap[r.dayOfWeek] ?? `Thứ ${r.dayOfWeek}` : '';
  const period = r.periods ? `Tiết ${r.periods}` : '';
  const lecturer = r.lecturerName ? ` Giảng viên: ${r.lecturerName}` : '';
  const range =
    r.startDate && r.endDate
      ? ` từ ${formatDate(r.startDate)} - ${formatDate(r.endDate)}`
      : '';
  return [day, period, lecturer, range].filter(Boolean).join(', ') || '-';
}

function formatDate(iso: string): string {
  const d = iso.split('-');
  if (d.length === 3) return `${d[2]}/${d[1]}/${d[0]}`;
  return iso;
}

export default function AdminStats() {
  const [data, setData] = useState<StatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [semester, setSemester] = useState<number | undefined>();
  const [academicYear, setAcademicYear] = useState<number | undefined>();
  const [searchClassCode, setSearchClassCode] = useState('');

  useEffect(() => {
    setLoading(true);
    coursesApi
      .stats({ semester, academicYear })
      .then((res) => setData(res.data ?? []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [semester, academicYear]);

  const filtered =
    searchClassCode.trim() === ''
      ? data
      : data.filter((r) =>
          r.classCode.toLowerCase().includes(searchClassCode.trim().toLowerCase()),
        );

  const columns: ColumnsType<StatRow> = [
    { title: 'STT', key: 'stt', width: 50, align: 'center', render: (_, __, i) => i + 1 },
    { title: 'Mã lớp', dataIndex: 'classCode', key: 'classCode', width: 150 },
    {
      title: 'Môn học',
      key: 'course',
      render: (_, r) => `${r.courseCode ?? ''} - ${r.courseName ?? ''}`.trim() || '-',
      width: 280,
      onCell: () => ({ style: { whiteSpace: 'normal', wordBreak: 'break-word' } }),
    },
    { title: 'Số TC', dataIndex: 'credits', key: 'credits', width: 68, align: 'center' },
    {
      title: 'Thời gian học',
      key: 'schedule',
      render: (_, r) => formatSchedule(r),
      width: 380,
      onCell: () => ({ style: { whiteSpace: 'normal', wordBreak: 'break-word' } }),
    },
    {
      title: 'Đã ĐK/Sĩ số',
      key: 'capacity',
      width: 100,
      align: 'center',
      render: (_, r) => `${r.registeredCount}/${r.maxStudents}`,
    },
  ];

  return (
    <div className="max-w-[1400px] mx-auto px-2">
      <Card title="Thống kê đăng ký theo lớp" className="shadow-sm">
        <div className="flex flex-wrap gap-4 mb-4 items-center">
          <Input
            placeholder="Tìm theo mã lớp"
            value={searchClassCode}
            onChange={(e) => setSearchClassCode(e.target.value)}
            allowClear
            style={{ width: 200 }}
          />
          <Select
            placeholder="Học kỳ"
            allowClear
            style={{ width: 120 }}
            value={semester ?? null}
            onChange={(v) => setSemester(v ?? undefined)}
            options={[1, 2, 3].map((s) => ({ label: `HK ${s}`, value: s }))}
          />
          <Select
            placeholder="Năm học"
            allowClear
            style={{ width: 120 }}
            value={academicYear ?? null}
            onChange={(v) => setAcademicYear(v ?? undefined)}
            options={[2024, 2025, 2026, 2027].map((y) => ({ label: `${y}-${y + 1}`, value: y }))}
          />
        </div>
        <Table
          columns={columns}
          dataSource={filtered}
          rowKey="classId"
          loading={loading}
          pagination={{ pageSize: 15 }}
          size="small"
          scroll={{ x: 1050 }}
        />
      </Card>
    </div>
  );
}
