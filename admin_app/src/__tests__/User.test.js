// __tests__/User.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import User from '../component/User/User';
import * as userAPI from '../component/Api/userAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({
  getAPI: jest.fn(),
  delete: jest.fn()
}));

describe('User Component', () => {
  const usersMock = [
    { _id: '1', fullname: 'User One', email: 'user1@test.com', permission_name: 'Admin' },
    { _id: '2', fullname: 'User Two', email: 'user2@test.com', permission_name: 'Customer' }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userAPI.getAPI.mockResolvedValue({ users: usersMock, totalPage: 1 });
    userAPI.delete.mockResolvedValue({ msg: 'Thanh Cong' });
  });

  test('renders users table', async () => {
    render(<Router><User /></Router>);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
    });
  });

  test('search updates filter and calls API', async () => {
    render(<Router><User /></Router>);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'User One' } });
    await waitFor(() => {
      expect(userAPI.getAPI).toHaveBeenCalledWith(expect.objectContaining({ search: 'User One' }));
    });
  });

  test('delete calls API and refreshes', async () => {
    const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Router><User /></Router>);
    await waitFor(() => screen.getByText('User One'));
    fireEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(userAPI.delete).toHaveBeenCalledWith('1');
      expect(userAPI.getAPI).toHaveBeenCalledTimes(2);
    });
    confirmMock.mockRestore();
  });
});
