// Address types

export interface Address {
  id: string;
  userId: string;
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressDto {
  recipientName: string;
  phoneNumber: string;
  province: string;
  district: string;
  ward: string;
  streetAddress: string;
  isDefault?: boolean;
}

export interface UpdateAddressDto {
  recipientName?: string;
  phoneNumber?: string;
  province?: string;
  district?: string;
  ward?: string;
  streetAddress?: string;
  isDefault?: boolean;
}
