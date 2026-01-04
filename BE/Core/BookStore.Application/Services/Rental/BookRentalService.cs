using BookStore.Application.Dtos.Rental;
using BookStore.Application.IService;
using BookStore.Application.IService.Rental;
using BookStore.Application.IService.System;
using BookStore.Application.DTOs.System.Notification;
using BookStore.Domain.Entities.Rental;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Rental;
using BookStore.Shared.Utilities;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Rental
{
    public class BookRentalService : IBookRentalService
    {
        private readonly IBookRentalRepository _rentalRepository;
        private readonly IRentalPlanRepository _planRepository;
        private readonly IBookRepository _bookRepository;
        private readonly IUserSubscriptionRepository _subscriptionRepository;
        private readonly IEbookService _ebookService;
        private readonly INotificationService _notificationService;
        private readonly ILogger<BookRentalService> _logger;

        public BookRentalService(
            IBookRentalRepository rentalRepository,
            IRentalPlanRepository planRepository,
            IBookRepository bookRepository,
            IUserSubscriptionRepository subscriptionRepository,
            IEbookService ebookService,
            INotificationService notificationService,
            ILogger<BookRentalService> logger)
        {
            _rentalRepository = rentalRepository;
            _planRepository = planRepository;
            _bookRepository = bookRepository;
            _subscriptionRepository = subscriptionRepository;
            _ebookService = ebookService;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<BookRentalResultDto> RentBookAsync(Guid userId, CreateBookRentalDto dto)
        {
            // Validate book exists
            var book = await _bookRepository.GetByIdAsync(dto.BookId);
            Guard.Against(book == null, $"Không tìm thấy sách với ID {dto.BookId}");

            // Validate rental plan exists
            var plan = await _planRepository.GetByIdAsync(dto.RentalPlanId);
            Guard.Against(plan == null, $"Không tìm thấy gói thuê với ID {dto.RentalPlanId}");
            Guard.Against(!plan!.IsActive, "Gói thuê này hiện không khả dụng");

            // Check if user already has active rental for this book
            var existingRental = await _rentalRepository.GetActiveRentalAsync(userId, dto.BookId);
            if (existingRental != null)
            {
                return new BookRentalResultDto
                {
                    Success = false,
                    Message = "Bạn đã thuê sách này rồi. Vui lòng gia hạn thay vì thuê mới."
                };
            }

            // TODO: Validate payment transaction code exists
            // var payment = await _paymentRepository.GetByTransactionCodeAsync(dto.PaymentTransactionCode);

            // Create rental
            var rental = new BookRental
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = dto.BookId,
                RentalPlanId = dto.RentalPlanId,
                StartDate = DateTime.UtcNow,
                EndDate = DateTime.UtcNow.AddDays(plan.DurationDays),
                Status = "Active",
                IsReturned = false,
                IsRenewed = false
            };

            // Create rental history before saving
            var history = new RentalHistory
            {
                Id = Guid.NewGuid(),
                BookRentalId = rental.Id,
                Action = "Rented",
                Note = $"Thuê sách với gói {plan.Name} ({plan.DurationDays} ngày)",
                CreatedAt = DateTime.UtcNow
            };

            rental.Histories.Add(history);
            
            await _rentalRepository.AddAsync(rental);
            await _rentalRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} rented book {dto.BookId} with plan {dto.RentalPlanId}");

            // Tạo thông báo thuê sách thành công
            _logger.LogInformation($"[BookRentalService] Creating rental notification for user {userId}...");
            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Thuê sách thành công",
                Message = $"Bạn đã thuê thành công sách '{book!.Title}' với gói {plan!.Name} ({plan.DurationDays} ngày). Hạn trả: {rental.EndDate:dd/MM/yyyy}",
                Type = "rental_success",
                Link = $"/rentals/{rental.Id}"
            });
            _logger.LogInformation($"[BookRentalService] ✅ Rental notification created for user {userId}");

            return new BookRentalResultDto
            {
                Success = true,
                Message = "Thuê sách thành công!",
                RentalId = rental.Id,
                BookTitle = book!.Title,
                PlanName = plan.Name,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                DurationDays = plan.DurationDays,
                Status = rental.Status
            };
        }

        public async Task<IEnumerable<BookRentalDto>> GetMyRentalsAsync(Guid userId, bool includeExpired = false)
        {
            var rentals = await _rentalRepository.GetByUserIdAsync(userId, includeExpired);
            return rentals.Select(MapToDto);
        }

        public async Task<BookRentalDto?> GetRentalByIdAsync(Guid rentalId)
        {
            var rental = await _rentalRepository.GetDetailByIdAsync(rentalId);
            return rental == null ? null : MapToDto(rental);
        }

        public async Task<BookRentalResultDto> RenewRentalAsync(Guid userId, Guid rentalId, RenewBookRentalDto dto)
        {
            var rental = await _rentalRepository.GetDetailByIdAsync(rentalId);
            Guard.Against(rental == null, "Không tìm thấy lượt thuê");
            Guard.Against(rental!.UserId != userId, "Bạn không có quyền gia hạn lượt thuê này");

            var plan = await _planRepository.GetByIdAsync(dto.RentalPlanId);
            Guard.Against(plan == null, "Không tìm thấy gói thuê");
            Guard.Against(!plan!.IsActive, "Gói thuê này hiện không khả dụng");

            // TODO: Validate payment

            // Extend end date
            var oldEndDate = rental.EndDate;
            rental.EndDate = rental.EndDate.AddDays(plan.DurationDays);
            rental.IsRenewed = true;
            rental.Status = "Active";

            // Add history
            var history = new RentalHistory
            {
                Id = Guid.NewGuid(),
                BookRentalId = rental.Id,
                Action = "Renewed",
                Note = $"Gia hạn thêm {plan.DurationDays} ngày. Từ {oldEndDate:yyyy-MM-dd} → {rental.EndDate:yyyy-MM-dd}",
                CreatedAt = DateTime.UtcNow
            };

            rental.Histories.Add(history);
            await _rentalRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} renewed rental {rentalId}");

            // Tạo thông báo gia hạn thành công
            _logger.LogInformation($"[BookRentalService] Creating renewal notification for user {userId}...");
            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Gia hạn thuê sách thành công",
                Message = $"Bạn đã gia hạn thành công thuê sách '{rental.Book.Title}' thêm {plan.DurationDays} ngày. Hạn trả mới: {rental.EndDate:dd/MM/yyyy}",
                Type = "rental_renewed",
                Link = $"/rentals/{rental.Id}"
            });
            _logger.LogInformation($"[BookRentalService] ✅ Renewal notification created for user {userId}");

            return new BookRentalResultDto
            {
                Success = true,
                Message = "Gia hạn thành công!",
                RentalId = rental.Id,
                BookTitle = rental.Book.Title,
                PlanName = plan.Name,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                Status = rental.Status
            };
        }

        public async Task<bool> ReturnBookAsync(Guid userId, Guid rentalId)
        {
            var rental = await _rentalRepository.GetByIdAsync(rentalId);
            Guard.Against(rental == null, "Không tìm thấy lượt thuê");
            Guard.Against(rental!.UserId != userId, "Bạn không có quyền trả sách này");

            rental.IsReturned = true;
            rental.Status = "Returned";

            var history = new RentalHistory
            {
                Id = Guid.NewGuid(),
                BookRentalId = rental.Id,
                Action = "Returned",
                Note = "Trả sách sớm",
                CreatedAt = DateTime.UtcNow
            };

            rental.Histories.Add(history);
            await _rentalRepository.SaveChangesAsync();

            _logger.LogInformation($"User {userId} returned book rental {rentalId}");
            
            // Tạo thông báo trả sách
            _logger.LogInformation($"[BookRentalService] Creating return notification for user {userId}...");
            await _notificationService.CreateNotificationAsync(new CreateNotificationDto
            {
                UserId = userId,
                Title = "Trả sách thành công",
                Message = $"Bạn đã trả sách thuê thành công. Cảm ơn bạn đã sử dụng dịch vụ!",
                Type = "rental_returned",
                Link = $"/rentals/{rentalId}"
            });
            _logger.LogInformation($"[BookRentalService] ✅ Return notification created for user {userId}");
            
            return true;
        }

        public async Task<CheckBookAccessDto> CheckBookAccessAsync(Guid userId, Guid bookId)
        {
            // Check rental first
            var rental = await _rentalRepository.GetActiveRentalAsync(userId, bookId);
            if (rental != null)
            {
                return new CheckBookAccessDto
                {
                    CanAccess = true,
                    Reason = "Bạn đã thuê sách này",
                    RentalId = rental.Id,
                    ExpiryDate = rental.EndDate,
                    DaysRemaining = (rental.EndDate - DateTime.UtcNow).Days,
                    AccessType = "Rental"
                };
            }

            // Check subscription
            var subscription = await _subscriptionRepository.GetActiveSubscriptionByUserIdAsync(userId);
            if (subscription != null)
            {
                return new CheckBookAccessDto
                {
                    CanAccess = true,
                    Reason = "Bạn có gói subscription đang hoạt động",
                    ExpiryDate = subscription.EndDate,
                    DaysRemaining = (subscription.EndDate - DateTime.UtcNow).Days,
                    AccessType = "Subscription"
                };
            }

            return new CheckBookAccessDto
            {
                CanAccess = false,
                Reason = "Bạn chưa thuê sách này hoặc chưa có gói subscription",
                AccessType = null
            };
        }

        public async Task<EbookAccessDto> GetRentalAccessLinkAsync(Guid userId, Guid bookId)
        {
            var accessCheck = await CheckBookAccessAsync(userId, bookId);
            Guard.Against(!accessCheck.CanAccess, accessCheck.Reason);

            // Use ebook service to get access link
            return await _ebookService.GetEbookAccessLinkAsync(userId, bookId);
        }

        public async Task<IEnumerable<BookRentalDto>> GetAllRentalsAsync()
        {
            var rentals = await _rentalRepository.GetAllAsync();
            return rentals.Select(MapToDto);
        }

        public async Task<IEnumerable<BookRentalDto>> GetRentalsByUserAsync(Guid userId)
        {
            var rentals = await _rentalRepository.GetByUserIdAsync(userId, includeExpired: true);
            return rentals.Select(MapToDto);
        }

        public async Task<IEnumerable<BookRentalDto>> GetRentalsByBookAsync(Guid bookId)
        {
            var rentals = await _rentalRepository.GetByBookIdAsync(bookId);
            return rentals.Select(MapToDto);
        }

        public async Task CancelRentalAsync(Guid rentalId)
        {
            var rental = await _rentalRepository.GetDetailByIdAsync(rentalId);
            Guard.Against(rental == null, "Không tìm thấy lượt thuê");

            rental!.Status = "Cancelled";
            rental.IsReturned = true;

            var history = new RentalHistory
            {
                Id = Guid.NewGuid(),
                BookRentalId = rental.Id,
                Action = "Cancelled",
                Note = "Hủy bởi Admin",
                CreatedAt = DateTime.UtcNow
            };

            rental.Histories.Add(history);
            await _rentalRepository.SaveChangesAsync();

            _logger.LogInformation($"Admin cancelled rental {rentalId}");
        }

        public async Task UpdateExpiredRentalsAsync()
        {
            var expiredRentals = await _rentalRepository.GetExpiredRentalsAsync();

            foreach (var rental in expiredRentals)
            {
                rental.Status = "Expired";
                rental.IsReturned = true;

                var history = new RentalHistory
                {
                    Id = Guid.NewGuid(),
                    BookRentalId = rental.Id,
                    Action = "Expired",
                    Note = "Hết hạn tự động",
                    CreatedAt = DateTime.UtcNow
                };

                rental.Histories.Add(history);
            }

            await _rentalRepository.SaveChangesAsync();
            _logger.LogInformation($"Updated {expiredRentals.Count()} expired rentals");
        }

        private BookRentalDto MapToDto(BookRental rental)
        {
            return new BookRentalDto
            {
                Id = rental.Id,
                UserId = rental.UserId,
                UserEmail = rental.User?.Email ?? "N/A",
                BookId = rental.BookId,
                BookTitle = rental.Book?.Title ?? "N/A",
                BookISBN = rental.Book?.ISBN?.Value,
                BookCoverImage = rental.Book?.Images?.FirstOrDefault()?.ImageUrl,
                RentalPlanId = rental.RentalPlanId,
                RentalPlanName = rental.RentalPlan?.Name ?? "N/A",
                DurationDays = rental.RentalPlan?.DurationDays ?? 0,
                Price = rental.RentalPlan?.Price ?? 0,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                IsReturned = rental.IsReturned,
                IsRenewed = rental.IsRenewed,
                Status = rental.Status ?? "Unknown"
            };
        }
    }
}
