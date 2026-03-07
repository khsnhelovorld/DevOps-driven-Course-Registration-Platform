import { Outlet, NavLink } from 'react-router-dom';
import { Dropdown, Space } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();

  const menuItems: MenuProps['items'] = [
    {
      key: 'info',
      label: (
        <div className="px-2 py-1">
          <div className="text-gray-600 text-xs">
            {user?.role === 'admin' ? 'Admin' : `Mã SV: ${user?.studentId}`}
          </div>
          <div className="font-medium">{user?.fullName}</div>
          {(user?.faculty || user?.batch) && (
            <div className="text-gray-600 text-xs">
              {user.faculty} {user.batch ? `- Khóa ${user.batch}` : ''}
            </div>
          )}
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: logout,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <NavLink to="/" className="text-blue-600 font-bold text-xl no-underline">
            UIT-ĐKHP
          </NavLink>
          <nav className="flex gap-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `no-underline ${isActive ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`
              }
            >
              Dashboard
            </NavLink>
            {user?.role === 'admin' ? (
              <>
                <NavLink
                  to="/admin/upload"
                  className={({ isActive }) =>
                    `no-underline ${isActive ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                  }
                >
                  Upload Lớp học
                </NavLink>
                <NavLink
                  to="/admin/stats"
                  className={({ isActive }) =>
                    `no-underline ${isActive ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                  }
                >
                  Thống kê
                </NavLink>
              </>
            ) : (
              <>
                <NavLink
                  to="/register"
                  className={({ isActive }) =>
                    `no-underline ${isActive ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                  }
                >
                  Đăng ký Học phần
                </NavLink>
                <NavLink
                  to="/my-classes"
                  className={({ isActive }) =>
                    `no-underline ${isActive ? 'text-blue-600 font-medium border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`
                  }
                >
                  Danh sách Lớp Đã Đăng ký
                </NavLink>
              </>
            )}
          </nav>
        </div>
        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Space className="cursor-pointer text-gray-700">
            <UserOutlined />
            <span>{user?.fullName ?? 'User'}</span>
          </Space>
        </Dropdown>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
