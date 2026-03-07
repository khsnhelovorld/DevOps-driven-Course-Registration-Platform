import { useState } from 'react';
import { Card, Upload, Button, message, Select, InputNumber, Space, Popconfirm } from 'antd';
import { InboxOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { coursesApi } from '../api/client';

const { Dragger } = Upload;

const currentYear = new Date().getFullYear();

export default function AdminUpload() {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [clearLoading, setClearLoading] = useState(false);
  const [clearScope, setClearScope] = useState<'all' | 'term'>('all');
  const [clearSemester, setClearSemester] = useState<number>(2);
  const [clearYear, setClearYear] = useState<number>(currentYear);

  const handleUpload = async () => {
    const file = fileList[0]?.originFileObj;
    if (!file) {
      message.warning('Chọn file .xlsx trước khi tải lên');
      return;
    }
    setLoading(true);
    try {
      const { data } = await coursesApi.uploadAdmin(file);
      message.success(`Đã import: ${data.courses} môn học, ${data.classes} lớp học`);
      setFileList([]);
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Tải lên thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    setClearLoading(true);
    try {
      const params =
        clearScope === 'term'
          ? { semester: clearSemester, academicYear: clearYear }
          : undefined;
      const { data } = await coursesApi.clearAdmin(params);
      message.success(
        `Đã xóa ${data.deletedCourses} môn học và ${data.deletedClasses} lớp học.`,
      );
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Xóa thất bại');
    } finally {
      setClearLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card title="Upload danh sách lớp học (TKB)" className="shadow-sm">
        <p className="text-gray-600 mb-4">
          Chọn file Excel (.xlsx) có sheet tên <strong>TKB LT</strong> (lý thuyết) và/hoặc <strong>TKB TH</strong> (thực hành).
          Dòng đầu tiên phải là tiêu đề cột: <strong>Mã MH</strong>, <strong>Mã Lớp</strong>, <strong>Tên môn học</strong>, Sĩ số, Thứ, Tiết, v.v.
        </p>
        <Dragger
          accept=".xlsx,.xls"
          fileList={fileList}
          maxCount={1}
          beforeUpload={(file) => {
            setFileList([{ uid: file.name, name: file.name, status: 'done', originFileObj: file }]);
            return false; // prevent auto upload
          }}
          onRemove={() => setFileList([])}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined style={{ fontSize: 48, color: '#1890ff' }} />
          </p>
          <p className="ant-upload-text">Kéo thả file vào đây hoặc bấm để chọn</p>
          <p className="ant-upload-hint">Chỉ hỗ trợ file .xlsx</p>
        </Dragger>
        <div className="mt-4">
          <Button type="primary" size="large" loading={loading} onClick={handleUpload} disabled={fileList.length === 0}>
            Tải lên
          </Button>
        </div>
      </Card>

      <Card title="Xóa danh sách lớp đã upload" className="shadow-sm">
        <p className="text-gray-600 mb-4">
          Xóa toàn bộ môn học và lớp học đã import (kèm đăng ký của sinh viên). Có thể chọn xóa theo học kỳ/năm học hoặc xóa tất cả.
        </p>
        <Space wrap className="mb-4">
          <Select
            value={clearScope}
            onChange={setClearScope}
            options={[
              { value: 'all', label: 'Xóa tất cả' },
              { value: 'term', label: 'Chỉ xóa theo học kỳ / năm học' },
            ]}
            style={{ width: 260 }}
          />
          {clearScope === 'term' && (
            <>
              <Select
                value={clearSemester}
                onChange={setClearSemester}
                options={[
                  { value: 1, label: 'Học kỳ 1' },
                  { value: 2, label: 'Học kỳ 2' },
                ]}
                style={{ width: 120 }}
              />
              <InputNumber
                min={2020}
                max={2030}
                value={clearYear}
                onChange={(v) => v != null && setClearYear(v)}
                placeholder="Năm học"
                style={{ width: 100 }}
              />
            </>
          )}
        </Space>
        <div>
          <Popconfirm
            title="Xác nhận xóa"
            description={
              clearScope === 'all'
                ? 'Bạn có chắc muốn xóa toàn bộ môn học và lớp học? Đăng ký của sinh viên cũng sẽ bị xóa.'
                : `Xóa môn học và lớp học học kỳ ${clearSemester} năm ${clearYear}?`
            }
            onConfirm={handleClear}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="primary" danger loading={clearLoading} icon={<DeleteOutlined />}>
              Xóa danh sách lớp
            </Button>
          </Popconfirm>
        </div>
      </Card>
    </div>
  );
}
