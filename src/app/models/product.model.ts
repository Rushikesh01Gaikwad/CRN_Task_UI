export interface Item {
  id: number;
  productId: number;
  quantity: number;
}

export interface CreateItemDto {
  quantity: number;
}

export interface UpdateItemDto {
  quantity: number;
}

export interface Product {
  id: number;
  productName: string;
  createdBy: string;
  createdOn: string;
  modifiedBy?: string | null;
  modifiedOn?: string | null;
  items: Item[];
}

export interface CreateProductDto {
  productName: string;
  createdBy: string;
  items?: CreateItemDto[];
}

export interface UpdateProductDto {
  productName: string;
  modifiedBy: string;
}
