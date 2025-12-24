using BookStore.Application.Dtos.Cart;
using BookStore.Application.Dtos.Checkout;
using BookStore.Application.Dtos.Inventory;
using BookStore.Application.Dtos.Ordering;
using BookStore.Application.IService.Cart;
using BookStore.Application.IService.Checkout;
using BookStore.Application.IService.Inventory;
using BookStore.Application.IService.Ordering;
using BookStore.Application.IService.Payment;
using BookStore.Application.Mappers.Checkout;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;
using PaymentDto = BookStore.Application.Dtos.Payment;

namespace BookStore.Application.Services.Checkout
{
    public class CheckoutService : ICheckoutService
    {
        private readonly ICartService _cartService;
        private readonly IOrderService _orderService;
        private readonly IPaymentService _paymentService;
        private readonly IStockItemService _stockItemService;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<CheckoutService> _logger;

        // Shipping fee mặc định (có thể config từ appsettings)
        private const decimal DEFAULT_SHIPPING_FEE = 30000m; // 30,000 VND

        // Warehouse mặc định - Khớp với database thực tế (StockItems table)
        private static readonly Guid DEFAULT_WAREHOUSE_ID = Guid.Parse("11EDB44C-791B-43F1-B69C-56A2E3178425");

        public CheckoutService(
            ICartService cartService,
            IOrderService orderService,
            IPaymentService paymentService,
            IStockItemService stockItemService,
            IBookRepository bookRepository,
            ILogger<CheckoutService> logger)
        {
            _cartService = cartService;
            _orderService = orderService;
            _paymentService = paymentService;
            _stockItemService = stockItemService;
            _bookRepository = bookRepository;
            _logger = logger;
        }


        public async Task<CheckoutPreviewDto> GetCheckoutPreviewAsync(Guid userId, string? couponCode = null)
        {
            // Lấy cart của user
            var cart = await _cartService.GetActiveCartByUserIdAsync(userId);

            if (cart == null || !cart.Items.Any())
            {
                return new CheckoutPreviewDto
                {
                    UserId = userId,
                    Cart = cart ?? new Dtos.Cart.CartDto { UserId = userId },
                    Subtotal = 0,
                    DiscountAmount = 0,
                    ShippingFee = 0,
                    TotalAmount = 0,
                    IsValid = false,
                    ValidationMessages = new List<string> { "Giỏ hàng trống" }
                };
            }

            // Tính toán giá
            var calculation = await CalculateCheckoutTotalAsync(userId, couponCode);

            // Validate
            var validation = await ValidateCheckoutAsync(userId);

            return cart.ToCheckoutPreviewDto(
                calculation.Subtotal,
                calculation.DiscountAmount,
                calculation.ShippingFee,
                couponCode,
                validation.IsValid,
                validation.ErrorMessages
            );
        }

        public async Task<CheckoutValidationResultDto> ValidateCheckoutAsync(Guid userId)
        {
            var errorMessages = new List<string>();
            var itemValidations = new List<CheckoutItemValidationDto>();

            // Lấy cart
            _logger.LogInformation($"🛒 Validating checkout for user {userId}");
            var cart = await _cartService.GetActiveCartByUserIdAsync(userId);

            if (cart == null || !cart.Items.Any())
            {
                _logger.LogWarning($"⚠️ Cart is empty for user {userId}");
                return CheckoutMapper.ToValidationFailure(
                    new List<string> { "Giỏ hàng trống" }
                );
            }

            _logger.LogInformation($"📦 Found {cart.Items.Count} items in cart");

            // Validate từng item
            foreach (var item in cart.Items)
            {
                _logger.LogInformation($"🔍 Validating item: BookId={item.BookId}, Title='{item.BookTitle}', Qty={item.Quantity}");
                
                var book = await _bookRepository.GetByIdAsync(item.BookId);

                if (book == null)
                {
                    _logger.LogWarning($"⚠️ Book not found: {item.BookId}");
                    errorMessages.Add($"Sách '{item.BookTitle}' không tồn tại");
                    itemValidations.Add(item.ToItemValidationDto(false, 0, "Sách không tồn tại"));
                    continue;
                }

                // NOTE: Đã bỏ check book.IsAvailable vì đã có stock validation
                // Chỉ dựa vào stock thực tế để validate

                // Kiểm tra số lượng tồn kho từ StockItem
                var availableStock = await GetAvailableStockAsync(item.BookId);

                if (availableStock == 0)
                {
                    errorMessages.Add($"Sách '{item.BookTitle}' hiện đã hết hàng");
                    itemValidations.Add(item.ToItemValidationDto(false, 0, "Đã hết hàng"));
                    continue;
                }

                if (item.Quantity > availableStock)
                {
                    errorMessages.Add($"Sách '{item.BookTitle}' chỉ còn {availableStock} cuốn");
                    itemValidations.Add(item.ToItemValidationDto(false, availableStock, $"Chỉ còn {availableStock} cuốn"));
                    continue;
                }

                // Item hợp lệ
                itemValidations.Add(item.ToItemValidationDto(true, availableStock));
            }

            if (errorMessages.Any())
            {
                return CheckoutMapper.ToValidationFailure(errorMessages, itemValidations);
            }

            return CheckoutMapper.ToValidationSuccess();
        }

