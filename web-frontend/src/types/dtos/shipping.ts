// Shipping DTOs
export interface ShipmentDto {
  id: string;
  orderId: string;
  shipperId: string;
  shipperName: string;
  trackingCode: string;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  notes?: string;
  shipper?: ShipperDto;
  statusHistory?: ShipmentStatusDto[];
  routePoints?: ShipmentRoutePointDto[];
}

export interface ShipperDto {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  isActive: boolean;
}

export interface ShipmentStatusDto {
  id: string;
  shipmentId: string;
  status: string;
  notes?: string;
  location?: string;
  createdAt: string;
}

export interface ShipmentRoutePointDto {
  id: string;
  shipmentId: string;
  location: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  arrivedAt: string;
}

export interface CreateShipmentDto {
  orderId: string;
  shipperId: string;
  notes?: string;
}

export interface UpdateShipmentStatusDto {
  status: string;
  notes?: string;
  location?: string;
}

export interface CompleteDeliveryDto {
  receiverName?: string;
  receiverPhone?: string;
  notes?: string;
  proofImageUrl?: string;
}
