import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Detail_Product from '../../DetailProduct/Detail_Product';
import Product from '../../API/Product';

const mockStore = configureStore([]);
jest.mock('../../API/Product');

describe('Detail Product Component', () => {
  let store;
  const mockProduct = {
    _id: 'prod1',
    name_product: 'Test Product',
    price_product: 100000,
    image: 'test.jpg',
    describe: 'Test description'
  };
  
  beforeEach(() => {
    store = mockStore({
      Count: { isLoad: true },
      Cart: { id_user: null }
    });
    
    Product.Get_Detail_Product.mockResolvedValue(mockProduct);
    localStorage.setItem('carts', JSON.stringify([]));
  });

  test('TC014: Hiển thị thông tin sản phẩm', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
      expect(screen.getByText(/100,000 VNĐ/i)).toBeInTheDocument();
    });
  });

  test('TC015: Thêm sản phẩm vào giỏ hàng', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    const addToCartButton = screen.getByRole('link', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts.length).toBe(1);
      expect(carts[0].name_product).toBe('Test Product');
    });
  });

  test('TC016: Chọn size khác nhau', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    const sizeSelect = screen.getByLabelText(/size/i);
    fireEvent.change(sizeSelect, { target: { value: 'L' } });
    
    const addToCartButton = screen.getByRole('link', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].size).toBe('L');
    });
  });

  test('TC017: Tăng/giảm số lượng trước khi thêm vào giỏ', async () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </BrowserRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    const increaseButton = screen.getByText(/\+/);
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    const addToCartButton = screen.getByRole('link', { name: /add to cart/i });
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(3);
    });
  });
});