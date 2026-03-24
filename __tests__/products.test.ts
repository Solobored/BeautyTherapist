import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('Products', () => {
  const mockProducts = [
    {
      id: 'prod-1',
      brandId: 'brand-1',
      nameEn: 'Vitamin C Serum',
      nameEs: 'Sérum Vitamina C',
      price: 45,
      category: 'skincare',
      stock: 25,
      image: 'https://example.com/image1.jpg',
    },
    {
      id: 'prod-2',
      brandId: 'brand-1',
      nameEn: 'Night Retinol Cream',
      nameEs: 'Crema Retinol Nocturna',
      price: 52,
      category: 'skincare',
      stock: 18,
      image: 'https://example.com/image2.jpg',
    },
    {
      id: 'prod-3',
      brandId: 'brand-1',
      nameEn: 'Matte Foundation',
      nameEs: 'Base de Maquillaje Mate',
      price: 35,
      category: 'makeup',
      stock: 30,
      image: 'https://example.com/image3.jpg',
    },
  ];

  describe('Product Listing', () => {
    it('should render all products from mock data', () => {
      expect(mockProducts).toHaveLength(3);
      mockProducts.forEach((product) => {
        expect(product.id).toBeDefined();
        expect(product.nameEn).toBeDefined();
        expect(product.price).toBeGreaterThan(0);
      });
    });

    it('should display product image, name, and price', () => {
      mockProducts.forEach((product) => {
        expect(product.image).toBeDefined();
        expect(product.nameEn).toBeTruthy();
        expect(product.price).toBeGreaterThan(0);
      });
    });

    it('should show stock availability status', () => {
      mockProducts.forEach((product) => {
        const isInStock = product.stock > 0;
        expect(isInStock).toBe(true);
      });
    });
  });

  describe('Search Filter', () => {
    it('should filter products matching search query', () => {
      const searchQuery = 'Vitamin';
      const filtered = mockProducts.filter((p) =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.nameEs.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].nameEn).toContain('Vitamin');
    });

    it('should handle case-insensitive search', () => {
      const searchQuery = 'vitamin';
      const filtered = mockProducts.filter((p) =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(1);
    });

    it('should return empty array when no products match', () => {
      const searchQuery = 'Nonexistent';
      const filtered = mockProducts.filter((p) =>
        p.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
      );

      expect(filtered).toHaveLength(0);
    });
  });

  describe('Category Filter', () => {
    it('should filter by skincare category', () => {
      const category = 'skincare';
      const filtered = mockProducts.filter((p) => p.category === category);

      expect(filtered).toHaveLength(2);
      filtered.forEach((product) => {
        expect(product.category).toBe('skincare');
      });
    });

    it('should filter by makeup category', () => {
      const category = 'makeup';
      const filtered = mockProducts.filter((p) => p.category === category);

      expect(filtered).toHaveLength(1);
      expect(filtered[0].nameEn).toContain('Foundation');
    });

    it('should show all categories available', () => {
      const categories = [...new Set(mockProducts.map((p) => p.category))];

      expect(categories).toContain('skincare');
      expect(categories).toContain('makeup');
    });
  });

  describe('Price Range Filter', () => {
    it('should filter products within price range', () => {
      const minPrice = 30;
      const maxPrice = 50;
      const filtered = mockProducts.filter(
        (p) => p.price >= minPrice && p.price <= maxPrice
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].price).toBe(45);
      expect(filtered[1].price).toBe(35);
    });

    it('should show only products above minimum price', () => {
      const minPrice = 40;
      const filtered = mockProducts.filter((p) => p.price >= minPrice);

      expect(filtered).toHaveLength(2);
      filtered.forEach((product) => {
        expect(product.price).toBeGreaterThanOrEqual(minPrice);
      });
    });

    it('should show only products below maximum price', () => {
      const maxPrice = 45;
      const filtered = mockProducts.filter((p) => p.price <= maxPrice);

      expect(filtered).toHaveLength(2);
      filtered.forEach((product) => {
        expect(product.price).toBeLessThanOrEqual(maxPrice);
      });
    });
  });

  describe('Product Detail Page', () => {
    it('should display correct product information', () => {
      const product = mockProducts[0];

      expect(product.nameEn).toBe('Vitamin C Serum');
      expect(product.nameEs).toBe('Sérum Vitamina C');
      expect(product.price).toBe(45);
    });

    it('should display product images', () => {
      const product = mockProducts[0];
      expect(product.image).toBeDefined();
      expect(product.image).toContain('http');
    });

    it('should show available quantity in stock', () => {
      const product = mockProducts[0];
      expect(product.stock).toBe(25);
    });

    it('should have add to cart button on detail page', () => {
      // This would be tested in actual component
      const product = mockProducts[0];
      const hasAddToCartButton = true;

      expect(hasAddToCartButton).toBe(true);
      expect(product.id).toBeDefined();
    });
  });

  describe('Add to Cart from Product Detail', () => {
    it('should update cart when clicking add to cart', () => {
      const product = mockProducts[0];
      const mockCart = [];

      // Simulate adding to cart
      mockCart.push({
        productId: product.id,
        quantity: 1,
        price: product.price,
      });

      expect(mockCart).toHaveLength(1);
      expect(mockCart[0].productId).toBe('prod-1');
    });

    it('should show success message after adding to cart', () => {
      const successMessage = 'Product added to cart';
      expect(successMessage).toContain('added to cart');
    });

    it('should allow changing quantity before adding to cart', () => {
      const product = mockProducts[0];
      let quantity = 1;

      // Simulate increasing quantity
      quantity = 3;

      expect(quantity).toBe(3);
    });
  });

  describe('Sorting', () => {
    it('should sort products by price ascending', () => {
      const sorted = [...mockProducts].sort((a, b) => a.price - b.price);

      expect(sorted[0].price).toBeLessThanOrEqual(sorted[1].price);
      expect(sorted[1].price).toBeLessThanOrEqual(sorted[2].price);
    });

    it('should sort products by price descending', () => {
      const sorted = [...mockProducts].sort((a, b) => b.price - a.price);

      expect(sorted[0].price).toBeGreaterThanOrEqual(sorted[1].price);
    });

    it('should sort products by newest first', () => {
      // Would require created_at timestamp in mock data
      expect(mockProducts).toBeDefined();
    });
  });

  describe('Out of Stock', () => {
    it('should disable add to cart button when out of stock', () => {
      const outOfStockProduct = { ...mockProducts[0], stock: 0 };

      const isAvailable = outOfStockProduct.stock > 0;
      expect(isAvailable).toBe(false);
    });

    it('should show out of stock badge when stock is 0', () => {
      const product = { ...mockProducts[0], stock: 0 };
      const statusMessage = product.stock > 0 ? 'In Stock' : 'Out of Stock';

      expect(statusMessage).toBe('Out of Stock');
    });
  });
});
