import { Card } from 'antd';
import { Link } from 'react-router-dom';
import { UploadOutlined, BarChartOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  if (isAdmin) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-sm rounded-lg">
          <h1 className="text-xl font-bold text-blue-600 text-center mb-2">
            QUẢN TRỊ - TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN
          </h1>
          <p className="text-center text-gray-600 mb-6">Chào admin, bạn có thể quản lý lớp học và xem thống kê.</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/admin/upload">
              <Card hoverable className="w-48 text-center">
                <UploadOutlined style={{ fontSize: 32, color: '#1890ff' }} />
                <div className="mt-2 font-medium">Upload Lớp học</div>
                <div className="text-xs text-gray-500">Tải lên file Excel TKB</div>
              </Card>
            </Link>
            <Link to="/admin/stats">
              <Card hoverable className="w-48 text-center">
                <BarChartOutlined style={{ fontSize: 32, color: '#52c41a' }} />
                <div className="mt-2 font-medium">Thống kê</div>
                <div className="text-xs text-gray-500">Đăng ký theo lớp</div>
              </Card>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-sm rounded-lg">
        <h1 className="text-xl font-bold text-blue-600 text-center mb-6">
          TRANG ĐĂNG KÝ HỌC PHẦN - TRƯỜNG ĐẠI HỌC CÔNG NGHỆ THÔNG TIN
        </h1>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">HƯỚNG DẪN ĐĂNG KÝ HỌC PHẦN</h2>
        <ol className="list-decimal list-inside space-y-2 text-gray-700 mb-6">
          <li>Nhấn vào trình đơn Đăng ký Học phần.</li>
          <li>Chọn các lớp cần đăng ký.</li>
          <li>Nhấn vào nút Đăng ký.</li>
          <li>Chờ hệ thống xử lý thông báo kết quả.</li>
          <li>
            Sau khi có kết quả xử lý, sinh viên kiểm tra và thực hiện chọn đăng ký tiếp, quay lại
            bước 1.
          </li>
        </ol>

        <h2 className="text-lg font-semibold text-gray-800 mb-3">MỘT SỐ LỖI THƯỜNG GẶP</h2>
        <div className="space-y-4 text-gray-700">
          <div>
            <p className="font-medium">Không thấy các lớp dạy bằng Tiếng Anh?</p>
            <p className="mt-1">
              Hãy chắc rằng bạn đã thỏa điều kiện chứng chỉ. Chứng chỉ phải thỏa mãn một trong các
              tiêu chí cụ thể:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>TOEIC-LR (&gt; 500) kèm TOEIC-SW (&gt; 160)</li>
              <li>TOEFL iBT ≥ 50</li>
              <li>IELTS &gt; 5</li>
              <li>VNU-EPT ≥ 201</li>
              <li>VPET hoặc Cambridge (không cần kiểm tra thêm điểm)</li>
            </ul>
          </div>
          <div>
            <p className="font-medium">Đã đóng học phí nhưng chưa được đăng ký?</p>
            <p className="mt-1">
              Vui lòng chờ ít nhất 5 phút để hệ thống cập nhật thông tin.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
