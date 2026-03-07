import { useEffect, useState } from 'react';
import { Table, Button, message, Card, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { MinusOutlined } from '@ant-design/icons';
import { registrationsApi } from '../api/client';

interface MyClassRow {
  enrollmentId: string;
  classId: string;
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

export default function MyClasses() {
  const [data, setData] = useState<MyClassRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMyClasses = async () => {
    setLoading(true);
    try {
      const { data: res } = await registrationsApi.myClasses();
      setData(res ?? []);
    } catch {
      message.error('Không tải được danh sách lớp đã đăng ký');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyClasses();
  }, []);

  const handleCancel = async (enrollmentId: string, classCode: string) => {
    try {
      await registrationsApi.cancel(enrollmentId);
      message.success({
        content: (
          <div>
            <div>Hủy đăng ký thành công.</div>
            <div className="mt-1"><strong>Lớp đã hủy:</strong> {classCode}</div>
          </div>
        ),
        duration: 5,
      });
      fetchMyClasses();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Hủy đăng ký thất bại');
    }
  };

  const totalCredits = data.reduce((sum, r) => sum + (r.credits ?? 0), 0);

  const columns: ColumnsType<MyClassRow> = [
    {
      title: '',
      key: 'action',
      width: 56,
      render: (_, r) => (
        <Popconfirm
          title="Hủy đăng ký lớp này?"
          onConfirm={() => handleCancel(r.enrollmentId, r.classCode)}
        >
          <Button type="primary" danger icon={<MinusOutlined />} size="small" />
        </Popconfirm>
      ),
    },
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
      title: 'Thời gian học',
      key: 'schedule',
      render: (_, r) => {
        const day = r.dayOfWeek ? dayMap[r.dayOfWeek] ?? `Thứ ${r.dayOfWeek}` : '-';
        const period = r.periods ? `Tiết ${r.periods}` : '';
        const lecturer = r.lecturerName ? ` Giảng viên: ${r.lecturerName}` : '';
        const range =
          r.startDate && r.endDate ? ` từ ${toDDMMYYYY(r.startDate)} - ${toDDMMYYYY(r.endDate)}` : '';
        return `${day}, ${period}${lecturer}${range}`.trim() || '-';
      },
      width: 320,
    },
    {
      title: 'Số TC',
      dataIndex: 'credits',
      key: 'credits',
      width: 80,
      align: 'center',
    },
    {
      title: 'Đã ĐK/Sĩ số',
      key: 'capacity',
      render: (_, r) => `${r.registeredCount}/${r.maxStudents}`,
      width: 100,
      align: 'center',
    },
  ];

  return (
    <Card title="Danh sách lớp đã đăng ký" className="shadow-sm">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="enrollmentId"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 900 }}
      />
      {data.length === 0 && !loading && (
        <p className="text-gray-500 text-center py-4">Chưa đăng ký lớp nào.</p>
      )}
      <div className="mt-4 flex justify-end">
        <span className="text-base font-medium text-gray-700">
          Tổng số tín chỉ: {totalCredits}
        </span>
      </div>
    </Card>
  );
}
