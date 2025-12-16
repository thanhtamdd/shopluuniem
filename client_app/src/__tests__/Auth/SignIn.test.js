import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignIn from '../../Auth/SignIn';
import User from '../../API/User';

jest.mock('../../API/User');

describe('SignIn Component', () => {
  test('TC001: Hiển thị form login đúng', () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('TC002: Hiển thị lỗi khi username trống', async () => {
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/wrong username/i)).toBeInTheDocument();
    });
  });

  test('TC003: Đăng nhập thành công với thông tin đúng', async () => {
    const mockUser = {
      _id: '123',
      fullname: 'Test User',
      email: 'test@test.com'
    };
    
    User.Get_Detail_User.mockResolvedValue(mockUser);
    
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'password123' }
    });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(sessionStorage.getItem('id_user')).toBe('123');
    });
  });

  test('TC004: Hiển thị lỗi khi password sai', async () => {
    User.Get_Detail_User.mockResolvedValue('Sai Mat Khau');
    
    render(
      <BrowserRouter>
        <SignIn />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
      target: { value: 'wrongpassword' }
    });
    
    const loginButton = screen.getByRole('button', { name: /login/i });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument();
    });
  });
});