// __tests__/CreateUserCus.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUserCus from '../component/UserCus/CreateUserCus';
import * as userApi from '../component/Api/userAPI';
import * as permissionAPI from '../component/Api/permissionAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({
  create: jest.fn()
}));
jest.mock('../component/Api/permissionAPI', () => ({
  getAPI: jest.fn()
}));

describe('CreateUserCus Component', () => {
  const permissionsMock = [{ _id: '6087dcb5f269113b3460fce4', permission: 'Customer' }];

  beforeEach(() => {
    jest.clearAllMocks();
    permissionAPI.getAPI.mockResolvedValue(permissionsMock);
    userApi.create.mockResolvedValue({ msg: 'Bạn đã thêm thành công' });
  });

  test('renders form inputs', async () => {
    render(<Router><CreateUserCus /></Router>);
    expect(await screen.findByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password:/i)).toBeInTheDocument();
  });

  test('shows validation errors for empty inputs', async () => {
    render(<Router><CreateUserCus /></Router>);
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    await waitFor(() => {
      expect(screen.getByText(/Tên không được để trống/i)).toBeInTheDocument();
      expect(screen.getByText(/Username không được để trống/i)).toBeInTheDocument();
      expect(screen.getByText(/Email không được để trống/i)).toBeInTheDocument();
      expect(screen.getByText(/Mật khẩu không được để trống/i)).toBeInTheDocument();
    });
  });

  test('calls API and resets form on success', async () => {
    render(<Router><CreateUserCus /></Router>);
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Customer Test' } });
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'customertest1' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'test@customer.com' } });
    fireEvent.change(screen.getByLabelText(/Password:/i), { target: { value: '12345678' } });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));
    await waitFor(() => {
      expect(userApi.create).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Customer Test',
        username: 'customertest1',
        email: 'test@customer.com',
        password: '12345678'
      }));
    });
  });
});