        public async Task<CheckoutCalculationDto> CalculateCheckoutTotalAsync(Guid userId, string? couponCode = null)
        {
            var cart = await _cartService.GetActiveCartByUserIdAsync(userId);

            if (cart == null || !cart.Items.Any())
            {
                return CheckoutMapper.ToCalculationDto(0, 0, 0, 0);
            }

            var subtotal = cart.Items.CalculateSubtotal();
            var shippingFee = DEFAULT_SHIPPING_FEE;
            decimal discountAmount = 0;
            decimal discountPercentage = 0;
            bool couponApplied = false;

            // Áp dụng coupon nếu có
            if (!string.IsNullOrEmpty(couponCode))
            {
                var isValidCoupon = await ValidateCouponAsync(couponCode, userId);
                if (isValidCoupon)
                {
                    // TODO: Implement coupon logic - tạm thời giảm 10%
                    discountPercentage = 10;
                    discountAmount = subtotal * (discountPercentage / 100);
                    couponApplied = true;

                    _logger.LogInformation($"Coupon {couponCode} applied for user {userId}");
                }
            }

            // Miễn phí ship nếu đơn hàng > 500,000 VND
            if (subtotal >= 500000m)
            {
                shippingFee = 0;
            }

            return CheckoutMapper.ToCalculationDto(
                subtotal,
                discountAmount,
                discountPercentage,
                shippingFee,
                couponCode,
                couponApplied
            );
        }

        public Task<bool> ValidateCouponAsync(string couponCode, Guid userId)
        {
            // TODO: Implement actual coupon validation logic
            // For now, return true for demo purposes
            _logger.LogInformation($"Đang kiểm tra mã giảm giá {couponCode} cho người dùng {userId}");

            // Giả sử mã "FREESHIP" và "DISCOUNT10" là hợp lệ
            var isValid = couponCode.ToUpper() == "FREESHIP" || couponCode.ToUpper() == "DISCOUNT10";
            return Task.FromResult(isValid);
        }



