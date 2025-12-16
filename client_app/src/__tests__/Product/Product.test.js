import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Products from '../../Shop/Component/Products';

describe('Products Component', () => {

  const mockProducts = [
    {
      _id: '1',
      name_product: 'Test Product 1',
      price_product: 100000,
      image: 'test1.jpg'
    },
    {
      _id: '2',
      name_product: 'Test Product 2',
      price_product: 200000,
      image: 'test2.jpg'
    }
  ];

  test('TC020: Hiển thị danh sách sản phẩm', () => {
    render(
      <BrowserRouter>
        <Products products={mockProducts} />
      </BrowserRouter>
    );

    expect(screen.getByText(/test product 1/i)).toBeInTheDocument();
    expect(screen.getByText(/test product 2/i)).toBeInTheDocument();
  });

  test('TC021: Hiển thị đúng giá sản phẩm', () => {
    render(
      <BrowserRouter>
        <Products products={mockProducts} />
      </BrowserRouter>
    );

    expect(screen.getByText(/100\.000/i)).toBeInTheDocument();
    expect(screen.getByText(/200\.000/i)).toBeInTheDocument();
  });

  test('TC022: Không bị lỗi khi danh sách sản phẩm rỗng', () => {
    render(
      <BrowserRouter>
        <Products products={[]} />
      </BrowserRouter>
    );

    // Không có sản phẩm nào
    expect(screen.queryByText(/test product/i)).not.toBeInTheDocument();
  });

});
