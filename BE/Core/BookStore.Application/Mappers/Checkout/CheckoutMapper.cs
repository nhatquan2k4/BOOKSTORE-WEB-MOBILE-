using BookStore.Application.Dtos.Cart;
using BookStore.Application.Dtos.Checkout;
using BookStore.Application.Dtos.Ordering;
using BookStore.Application.Mappers.Cart;
using BookStore.Application.Mappers.Ordering;
using BookStore.Application.Mappers.Payment;
using BookStore.Domain.Entities.Cart;
using BookStore.Domain.Entities.Ordering;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.Application.Mappers.Checkout
{
    public static class CheckoutMapper
    {
        #region CheckoutPreviewDto Mappings

        /// <summary>
        /// Tạo CheckoutPreviewDto từ Cart và các thông tin tính toán
        /// </summary>
        public static CheckoutPreviewDto ToCheckoutPreviewDto(
            this Domain.Entities.Cart.Cart cart,
            decimal subtotal,
            decimal discountAmount,
            decimal shippingFee,
            string? couponCode = null,
            bool isValid = true,
            List<string>? validationMessages = null)
        {
            return new CheckoutPreviewDto
            {
                UserId = cart.UserId,
                Cart = cart.ToDto(),
                Subtotal = subtotal,
                DiscountAmount = discountAmount,
                ShippingFee = shippingFee,
                TotalAmount = subtotal - discountAmount + shippingFee,
                CouponCode = couponCode,
                IsValid = isValid,
                ValidationMessages = validationMessages ?? new List<string>()
            };
        }

        /// <summary>
        /// Tạo CheckoutPreviewDto từ CartDto
        /// </summary>
        public static CheckoutPreviewDto ToCheckoutPreviewDto(
            this CartDto cart,
            decimal subtotal,
            decimal discountAmount,
            decimal shippingFee,
            string? couponCode = null,
            bool isValid = true,
            List<string>? validationMessages = null)
        {
            return new CheckoutPreviewDto
            {
                UserId = cart.UserId,
                Cart = cart,
                Subtotal = subtotal,
                DiscountAmount = discountAmount,
                ShippingFee = shippingFee,
                TotalAmount = subtotal - discountAmount + shippingFee,
                CouponCode = couponCode,
                IsValid = isValid,
                ValidationMessages = validationMessages ?? new List<string>()
            };
        }

        #endregion

        #region CheckoutValidationResultDto Mappings

        /// <summary>
        /// Tạo CheckoutValidationResultDto thành công
        /// </summary>
        public static CheckoutValidationResultDto ToValidationSuccess()
        {
            return new CheckoutValidationResultDto
            {
                IsValid = true,
                ErrorMessages = new List<string>(),
                ItemValidations = new List<CheckoutItemValidationDto>()
            };
        }

        /// <summary>
        /// Tạo CheckoutValidationResultDto thất bại
        /// </summary>
        public static CheckoutValidationResultDto ToValidationFailure(
            List<string> errorMessages,
            List<CheckoutItemValidationDto>? itemValidations = null)
        {
            return new CheckoutValidationResultDto
            {
                IsValid = false,
                ErrorMessages = errorMessages,
                ItemValidations = itemValidations ?? new List<CheckoutItemValidationDto>()
            };
        }

        /// <summary>
        /// Tạo CheckoutItemValidationDto từ CartItem
        /// </summary>
        public static CheckoutItemValidationDto ToItemValidationDto(
            this CartItem cartItem,
            bool isAvailable,
            int availableQuantity,
            string? errorMessage = null)
        {
            return new CheckoutItemValidationDto
            {
                BookId = cartItem.BookId,
                BookTitle = cartItem.Book?.Title ?? "Unknown",
                IsAvailable = isAvailable,
                RequestedQuantity = cartItem.Quantity,
                AvailableQuantity = availableQuantity,
                ErrorMessage = errorMessage
            };
        }

        /// <summary>
        /// Tạo CheckoutItemValidationDto từ CartItemDto
        /// </summary>
        public static CheckoutItemValidationDto ToItemValidationDto(
            this CartItemDto cartItem,
            bool isAvailable,
            int availableQuantity,
            string? errorMessage = null)
        {
            return new CheckoutItemValidationDto
            {
                BookId = cartItem.BookId,
                BookTitle = cartItem.BookTitle,
                IsAvailable = isAvailable,
                RequestedQuantity = cartItem.Quantity,
                AvailableQuantity = availableQuantity,
                ErrorMessage = errorMessage
            };
        }

        #endregion

        #region CheckoutResultDto Mappings

        /// <summary>
        /// Tạo CheckoutResultDto thành công từ Order và Payment
        /// </summary>
        public static CheckoutResultDto ToCheckoutResultDto(
            this Order order,
            Domain.Entities.Ordering___Payment.PaymentTransaction? payment = null,
            string? paymentUrl = null,
            string? qrCodeUrl = null)
        {
            return new CheckoutResultDto
            {
                Success = true,
                Message = "Checkout thành công",
                Order = order.ToDto(),
                Payment = payment?.ToDto(),
                PaymentUrl = paymentUrl,
                QrCodeUrl = qrCodeUrl
            };
        }

        /// <summary>
        /// Tạo CheckoutResultDto thành công từ OrderDto và PaymentDto
        /// </summary>
        public static CheckoutResultDto ToCheckoutResultDto(
            this OrderDto order,
            PaymentDto.PaymentTransactionDto? payment = null,
            string? paymentUrl = null,
            string? qrCodeUrl = null)
        {
            return new CheckoutResultDto
            {
                Success = true,
                Message = "Checkout thành công",
                Order = order,
                Payment = payment,
                PaymentUrl = paymentUrl,
                QrCodeUrl = qrCodeUrl
            };
        }

        /// <summary>
        /// Tạo CheckoutResultDto thất bại
        /// </summary>
        public static CheckoutResultDto ToCheckoutFailureDto(string errorMessage)
        {
            return new CheckoutResultDto
            {
                Success = false,
                Message = errorMessage,
                Order = null,
                Payment = null,
                PaymentUrl = null,
                QrCodeUrl = null
            };
        }

        #endregion

        #region CheckoutCalculationDto Mappings

        /// <summary>
        /// Tạo CheckoutCalculationDto
        /// </summary>
        public static CheckoutCalculationDto ToCalculationDto(
            decimal subtotal,
            decimal discountAmount,
            decimal discountPercentage,
            decimal shippingFee,
            string? couponCode = null,
            bool couponApplied = false)
        {
            return new CheckoutCalculationDto
            {
                Subtotal = subtotal,
                DiscountAmount = discountAmount,
                DiscountPercentage = discountPercentage,
                ShippingFee = shippingFee,
                TotalAmount = subtotal - discountAmount + shippingFee,
                CouponCode = couponCode,
                CouponApplied = couponApplied
            };
        }

        /// <summary>
        /// Tính toán từ Cart
        /// </summary>
        public static CheckoutCalculationDto CalculateFromCart(
            this Domain.Entities.Cart.Cart cart,
            decimal discountAmount = 0,
            decimal discountPercentage = 0,
            decimal shippingFee = 0,
            string? couponCode = null)
        {
            var subtotal = cart.Items.Sum(i => i.UnitPrice * i.Quantity);

            return ToCalculationDto(
                subtotal,
                discountAmount,
                discountPercentage,
                shippingFee,
                couponCode,
                !string.IsNullOrEmpty(couponCode)
            );
        }

        /// <summary>
        /// Tính toán từ CartDto
        /// </summary>
        public static CheckoutCalculationDto CalculateFromCartDto(
            this CartDto cart,
            decimal discountAmount = 0,
            decimal discountPercentage = 0,
            decimal shippingFee = 0,
            string? couponCode = null)
        {
            var subtotal = cart.Items.Sum(i => i.BookPrice * i.Quantity);

            return ToCalculationDto(
                subtotal,
                discountAmount,
                discountPercentage,
                shippingFee,
                couponCode,
                !string.IsNullOrEmpty(couponCode)
            );
        }

        #endregion

        #region CheckoutRequestDto to Order Entity

        /// <summary>
        /// Chuyển CheckoutRequestDto thành Order Entity
        /// </summary>
        public static Order ToOrderEntity(
            this CheckoutRequestDto dto,
            List<CreateOrderItemDto> orderItems,
            decimal totalAmount,
            decimal discountAmount)
        {
            return new Order
            {
                Id = Guid.NewGuid(),
                UserId = dto.UserId,
                Status = "Pending",
                OrderNumber = GenerateOrderNumber(),
                TotalAmount = totalAmount,
                DiscountAmount = discountAmount,
                CreatedAt = DateTime.UtcNow,
                Address = dto.Address.ToEntity(),
                Items = orderItems.Select(item => item.ToEntity(Guid.Empty)).ToList()
            };
        }

        #endregion

        #region Helper Methods

        /// <summary>
        /// Tạo mã đơn hàng tự động
        /// </summary>
        private static string GenerateOrderNumber()
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
            var random = new Random().Next(1000, 9999);
            return $"BK-{timestamp}-{random}";
        }

        /// <summary>
        /// Chuyển CartItems thành CreateOrderItemDto
        /// </summary>
        public static List<CreateOrderItemDto> ToOrderItems(this ICollection<CartItem> cartItems)
        {
            return cartItems.Select(item => new CreateOrderItemDto
            {
                BookId = item.BookId,
                Quantity = item.Quantity,
                UnitPrice = item.UnitPrice
            }).ToList();
        }

        /// <summary>
        /// Chuyển CartItemDtos thành CreateOrderItemDto
        /// </summary>
        public static List<CreateOrderItemDto> ToOrderItems(this IEnumerable<CartItemDto> cartItems)
        {
            return cartItems.Select(item => new CreateOrderItemDto
            {
                BookId = item.BookId,
                Quantity = item.Quantity,
                UnitPrice = item.BookPrice
            }).ToList();
        }

        /// <summary>
        /// Tính tổng tiền từ cart items
        /// </summary>
        public static decimal CalculateSubtotal(this ICollection<CartItem> cartItems)
        {
            return cartItems.Sum(i => i.UnitPrice * i.Quantity);
        }

        /// <summary>
        /// Tính tổng tiền từ cart item DTOs
        /// </summary>
        public static decimal CalculateSubtotal(this IEnumerable<CartItemDto> cartItems)
        {
            return cartItems.Sum(i => i.BookPrice * i.Quantity);
        }

        #endregion
    }
}