        public async Task<CheckoutResultDto> ProcessCheckoutAsync(CheckoutRequestDto dto)
        {
            try
            {
                _logger.LogInformation($"Starting checkout process for user {dto.UserId}");

                // 1. Validate checkout
                var validation = await ValidateCheckoutAsync(dto.UserId);
                if (!validation.IsValid)
                {
                    return CheckoutMapper.ToCheckoutFailureDto(
                        $"Checkout không hợp lệ: {string.Join(", ", validation.ErrorMessages)}"
                    );
                }

                // 2. Lấy cart để reserve stock
                var cart = await _cartService.GetActiveCartByUserIdAsync(dto.UserId);
                Guard.Against(cart == null || !cart.Items.Any(), "Giỏ hàng trống");

                // 3. Reserve stock cho tất cả items trong cart
                var reserveSuccess = await ReserveStockForCartAsync(cart!);
                if (!reserveSuccess)
                {
                    return CheckoutMapper.ToCheckoutFailureDto(
                        "Không thể đặt hàng do một số sản phẩm đã hết hàng trong lúc xử lý"
                    );
                }

                try
                {
                    // 4. Tạo order từ cart
                    var order = await _orderService.CreateOrderFromCartAsync(
                        dto.UserId,
                        dto.Address,
                        null // TODO: Get couponId from couponCode if provided
                    );

                    _logger.LogInformation($"Order created: {order.OrderNumber}");

                    // 5. Tạo payment transaction
                    var payment = await _paymentService.CreatePaymentForOrderAsync(
                        order.Id,
                        dto.Provider,
                        dto.PaymentMethod
                    );

                    _logger.LogInformation($"Payment created: {payment.TransactionCode}");

                    // 6. Nếu là COD, confirm sale ngay (giảm stock luôn)
                    // Vì COD không có callback thanh toán, nên phải giảm stock ngay khi tạo order
                    if (dto.PaymentMethod == "COD")
                    {
                        await ConfirmStockSaleAsync(order);
                        _logger.LogInformation($"Stock confirmed for COD order {order.OrderNumber}");
                    }

                    // 7. Generate payment URL/QR Code (giả lập)
                    var paymentUrl = GeneratePaymentUrl(payment.TransactionCode, payment.Amount);
                    var qrCodeUrl = GenerateQrCodeUrl(payment.TransactionCode, payment.Amount);

                    // 8. Clear cart sau khi checkout thành công
                    await _cartService.ClearCartAsync(new ClearCartDto { UserId = dto.UserId });
                    _logger.LogInformation($"Cart cleared for user {dto.UserId}");

                    return order.ToCheckoutResultDto(payment, paymentUrl, qrCodeUrl);
                }
                catch (Exception)
                {
                    // Nếu tạo order thất bại, release reserved stock
                    await ReleaseStockForCartAsync(cart!);
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during checkout for user {dto.UserId}");
                return CheckoutMapper.ToCheckoutFailureDto($"Có lỗi xảy ra: {ex.Message}");
            }
        }

        public async Task<CheckoutResultDto> QuickCheckoutAsync(
            Guid userId,
            CreateOrderAddressDto address,
            string? couponCode = null,
            string provider = "VietQR")
        {
            var checkoutRequest = new CheckoutRequestDto
            {
                UserId = userId,
                Address = address,
                CouponCode = couponCode,
                Provider = provider,
                PaymentMethod = "Online"
            };

            return await ProcessCheckoutAsync(checkoutRequest);
        }


        public async Task<CheckoutResultDto> HandlePaymentCallbackAsync(PaymentDto.PaymentCallbackDto callbackDto)
        {
            try
            {
                _logger.LogInformation($"Processing payment callback for transaction {callbackDto.TransactionCode}");

                // Cập nhật payment status
                var payment = await _paymentService.ProcessPaymentCallbackAsync(callbackDto);

                if (payment == null)
                {
                    return CheckoutMapper.ToCheckoutFailureDto("Không tìm thấy giao dịch thanh toán");
                }

                // Lấy order details
                var order = await _orderService.GetOrderByIdAsync(payment.OrderId);
                Guard.Against(order == null, "Không tìm thấy đơn hàng");

                // Nếu thanh toán thành công, cập nhật order status và confirm stock sale
                // Accept các format: "Success", "SUCCESS", "Completed"
                var successStatuses = new[] { "Success", "SUCCESS", "Completed", "COMPLETED" };
                if (successStatuses.Contains(callbackDto.Status))
                {
                    // Cập nhật order status
                    await _orderService.ConfirmOrderPaymentAsync(payment.OrderId);
                    _logger.LogInformation($"Order {payment.OrderId} marked as Paid");

                    // Confirm stock sale (chuyển từ reserved sang sold)
                    await ConfirmStockSaleAsync(order!);
                    _logger.LogInformation($"Stock sale confirmed for order {payment.OrderId}");
                }
                else if (callbackDto.Status == "Failed" || callbackDto.Status == "Cancelled" ||
                         callbackDto.Status == "FAILED" || callbackDto.Status == "CANCELLED")
                {
                    // Nếu thanh toán thất bại, release reserved stock
                    _logger.LogWarning($"Payment failed for order {payment.OrderId}, releasing stock");

                    // Convert OrderDto sang CartDto để release stock
                    var cartDto = ConvertOrderToCart(order!);
                    await ReleaseStockForCartAsync(cartDto);
                }

                return order!.ToCheckoutResultDto(payment);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error processing payment callback for {callbackDto.TransactionCode}");
                return CheckoutMapper.ToCheckoutFailureDto($"Lỗi xử lý callback: {ex.Message}");
            }
        }

        public async Task<PaymentDto.PaymentTransactionDto?> GetCheckoutPaymentStatusAsync(Guid orderId)
        {
            return await _paymentService.GetPaymentByOrderIdAsync(orderId);
        }


        public async Task<bool> CancelCheckoutAsync(Guid orderId, Guid userId)
        {
            try
            {
                // Kiểm tra quyền sở hữu order
                var isOwner = await _orderService.IsOrderOwnedByUserAsync(orderId, userId);
                Guard.Against(!isOwner, "Bạn không có quyền hủy đơn hàng này");

                // Kiểm tra có thể hủy không
                var canCancel = await _orderService.CanCancelOrderAsync(orderId);
                Guard.Against(!canCancel, "Không thể hủy đơn hàng này (đã thanh toán hoặc đang giao)");

                // Lấy thông tin order trước khi hủy để release stock
                var order = await _orderService.GetOrderByIdAsync(orderId);
                Guard.Against(order == null, "Đơn hàng không tồn tại");

                // Hủy order
                await _orderService.CancelOrderAsync(new CancelOrderDto
                {
                    OrderId = orderId,
                    Reason = "Hủy bởi người dùng"
                });

                // Release stock về kho
                // Nếu order chưa thanh toán -> stock đang ở trạng thái reserved
                // Nếu order đã thanh toán -> stock đã được sold
                await ReleaseStockForOrderAsync(order!);

                _logger.LogInformation($"Order {orderId} cancelled by user {userId}, stock released");

                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error cancelling checkout {orderId}");
                return false;
            }
        }

        public async Task<CheckoutResultDto?> GetCheckoutResultByOrderIdAsync(Guid orderId)
        {
            var order = await _orderService.GetOrderByIdAsync(orderId);
            if (order == null)
                return null;

            var payment = await _paymentService.GetPaymentByOrderIdAsync(orderId);

            return order.ToCheckoutResultDto(payment);
        }

        public async Task<(List<CheckoutResultDto> Items, int TotalCount)> GetUserCheckoutHistoryAsync(
            Guid userId,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var (orders, totalCount) = await _orderService.GetOrdersByUserIdAsync(
                userId,
                null, // Lấy tất cả status
                pageNumber,
                pageSize
            );

            var checkoutResults = new List<CheckoutResultDto>();

            foreach (var order in orders)
            {
                var payment = await _paymentService.GetPaymentByOrderIdAsync(order.Id);
                checkoutResults.Add(order.ToCheckoutResultDto(payment));
            }

            return (checkoutResults, totalCount);
        }


        /// <summary>
        /// Generate payment URL (giả lập - thực tế cần tích hợp với payment gateway)
        /// </summary>
        private string GeneratePaymentUrl(string transactionCode, decimal amount)
        {
            // URL giả lập cho demo
            return $"https://payment.bookstore.com/pay?txn={transactionCode}&amount={amount}";
        }

        /// <summary>
        /// Generate QR Code URL (giả lập - thực tế cần tích hợp với VietQR API)
        /// </summary>
        private string GenerateQrCodeUrl(string transactionCode, decimal amount)
        {
            // URL giả lập cho demo - VietQR format
            var bankCode = "970422"; // VCB
            var accountNo = "1234567890";
            var template = "compact";
            var description = Uri.EscapeDataString($"Thanh toan don hang {transactionCode}");

            return $"https://img.vietqr.io/image/{bankCode}-{accountNo}-{template}.png?amount={amount}&addInfo={description}";
        }

        /// <summary>
        /// Lấy số lượng tồn kho khả dụng từ warehouse mặc định
        /// (Chỉ check từ 1 warehouse để đồng bộ với ReserveStock)
        /// </summary>
        private async Task<int> GetAvailableStockAsync(Guid bookId)
        {
            try
            {
                // Chỉ lấy stock từ warehouse mặc định (đồng bộ với reserve logic)
                _logger.LogInformation($"🔍 Checking stock for book {bookId} in warehouse {DEFAULT_WAREHOUSE_ID}");
                
                var stockItem = await _stockItemService.GetStockByBookAndWarehouseAsync(bookId, DEFAULT_WAREHOUSE_ID);

                if (stockItem == null)
                {
                    _logger.LogWarning($"⚠️ No stock found for book {bookId} in warehouse {DEFAULT_WAREHOUSE_ID}");
                    return 0;
                }

                // Trả về available quantity = onHand - reserved
                _logger.LogInformation($"📦 Stock for book {bookId}: OnHand={stockItem.QuantityOnHand}, Reserved={stockItem.ReservedQuantity}, Available={stockItem.AvailableQuantity}");
                return stockItem.AvailableQuantity;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"❌ Error getting available stock for book {bookId}");
                return 0;
            }
        }

