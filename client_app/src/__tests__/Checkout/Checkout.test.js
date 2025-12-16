import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Checkout from '../../Checkout/Checkout';

const mockStore = configureStore([]);

describe('Checkout Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      Count: { isLoad: true }
    });
    
    sessionStorage.setItem('id_user', 'user123');
    localStorage.setItem('carts', JSON.stringify([
      {
        id_cart: '1',
        id_product: 'prod1',
        name_product: 'Test Product',
        price_product: 100000,
        count: 2,
        image: 'test.jpg',
        size: 'M'
      }
    ]));
  });

  test('TC018: Validation địa chỉ giao hàng', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    });
  });

  test('TC019: Validation thông tin khách hàng', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderButton);
    
    await waitFor(() => {
      expect(screen.getByText(/fullname is required/i)).toBeInTheDocument();
    });
  });

  test('TC020: Đặt hàng thành công với COD', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // Fill address
    fireEvent.change(screen.getByPlaceholderText(/enter a location/i), {
      target: { value: '123 Test Street, HCM' }
    });
    
    const nextButton = screen.getByRole('button', { name: /next/i });
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      // Fill customer info
      fireEvent.change(screen.getByPlaceholderText(/enter fullname/i), {
        target: { value: 'Test User' }
      });
      fireEvent.change(screen.getByPlaceholderText(/enter phone number/i), {
        target: { value: '0123456789' }
      });
      fireEvent.change(screen.getByPlaceholderText(/enter email/i), {
        target: { value: 'test@test.com' }
      });
    });
    
    const placeOrderButton = screen.getByRole('button', { name: /place order/i });
    fireEvent.click(placeOrderButton);
    
    await waitFor(() => {
      expect(window.location.pathname).toBe('/success');
    });
  });
});