export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  emoji: string;
  offer: boolean;
  discount?: number;
}

export interface CartItem extends Product {
  weight: number;
}

export interface Order {
  id: number;
  customer: string;
  phone: string;
  address: string;
  items: CartItem[];
  total: number;
  date: string;
}

export type FilterType = 'الكل' | 'فاكهة' | 'خضروات' | 'عروض';
