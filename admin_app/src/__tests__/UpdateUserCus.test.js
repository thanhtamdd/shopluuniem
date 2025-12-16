// __tests__/UpdateUserCus.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UpdateUserCus from '../component/UserCus/UpdateUserCus';
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

describe('UpdateUserCus Component', () => {
  const userDetailMock = {
    _id: '1',
    fullname: 'Customer One',
    username: 'customer1',
    email: 'c1@test.com'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    permissionAPI.getAPI.mockResolvedValue([]);
    userApi.details.mockResolvedValue(userDetailMock);
    userApi.update.mockResolvedValue({ msg: 'Bạn đã update thành công' });
  });

  test('renders fetched data', async () => {
    render(<Router><UpdateUserCus match={{ params: { id: '1' } }} /></Router>);
    await waitFor(() => {
      expect(screen.getByDisplayValue('Customer One')).toBeInTheDocument();
      expect(screen.getByDisplayValue('customer1')).toBeInTheDocument();
      expect(screen.getByDisplayValue('c1@test.com')).toBeInTheDocument();
    });
  });

  test('calls update API on submit', async () => {
    render(<Router><UpdateUserCus match={{ params: { id: '1' } }} /></Router>);
    await waitFor(() => screen.getByDisplayValue('Customer One'));
    fireEvent.change(screen.getByLabelText(/Name:/), { target: { value: 'Updated Customer' } });
    fireEvent.click(screen.getByRole('button', { name: /Update/i }));
    await waitFor(() => expect(userApi.update).toHaveBeenCalled());
  });
});
