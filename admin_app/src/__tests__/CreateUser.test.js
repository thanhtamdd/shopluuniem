import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUser from '../component/User/CreateUser';
import * as userApi from '../component/Api/userAPI';
import * as permissionAPI from '../component/Api/permissionAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({ create: jest.fn() }));
jest.mock('../component/Api/permissionAPI', () => ({ getAPI: jest.fn() }));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({ push: jest.fn() }),
}));

describe('CreateUser Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form inputs', async () => {
    permissionAPI.getAPI.mockResolvedValue([{ _id: '1', permission: 'Admin' }]);
    render(<Router><CreateUser /></Router>);

    // dùng findByLabelText để đợi async useEffect
    expect(await screen.findByLabelText('Name:')).toBeInTheDocument();
    expect(screen.getByLabelText('Username:')).toBeInTheDocument();
    expect(screen.getByLabelText('Email:')).toBeInTheDocument();
    expect(screen.getByLabelText('Password:')).toBeInTheDocument();
    expect(screen.getByLabelText('Chọn quyền:')).toBeInTheDocument();
  });

  test('shows validation errors for empty inputs', async () => {
    permissionAPI.getAPI.mockResolvedValue([{ _id: '1', permission: 'Admin' }]);
    render(<Router><CreateUser /></Router>);

    fireEvent.click(await screen.findByRole('button', { name: 'Create' }));

    expect(await screen.findByText('Tên không được để trống')).toBeInTheDocument();
    expect(screen.getByText('Username không được để trống')).toBeInTheDocument();
    expect(screen.getByText('Email không được để trống')).toBeInTheDocument();
    expect(screen.getByText('Mật khẩu không được để trống')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng chọn quyền')).toBeInTheDocument();
  });

  test('calls API and resets form on success', async () => {
    permissionAPI.getAPI.mockResolvedValue([{ _id: '1', permission: 'Admin' }]);
    userApi.create.mockResolvedValue({ msg: 'Bạn đã thêm thành công' });

    render(<Router><CreateUser /></Router>);

    // Chờ permission load
    await waitFor(() => screen.getByLabelText('Chọn quyền:'));

    fireEvent.change(screen.getByLabelText('Name:'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByLabelText('Username:'), { target: { value: 'testuser123' } });
    fireEvent.change(screen.getByLabelText('Email:'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByLabelText('Password:'), { target: { value: '12345678' } });
    fireEvent.change(screen.getByLabelText('Chọn quyền:'), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(userApi.create).toHaveBeenCalledWith({
        name: 'Test User',
        username: 'testuser123',
        email: 'test@test.com',
        password: '12345678',
        permission: '1',
      });
    });

    // Kiểm tra form reset
    expect(screen.getByLabelText('Name:').value).toBe('');
    expect(screen.getByLabelText('Username:').value).toBe('');
    expect(screen.getByLabelText('Email:').value).toBe('');
    expect(screen.getByLabelText('Password:').value).toBe('');
    expect(screen.getByLabelText('Chọn quyền:').value).toBe('');
  });
});
