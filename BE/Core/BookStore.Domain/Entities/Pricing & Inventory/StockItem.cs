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

        /// <summary>
        /// Decrease stock (for direct sales WITHOUT reservation)
        /// </summary>
        public void Decrease(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            int available = QuantityOnHand - ReservedQuantity;
            if (available < amount)
                throw new InvalidOperationException($"Not enough available stock. Available: {available}, Requested: {amount}");

            QuantityOnHand -= amount;
            SoldQuantity += amount;
            UpdateTimestamp();
        }


        public void AdjustQuantity(int amount)
        {
            if (amount == 0)
                throw new ArgumentException("Amount must not be zero.", nameof(amount));

            if (amount > 0)
            {
                // Increase
                QuantityOnHand += amount;
            }
            else
            {
                // Decrease - check available stock
                int available = QuantityOnHand - ReservedQuantity;
                if (available < Math.Abs(amount))
                    throw new InvalidOperationException($"Not enough available stock. Available: {available}, Requested: {Math.Abs(amount)}");

                QuantityOnHand += amount; // amount is negative
            }
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

        /// <summary>
        /// Confirm sale from reserved stock (Order confirmed/paid)
        /// </summary>
        public void ConfirmSale(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            if (ReservedQuantity < amount)
                throw new InvalidOperationException($"Reserved quantity insufficient. Reserved: {ReservedQuantity}, Requested: {amount}");

            // Remove from both reserved and onhand
            ReservedQuantity -= amount;
            QuantityOnHand -= amount;
            SoldQuantity += amount;
            UpdateTimestamp();
        }

        /// <summary>
        /// Return stock (refund/cancellation)
        /// </summary>
        public void Return(int amount)
        {
            if (amount <= 0)
                throw new ArgumentException("Quantity must be greater than zero.", nameof(amount));

            QuantityOnHand += amount;
            if (SoldQuantity >= amount)
                SoldQuantity -= amount;
            UpdateTimestamp();
        }

        /// <summary>
        /// Get available quantity for new orders
        /// </summary>
        public int GetAvailableQuantity() => QuantityOnHand - ReservedQuantity;

        /// <summary>
        /// Check if can fulfill order
        /// </summary>
        public bool CanFulfill(int requestedQuantity) => GetAvailableQuantity() >= requestedQuantity;

        private void UpdateTimestamp()
        {
            LastUpdated = DateTime.UtcNow;
        }
    }
}
