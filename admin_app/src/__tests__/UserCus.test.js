// __tests__/UserCus.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserCus from '../component/UserCus/UserCus';
import * as userAPI from '../component/Api/userAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({
  getAPI: jest.fn(),
  delete: jest.fn()
}));

describe('UserCus Component', () => {
  const usersMock = [
    { _id: '1', fullname: 'Customer One', email: 'c1@test.com', id_permission: { permission: 'Customer' } },
    { _id: '2', fullname: 'Customer Two', email: 'c2@test.com', id_permission: { permission: 'Customer' } }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    userAPI.getAPI.mockResolvedValue({ users: usersMock, totalPage: 1 });
    userAPI.delete.mockResolvedValue({ msg: 'Thanh Cong' });
  });

  test('renders customer table', async () => {
    render(<Router><UserCus /></Router>);
    expect(screen.getByText(/Users/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Customer One')).toBeInTheDocument();
      expect(screen.getByText('Customer Two')).toBeInTheDocument();
    });
  });

  test('delete calls API and refreshes', async () => {
    const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
    render(<Router><UserCus /></Router>);
    await waitFor(() => screen.getByText('Customer One'));
    fireEvent.click(screen.getAllByText('Delete')[0]);
    await waitFor(() => {
      expect(userAPI.delete).toHaveBeenCalledWith('?id=1');
      expect(userAPI.getAPI).toHaveBeenCalledTimes(2);
    });
    confirmMock.mockRestore();
  });
});
