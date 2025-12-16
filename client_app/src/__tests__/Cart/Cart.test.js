import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Cart from '../../Cart/Cart';
import CartsLocal from '../../Share/CartsLocal';
import CouponAPI from '../../API/CouponAPI';

const mockStore = configureStore([]);
jest.mock('../../API/CouponAPI');

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

  afterEach(() => {
    localStorage.clear();
  });

  test('TC010: Hiển thị giỏ hàng với sản phẩm', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    expect(screen.getByText(/test product/i)).toBeInTheDocument();
    const subtotal = document.querySelector('.product-subtotal .amount');
  expect(subtotal).toHaveTextContent('200.000 VNĐ');
  });

  test('TC011: Tăng số lượng sản phẩm', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const increaseButton = container.querySelector('.inc.qtybutton');
    fireEvent.click(increaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(3);
    });
  });

  test('TC012: Giảm số lượng sản phẩm', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const decreaseButton = container.querySelector('.dec.qtybutton');
    fireEvent.click(decreaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(1);
    });
  });

  test('TC013: Không cho giảm số lượng < 1', async () => {
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
    
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const decreaseButton = container.querySelector('.dec.qtybutton');
    fireEvent.click(decreaseButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(1);
    });
  });

  test('TC014: Xóa sản phẩm khỏi giỏ hàng', async () => {
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    // Tìm nút xóa bằng class li-product-remove
    const deleteButton = container.querySelector('.li-product-remove a');
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts.length).toBe(0);
    });
  });

  test('TC015: Áp dụng mã giảm giá thành công', async () => {
    sessionStorage.setItem('id_user', 'user123');
    
    CouponAPI.checkCoupon.mockResolvedValue({
      msg: 'Thanh Cong',
      coupon: {
        _id: 'coupon1',
        promotion: 10,
        code: 'DISCOUNT10'
      }
    });
    
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const couponInput = screen.getByPlaceholderText(/coupon code/i);
    fireEvent.change(couponInput, { target: { value: 'DISCOUNT10' } });
    
    // Tìm nút Apply coupon
    const applyButton = container.querySelector('input[value="Apply coupon"]');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(CouponAPI.checkCoupon).toHaveBeenCalled();
    }, { timeout: 2000 });
  });

  test('TC016: Hiển thị lỗi khi mã giảm giá không hợp lệ', async () => {
    sessionStorage.setItem('id_user', 'user123');
    
    CouponAPI.checkCoupon.mockResolvedValue({
      msg: 'Không tìm thấy'
    });
    
    const { container } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const couponInput = screen.getByPlaceholderText(/coupon code/i);
    fireEvent.change(couponInput, { target: { value: 'INVALID' } });
    
    const applyButton = container.querySelector('input[value="Apply coupon"]');
    fireEvent.click(applyButton);
    
    await waitFor(() => {
      expect(screen.getByText(/vui lòng kiểm tra lại mã code/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  test('TC017: Hiển thị lỗi khi checkout mà chưa đăng nhập', async () => {
    sessionStorage.clear();
    
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
    
    const checkoutButton = screen.getByText(/proceed to checkout/i);
    fireEvent.click(checkoutButton);
    
    await waitFor(() => {
      expect(screen.getByText(/vui lòng kiểm tra tình trạng đăng nhập/i)).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});