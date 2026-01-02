// Stock types

export interface StockItem {
  bookId: string;
  warehouseId: string;
  quantityOnHand: number;
  reservedQuantity: number;
  reorderPoint: number;
  reorderQuantity: number;
  lastRestockDate?: string;
}

export interface StockAvailability {
  available: boolean;
  quantityOnHand: number;
  reservedQuantity: number;
  availableQuantity: number;
  requestedQuantity: number;
  message: string;
}
