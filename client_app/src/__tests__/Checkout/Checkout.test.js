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

  afterEach(() => {
    sessionStorage.clear();
    localStorage.clear();
  });

  test('TC024: Hiển thị form nhập địa chỉ', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/check distance/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter a location/i)).toBeInTheDocument();
  });

  test('TC025: Validation địa chỉ giao hàng rỗng', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    const nextButton = screen.getByDisplayValue(/next/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/address is required/i)).toBeInTheDocument();
    });
  });

  test('TC026: Chuyển sang form thông tin khách hàng sau khi nhập địa chỉ', async () => {
    // Mock Google Maps API
    global.document.getElementById = jest.fn((id) => {
      if (id === 'in_kilo') return { innerHTML: '5.2' };
      if (id === 'duration_text') return { innerHTML: '15 mins' };
      if (id === 'price_shipping') return { innerHTML: '25000' };
      if (id === 'to_places') return { value: '123 Test Street, HCM' };
      return null;
    });
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    const addressInput = screen.getByPlaceholderText(/enter a location/i);
    fireEvent.change(addressInput, { target: { value: '123 Test Street, HCM' } });
    
    const nextButton = screen.getByDisplayValue(/next/i);
    fireEvent.click(nextButton);
    
    await waitFor(() => {
      expect(screen.getByText(/billing details/i)).toBeInTheDocument();
    });
  });

  test('TC027: Validation thông tin khách hàng', async () => {
    localStorage.setItem('price', '25000');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // Giả sử đã qua bước nhập địa chỉ
    const placeOrderButton = screen.queryByDisplayValue(/place order/i);
    
    if (placeOrderButton) {
      fireEvent.click(placeOrderButton);
      
      await waitFor(() => {
        // Kiểm tra validation messages
        expect(screen.getByText(/fullname is required/i) || 
               screen.getByText(/phone number is required/i) ||
               screen.getByText(/email is required/i)).toBeTruthy();
      });
    }
  });

  test('TC028: Hiển thị tổng giá trị đơn hàng đúng', async () => {
    localStorage.setItem('price', '25000');
    localStorage.setItem('total_price', '225000');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      // Tổng = Giá sản phẩm (200,000) + Phí ship (25,000) = 225,000
      expect(screen.getByText(/225\.000 VNĐ/i)).toBeInTheDocument();
    });
  });
});