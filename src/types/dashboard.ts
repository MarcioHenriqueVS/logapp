export interface DeliveryItem {
  id: string;
  customer: string;
  address: string;
  status: 'pending' | 'in_route' | 'delivered';
}

export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  availableQuantity: number;
}

export interface Vehicle {
  id: string;
  plate: string;
  model: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  initials: string;
}

export interface Unit {
  id: string;
  city: string;
  district: string;
}

export interface ProductMovement {
  id: string;
  name: string;
  initialQuantity: number;
  sold: number;
  returned: number;
  isNew?: boolean;
  receivedFrom?: string;
} 