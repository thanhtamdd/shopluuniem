import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Product from '../../component/Product/Product';
import productAPI from '../../component/Api/productAPI';

jest.mock('../../component/Api/productAPI');

describe('Admin Product Management', () => {
  const mockProducts = [
    {
      _id: 'prod1',
      name_product: 'Test Product 1',
      price_product: 100000,
      image: 'test1.jpg',
      describe: 'Description 1',
      id_category: { category: 'Category 1' }
    }
  ];
  
  beforeEach(() => {
    productAPI.getAPI.mockResolvedValue({
      products: mockProducts,
      totalPage: 1
    });
  });

  test('TC021: Hiển thị danh sách sản phẩm', async () => {
    render(
      <BrowserRouter>
        <Product />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product 1/i)).toBeInTheDocument();
      expect(screen.getByText(/100,000 VNĐ/i)).toBeInTheDocument();
    });
  });

  test('TC022: Tìm kiếm sản phẩm', async () => {
    render(
      <BrowserRouter>
        <Product />
      </BrowserRouter>
    );
    
    const searchInput = screen.getByPlaceholderText(/enter search/i);
    fireEvent.change(searchInput, { target: { value: 'Test Product' } });
    
    await waitFor(() => {
      expect(productAPI.getAPI).toHaveBeenCalledWith(
        expect.stringContaining('search=Test Product')
      );
    });
  });

  test('TC023: Xóa sản phẩm', async () => {
    productAPI.delete.mockResolvedValue({ msg: 'Thanh Cong' });
    
    render(
      <BrowserRouter>
        <Product />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/test product 1/i)).toBeInTheDocument();
    });
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    await waitFor(() => {
      expect(productAPI.delete).toHaveBeenCalled();
    });
  });
});