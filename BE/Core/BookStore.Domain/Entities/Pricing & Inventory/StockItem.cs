using BookStore.Domain.Entities.Catalog;
using System;

namespace BookStore.Domain.Entities.Pricing_Inventory
{
    public class StockItem
    {
        public Guid Id { get; set; }

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;

        // Nếu bạn thêm module Warehouse:
        public Guid WarehouseId { get; set; }

        // Số lượng trong kho
        public int QuantityOnHand { get; private set; }

        // Số lượng đang giữ cho đơn hàng chờ xử lý
        public int ReservedQuantity { get; private set; }

        // Số lượng đã bán (để thống kê)
        public int SoldQuantity { get; private set; }

        public DateTime LastUpdated { get; private set; } = DateTime.UtcNow;

        // ------------------------------
        // Domain Logic
        // ------------------------------

        public void Increase(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            QuantityOnHand += amount;
            UpdateTimestamp();
        }

        public void Decrease(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            // Tránh trừ vượt quá tổng khả dụng (bao gồm cả hàng đang giữ)
            int available = QuantityOnHand - ReservedQuantity;
            if (available < amount)
                throw new InvalidOperationException("Not enough available stock.");

            QuantityOnHand -= amount;
            SoldQuantity += amount;
            UpdateTimestamp();
        }

        public void Reserve(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            int available = QuantityOnHand - ReservedQuantity;
            if (available < amount)
                throw new InvalidOperationException("Not enough stock to reserve.");

            ReservedQuantity += amount;
            UpdateTimestamp();
        }

        public void ReleaseReserved(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            if (ReservedQuantity < amount)
                throw new InvalidOperationException("Reserved quantity is not sufficient to release.");

            ReservedQuantity -= amount;
            UpdateTimestamp();
        }

        public void Return(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            QuantityOnHand += amount;
            UpdateTimestamp();
        }

        private void UpdateTimestamp()
        {
            LastUpdated = DateTime.UtcNow;
        }
    }
}
