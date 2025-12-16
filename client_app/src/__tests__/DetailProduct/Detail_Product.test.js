import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Detail_Product from '../../DetailProduct/Detail_Product';
import ProductAPI from '../../API/Product';
import CommentAPI from '../../API/CommentAPI';
import SaleAPI from '../../API/SaleAPI';

const mockStore = configureStore([]);
jest.mock('../../API/Product');
jest.mock('../../API/CommentAPI');
jest.mock('../../API/SaleAPI');

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
    
    ProductAPI.Get_Detail_Product.mockResolvedValue(mockProduct);
    CommentAPI.get_comment.mockResolvedValue([]);
    SaleAPI.checkSale.mockResolvedValue({ msg: 'Không tìm thấy' });
    localStorage.setItem('carts', JSON.stringify([]));
  });

  afterEach(() => {
    localStorage.clear();
  });

  test('TC018: Hiển thị thông tin sản phẩm', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(ProductAPI.Get_Detail_Product).toHaveBeenCalledWith('prod1');
    });
  });

  test('TC019: Thêm sản phẩm vào giỏ hàng với size mặc định', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    const addToCartButton = screen.getByText(/add to cart/i);
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts.length).toBe(1);
      expect(carts[0].name_product).toBe('Test Product');
      expect(carts[0].size).toBe('S');
    });
  });

  test('TC020: Chọn size L trước khi thêm vào giỏ', async () => {
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    // Tìm select element bằng class
    const sizeSelect = document.querySelector('.nice-select');
    fireEvent.change(sizeSelect, { target: { value: 'L' } });
    
    const addToCartButton = screen.getByText(/add to cart/i);
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].size).toBe('L');
    });
  });

  test('TC021: Tăng số lượng trước khi thêm vào giỏ', async () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    // Dùng querySelector để tìm nút tăng
    const increaseButton = container.querySelector('.inc.qtybutton');
    fireEvent.click(increaseButton);
    fireEvent.click(increaseButton);
    
    const addToCartButton = screen.getByText(/add to cart/i);
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(3);
    });
  });

  test('TC022: Giảm số lượng nhưng không cho < 1', async () => {
    const { container } = render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product/i)).toBeInTheDocument();
    });
    
    // Dùng querySelector để tìm nút giảm
    const decreaseButton = container.querySelector('.dec.qtybutton');
    fireEvent.click(decreaseButton);
    
    const addToCartButton = screen.getByText(/add to cart/i);
    fireEvent.click(addToCartButton);
    
    await waitFor(() => {
      const carts = JSON.parse(localStorage.getItem('carts'));
      expect(carts[0].count).toBe(1);
    });
  });

  test('TC023: Hiển thị giá sale nếu có', async () => {
    SaleAPI.checkSale.mockResolvedValue({
      msg: 'Thanh Cong',
      sale: {
        id_product: mockProduct,
        promotion: 20
      }
    });
    
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/detail/prod1']}>
          <Route path="/detail/:id">
            <Detail_Product />
          </Route>
        </MemoryRouter>
      </Provider>
    );
    
    await waitFor(() => {
      // Kiểm tra có text chứa 80.000 (không có dấu phẩy)
      expect(screen.getByText(/80\.000 VNĐ/i)).toBeInTheDocument();
    }, { timeout: 3000 });
  });
});