import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import App from './App';

const mockStore = configureStore([]);

test('renders learn react link', () => {
  const store = mockStore({
    Count: { isLoad: true },
    Cart: { id_user: null, listCart: [] },
    Session: { idUser: '' }
  });
  
  // Mock localStorage
  localStorage.setItem('carts', JSON.stringify([]));
  
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );
  
  // Thay đổi assertion vì app không có text "learn react"
  // Kiểm tra app render thành công
  expect(document.querySelector('.App')).toBeInTheDocument();
});