// __tests__/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../component/Login/Login';
import { AuthContext } from '../component/context/Auth';
import * as userAPI from '../component/Api/userAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({
  login: jest.fn()
}));

describe('Login Component', () => {
  let addLocalMock;
  const renderComponent = (contextValue = { jwt: null, user: null }) =>
    render(<Router>
      <AuthContext.Provider value={{ ...contextValue, addLocal: addLocalMock }}>
        <Login />
      </AuthContext.Provider>
    </Router>);

  beforeEach(() => { jest.clearAllMocks(); addLocalMock = jest.fn(); });

  test('renders login form', () => {
    renderComponent();
    expect(screen.getByRole('heading', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Email \/ Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('shows validation errors when inputs are empty', async () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText(/Email hoặc Username không được để trống/i)).toBeInTheDocument();
    expect(await screen.findByText(/Password không được để trống/i)).toBeInTheDocument();
  });

  test('calls userAPI.login on valid inputs', async () => {
    userAPI.login.mockResolvedValue({
      success: true,
      token: 'fake-token',
      user: { id: 1, id_permission: 1 }
    });
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email \/ Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    await waitFor(() =>
      expect(userAPI.login).toHaveBeenCalledWith({ identifier: 'testuser', password: 'password123' })
    );
    expect(addLocalMock).toHaveBeenCalledWith('fake-token', { id: 1, id_permission: 1 });
  });

  test('shows API error message when login fails', async () => {
    userAPI.login.mockResolvedValue({ success: false, msg: 'Sai thông tin đăng nhập' });
    renderComponent();
    fireEvent.change(screen.getByLabelText(/Email \/ Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    expect(await screen.findByText(/Sai thông tin đăng nhập/i)).toBeInTheDocument();
  });
});