        /// <summary>
        /// Reserve stock cho tất cả items trong cart
        /// </summary>
        private async Task<bool> ReserveStockForCartAsync(Dtos.Cart.CartDto cart)
        {
            foreach (var item in cart.Items)
            {
                try
                {
                    // Reserve stock từ warehouse mặc định (hoặc có thể chọn warehouse gần nhất)
                    var reserveDto = new ReserveStockDto
                    {
                        BookId = item.BookId,
                        WarehouseId = DEFAULT_WAREHOUSE_ID, // TODO: Smart warehouse selection
                        Quantity = item.Quantity,
                        OrderId = cart.Id.ToString() // Tracking purpose
                    };

                    var success = await _stockItemService.ReserveStockAsync(reserveDto);

                    if (!success)
                    {
                        _logger.LogWarning($"Failed to reserve stock for book {item.BookId}");

                        // Rollback: Release các stock đã reserve trước đó
                        await ReleaseStockForCartAsync(cart);
                        return false;
                    }

                    _logger.LogInformation($"Reserved {item.Quantity} units of book {item.BookId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error reserving stock for book {item.BookId}");

                    // Rollback
                    await ReleaseStockForCartAsync(cart);
                    return false;
                }
            }

            return true;
        }

        /// <summary>
        /// Release reserved stock (khi checkout fail hoặc cancel)
        /// </summary>
        private async Task ReleaseStockForCartAsync(Dtos.Cart.CartDto cart)
        {
            foreach (var item in cart.Items)
            {
                try
                {
                    await _stockItemService.ReleaseReservedStockAsync(
                        item.BookId,
                        DEFAULT_WAREHOUSE_ID,
                        item.Quantity
                    );

                    _logger.LogInformation($"Released {item.Quantity} units of book {item.BookId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error releasing stock for book {item.BookId}");
                    // Continue với các items khác
                }
            }
        }

