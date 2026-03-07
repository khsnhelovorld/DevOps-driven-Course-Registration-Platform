import { useEffect, useState } from 'react';
import { Table, Button, Input, message, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { registrationsApi } from '../api/client';

interface ClassRow {
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

const dayMap: Record<string, string> = {
  '2': 'Thứ 2',
  '3': 'Thứ 3',
  '4': 'Thứ 4',
  '5': 'Thứ 5',
  '6': 'Thứ 6',
  '7': 'Thứ 7',
};

function toDDMMYYYY(iso: string | null | undefined): string {
  if (!iso || iso.length < 10) return iso ?? '';
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`;
}

export default function Register() {
  const [data, setData] = useState<ClassRow[]>([]);
  const [enrolledClassIds, setEnrolledClassIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchEnrolled = async () => {
    try {
      const { data: myList } = await registrationsApi.myClasses();
      setEnrolledClassIds(new Set((myList ?? []).map((r: { classId: string }) => r.classId)));
    } catch {
      setEnrolledClassIds(new Set());
    }
  };

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const { data: res } = await registrationsApi.availableClasses();
      setData(res ?? []);
      await fetchEnrolled();
    } catch {
      message.error('Không tải được danh sách lớp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filtered = search.trim()
    ? data.filter(
        (r) =>
          r.classCode.toLowerCase().includes(search.toLowerCase()) ||
          r.courseCode.toLowerCase().includes(search.toLowerCase()) ||
          r.courseName.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  const handleEnroll = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 lớp để đăng ký');
      return;
    }
    setSubmitting(true);
    try {
      const { data: res } = await registrationsApi.enroll(selectedRowKeys as string[]);
      const enrolled = res?.enrolled ?? [];
      const failed = res?.failed ?? [];
      if (enrolled.length > 0) {
        message.success({
          content: (
            <div>
              <div>Đăng ký thành công.</div>
              {enrolled.length > 0 && (
                <div className="mt-1"><strong>Lớp đã đăng ký:</strong> {enrolled.join(', ')}</div>
              )}
              {failed.length > 0 && (
                <div className="mt-1 text-gray-600"><strong>Lớp không đăng ký được:</strong> {failed.map((f) => f.classCode).join(', ')}</div>
              )}
            </div>
          ),
          duration: 6,
        });
        setSelectedRowKeys([]);
        fetchClasses();
      }
      if (enrolled.length === 0 && failed.length > 0) {
        message.error('Không đăng ký được lớp nào. Vui lòng kiểm tra (lớp đầy, trùng lịch hoặc đã đăng ký).');
      }
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Đăng ký thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const formatSchedule = (r: ClassRow) => {
    const day = r.dayOfWeek ? dayMap[r.dayOfWeek] ?? `Thứ ${r.dayOfWeek}` : '-';
    const period = r.periods ? `Tiết ${r.periods}` : '';
    const lecturer = r.lecturerName ? ` Giảng viên: ${r.lecturerName}` : '';
    const range =
      r.startDate && r.endDate ? ` từ ${toDDMMYYYY(r.startDate)} - ${toDDMMYYYY(r.endDate)}` : '';
    const biWeekly = r.biWeekly ? ` ${r.biWeekly}` : '';
    return `${day}, ${period}${lecturer}${range}${biWeekly}`.trim() || '-';
  };

  const columns: ColumnsType<ClassRow> = [
    { title: 'STT', key: 'stt', width: 56, render: (_, __, i) => i + 1 },
    {
      title: 'Mã lớp',
      dataIndex: 'classCode',
      key: 'classCode',
      width: 120,
    },
    {
      title: 'Môn học',
      key: 'course',
      render: (_, r) => `${r.courseCode} - ${r.courseName}`,
      width: 280,
    },
    {
      title: 'Số TC',
      dataIndex: 'credits',
      key: 'credits',
      width: 70,
    },
    {
      title: 'Thời gian học',
      key: 'schedule',
      render: (_, r) => formatSchedule(r),
      width: 320,
    },
    {
      title: 'Đã ĐK/Sĩ số',
      key: 'capacity',
      width: 110,
      align: 'center',
      render: (_, r) => `${r.registeredCount}/${r.maxStudents}`,
    },
  ];

  return (
    <Card title="Danh sách lớp mở chờ đăng ký" className="shadow-sm">
      <div className="mb-4">
        <Input
          placeholder="Tìm theo mã lớp, mã môn (vd: IT007)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          className="max-w-xs"
        />
      </div>
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          getCheckboxProps: (record) => ({
            disabled:
              enrolledClassIds.has(record.id) ||
              (record.registeredCount >= record.maxStudents && record.maxStudents > 0),
          }),
        }}
        columns={columns}
        dataSource={filtered}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />
      <div className="mt-2 flex items-center justify-end gap-2">
        <p className="text-blue-600 text-sm m-0">
          Vui lòng chọn ít nhất 1 lớp để đăng ký.
        </p>
        <Button type="primary" onClick={handleEnroll} loading={submitting}>
          Đăng ký
        </Button>
      </div>
      {selectedRowKeys.length > 0 && (
        <div
          className="fixed bottom-6 left-6 z-10 rounded-lg px-4 py-2 shadow-md border border-green-400"
          style={{ backgroundColor: '#bbf7d0', color: '#000' }}
        >
          <div className="text-sm font-medium mb-1 text-black">Lớp đang chọn:</div>
          <div className="flex flex-wrap gap-2">
            {filtered
              .filter((r) => selectedRowKeys.includes(r.id))
              .map((r) => (
                <span key={r.id} className="rounded px-2 py-0.5 text-black" style={{ backgroundColor: '#86efac' }}>
                  {r.classCode}
                </span>
              ))}
          </div>
        </div>
      )}
    </Card>
  );
}
