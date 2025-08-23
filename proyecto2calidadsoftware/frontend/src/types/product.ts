export interface Product {
  id: number;
  code: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface CreateProductData {
  code: string;
  name: string;
  description?: string;
  quantity: number;
  price: number;
}

export interface UpdateProductData {
  code?: string;
  name?: string;
  description?: string;
  quantity?: number;
  price?: number;
}

export interface ProductStats {
  totalProducts: number;
  totalQuantity: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  lowStockCount: number;
}

export interface ProductFilters {
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  minQuantity?: number;
  maxQuantity?: number;
}
