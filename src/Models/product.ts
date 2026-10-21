export interface Item {
  id?: number;
  productId?: number;
  quantity: number;
}

export interface Product {
  id: number;
  productName: string;
  createdBy: string;
  createdOn?: string;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
  items: Item[];
}

export interface CreateProduct {
  productName: string;
  createdBy: string;
  items: Item[];
}

export interface UpdateProduct {
  productName: string;
  modifiedBy: string;
}