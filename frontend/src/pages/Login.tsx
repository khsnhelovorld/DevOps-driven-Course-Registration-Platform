import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { studentId: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.studentId, values.password);
      message.success('Đăng nhập thành công');
      navigate('/');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      message.error(e.response?.data?.message ?? 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg rounded-lg" style={{ background: '#fff' }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">UIT - ĐKHP</h1>
          <h2 className="text-lg text-gray-800 mt-2">Đăng nhập vào hệ thống</h2>
        </div>
        <Form
          name="login"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
          requiredMark={false}
        >
          <Form.Item
            label="Mã sinh viên"
            name="studentId"
            rules={[{ required: true, message: 'Vui lòng nhập mã sinh viên' }]}
          >
            <Input placeholder="Mã sinh viên" size="large" />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password placeholder="Mật khẩu" size="large" />
          </Form.Item>
          <Form.Item className="mb-0">
            <div className="flex justify-between items-center">
              <a href="#" className="text-gray-600 text-sm">
                Quên mật khẩu?
              </a>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                Đăng nhập
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