        /// <summary>
        /// Confirm sale khi thanh toán thành công (chuyển từ reserved sang sold)
        /// </summary>
        private async Task ConfirmStockSaleAsync(OrderDto order)
        {
            foreach (var item in order.Items)
            {
                try
                {
                    await _stockItemService.ConfirmSaleAsync(
                        item.BookId,
                        DEFAULT_WAREHOUSE_ID,
                        item.Quantity
                    );

                    _logger.LogInformation($"Confirmed sale of {item.Quantity} units of book {item.BookId}");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error confirming sale for book {item.BookId}");
                    // Log nhưng không fail transaction
                }
            }
        }

        /// <summary>
        /// Release stock khi hủy order
        /// - Nếu order chưa thanh toán (status = Pending/Confirmed) VÀ không phải COD: Release reserved stock
        /// - Nếu order đã thanh toán HOẶC là COD (stock đã confirmed): Return sold stock
        /// </summary>
        private async Task ReleaseStockForOrderAsync(OrderDto order)
        {
            // Kiểm tra xem stock đã được confirmed (sold) chưa
            // Trường hợp 1: Order đã thanh toán (Online payment SUCCESS)
            bool isPaid = order.PaidAt.HasValue ||
                         (order.PaymentTransaction != null &&
                          (order.PaymentTransaction.Status == "SUCCESS" ||
                           order.PaymentTransaction.Status == "Success"));

            // Trường hợp 2: Order là COD (stock đã confirmed ngay khi tạo order)
            bool isCOD = order.PaymentTransaction != null &&
                        order.PaymentTransaction.PaymentMethod == "COD";

            // Nếu đã paid HOẶC là COD -> stock đã sold -> cần Return
            bool needReturnStock = isPaid || isCOD;

            foreach (var item in order.Items)
            {
                try
                {
                    if (needReturnStock)
                    {
                        // Order đã sold stock (paid hoặc COD) -> cần Return (hoàn trả)
                        await _stockItemService.ReturnStockAsync(
                            item.BookId,
                            DEFAULT_WAREHOUSE_ID,
                            item.Quantity
                        );
                        _logger.LogInformation($"Returned {item.Quantity} units of book {item.BookId} (order was {(isCOD ? "COD" : "paid")})");
                    }
                    else
                    {
                        // Order chưa thanh toán (Online pending) -> stock đang reserved -> cần ReleaseReserved
                        await _stockItemService.ReleaseReservedStockAsync(
                            item.BookId,
                            DEFAULT_WAREHOUSE_ID,
                            item.Quantity
                        );
                        _logger.LogInformation($"Released {item.Quantity} reserved units of book {item.BookId}");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error releasing stock for book {item.BookId} in cancelled order {order.Id}");
                    // Continue với các items khác
                }
            }
        }

        /// <summary>
        /// Convert OrderDto sang CartDto để xử lý stock
        /// </summary>
        private Dtos.Cart.CartDto ConvertOrderToCart(OrderDto order)
        {
            return new Dtos.Cart.CartDto
            {
                Id = order.Id,
                UserId = order.UserId,
                IsActive = false,
                Items = order.Items.Select(item => new Dtos.Cart.CartItemDto
                {
                    BookId = item.BookId,
                    BookTitle = item.BookTitle,
                    BookPrice = item.UnitPrice,
                    Quantity = item.Quantity
                }).ToList()
            };
        }

    }
}