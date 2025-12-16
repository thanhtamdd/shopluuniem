// __tests__/UpdateUser.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateUser from '../component/User/UpdateUser';
import * as userApi from '../component/Api/userAPI';
import * as permissionAPI from '../component/Api/permissionAPI';
import { BrowserRouter as Router } from 'react-router-dom';

jest.mock('../component/Api/userAPI', () => ({
  details: jest.fn(),
  update: jest.fn()
}));

jest.mock('../component/Api/permissionAPI', () => ({
  getAPI: jest.fn()
}));

describe('UpdateUser Component', () => {
  const permissionsMock = [{ _id: '1', permission: 'Admin' }];
  const userDetailMock = {
    _id: '1',
    fullname: 'User One',
    username: 'user1',
    email: 'user1@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    permissionAPI.getAPI.mockResolvedValue(permissionsMock);
    userApi.details.mockResolvedValue(userDetailMock);
    userApi.update.mockResolvedValue({ msg: 'Bạn đã update thành công' });
  });

  test('renders fetched data', async () => {
    render(
      <Router>
        <UpdateUser match={{ params: { id: '1' } }} />
      </Router>
    );

    await waitFor(() => {
      expect(screen.getByDisplayValue('User One')).toBeInTheDocument();
      expect(screen.getByDisplayValue('user1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('user1@test.com')).toBeInTheDocument();
    });
  });

  test('calls update API on submit', async () => {
    render(
      <Router>
        <UpdateUser match={{ params: { id: '1' } }} />
      </Router>
    );

    await waitFor(() => screen.getByDisplayValue('User One'));

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Updated User' } });
    fireEvent.change(screen.getByLabelText(/Username:/i), { target: { value: 'updateduser' } });
    fireEvent.change(screen.getByLabelText(/Email:/i), { target: { value: 'updated@test.com' } });

    fireEvent.click(screen.getByRole('button', { name: /Update/i }));

    await waitFor(() => {
      expect(userApi.update).toHaveBeenCalledWith('1', expect.objectContaining({
        fullname: 'Updated User',
        username: 'updateduser',
        email: 'updated@test.com',
        permission: '1'
      }));
    });
  });
});
