import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Cart from '../../Cart/Cart';
import CartsLocal from '../../Share/CartsLocal';

const mockStore = configureStore([]);

describe('Cart Component', () => {
  let store;
  
  beforeEach(() => {
    store = mockStore({
      Count: { isLoad: true }
    });
    
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

  test('TC008: Hiển thị giỏ hàng với sản phẩm', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/test product/i)).toBeInTheDocument();
    expect(screen.getByText(/200,000 VNĐ/i)).toBeInTheDocument();
  });

  test('TC009: Tăng số lượng sản phẩm', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const increaseButton = screen.getAllByRole('button')[0]; // up button
    fireEvent.click(increaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(3);
    });
  });

  test('TC010: Giảm số lượng sản phẩm', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const decreaseButton = screen.getAllByRole('button')[1]; // down button
    fireEvent.click(decreaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(1);
    });
  });

  test('TC011: Không cho giảm số lượng < 1', async () => {
    localStorage.setItem('carts', JSON.stringify([
      {
        id_cart: '1',
        id_product: 'prod1',
        name_product: 'Test Product',
        price_product: 100000,
        count: 1,
        image: 'test.jpg',
        size: 'M'
      }
    ]));
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const decreaseButton = screen.getAllByRole('button')[1];
    fireEvent.click(decreaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(1);
    });
  });

  test('TC012: Xóa sản phẩm khỏi giỏ hàng', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const deleteButton = screen.getByRole('link', { name: /×/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts.length).toBe(0);
    });
  });

  test('TC013: Áp dụng mã giảm giá thành công', async () => {
    // Mock API
    jest.mock('../../API/CouponAPI', () => ({
      checkCoupon: jest.fn().mockResolvedValue({
        msg: 'Success',
        coupon: {
          _id: 'coupon1',
          promotion: 10
        }
      })
    }));
    
    sessionStorage.setItem('id_user', 'user123');
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const couponInput = screen.getByPlaceholderText(/coupon code/i);
    fireEvent.change(couponInput, { target: { value: 'DISCOUNT10' } });
    
    const applyButton = screen.getByRole('button', { name: /apply coupon/i });
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/áp dụng mã code thành công/i)).toBeInTheDocument();
    });
  });
});