import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SignIn from '../../Auth/SignIn';
import User from '../../API/User';

const mockStore = configureStore([]);
jest.mock('../../API/User');

describe('SignIn Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      Count: { isLoad: true },
      Cart: { id_user: null, listCart: [] },
      Session: { idUser: '' }
    });
    sessionStorage.clear();
    localStorage.setItem('carts', JSON.stringify([]));
  });

  test('TC001: Hiển thị form login đúng', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  test('TC002: Đăng nhập thành công với thông tin đúng', async () => {
    const mockUser = {
      _id: '123',
      fullname: 'Test User',
      email: 'test@test.com',
      username: 'testuser'
    };
    
    User.Get_Detail_User.mockResolvedValue(mockUser);
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(User.Get_Detail_User).toHaveBeenCalled();
    });
  });

  test('TC003: Hiển thị lỗi khi username không tồn tại', async () => {
    User.Get_Detail_User.mockResolvedValue('Khong Tìm Thấy User');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'wronguser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/wrong username/i)).toBeInTheDocument();
    });
  });

  test('TC004: Hiển thị lỗi khi password sai', async () => {
    User.Get_Detail_User.mockResolvedValue('Sai Mat Khau');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <SignIn />
        </BrowserRouter>
      </Provider>
    );
    
    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(loginButton);
    
    await waitFor(() => {
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument();
    });
  });
});