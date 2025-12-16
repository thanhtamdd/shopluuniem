import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignUp from '../../Auth/SignUp';
import User from '../../API/User';

jest.mock('../../API/User');

describe('SignUp Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('TC005: Hiển thị form đăng ký đúng', () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/first name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^password/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('TC006: Validation email trống', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  test('TC007: Validation password không khớp', async () => {
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'testuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'password456' }
    });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/checking again confirm password/i)).toBeInTheDocument();
    });
  });

  test('TC008: Hiển thị lỗi khi username đã tồn tại', async () => {
    User.Post_User.mockResolvedValue('User Da Ton Tai');
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'existinguser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'password123' }
    });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/username is existed/i)).toBeInTheDocument();
    });
  });

  test('TC009: Đăng ký thành công', async () => {
    User.Post_User.mockResolvedValue({ _id: '123', username: 'testuser' });
    
    render(
      <BrowserRouter>
        <SignUp />
      </BrowserRouter>
    );
    
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
      target: { value: 'test@test.com' }
    });
    fireEvent.change(screen.getByPlaceholderText(/first name/i), {
      target: { value: 'Test User' }
    });
    fireEvent.change(screen.getByPlaceholderText(/username/i), {
      target: { value: 'newuser' }
    });
    fireEvent.change(screen.getByPlaceholderText(/^password$/i), {
      target: { value: 'password123' }
    });
    fireEvent.change(screen.getByPlaceholderText(/confirm password/i), {
      target: { value: 'password123' }
    });
    
    const submitButton = screen.getByRole('button', { name: /register/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(User.Post_User).toHaveBeenCalled();
      expect(screen.getByText(/bạn đã đăng ký thành công/i)).toBeInTheDocument();
    });
  });
});