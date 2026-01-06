using BookStore.Application.DTOs.Catalog.Review;
using BookStore.Application.IService.Review;
using BookStore.Domain.Entities.Common;
using BookStore.Domain.Entities.Ordering;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Review;
using Microsoft.Extensions.Logging;

namespace BookStore.Application.Services.Review
{
    public class ReviewService : IReviewService
    {
        private readonly IReviewRepository _reviewRepository;
        private readonly IBookRepository _bookRepository;
        private readonly ILogger<ReviewService> _logger;

        public ReviewService(
            IReviewRepository reviewRepository,
            IBookRepository bookRepository,
            ILogger<ReviewService> logger)
        {
            _reviewRepository = reviewRepository;
            _bookRepository = bookRepository;
            _logger = logger;
        }

        public async Task<ReviewDto> CreateReviewAsync(Guid userId, Guid bookId, CreateReviewDto dto)
        {
            _logger.LogInformation($"[CreateReview] Starting review creation - UserId: {userId}, BookId: {bookId}");
            
            // 1. Check if book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
            {
                _logger.LogWarning($"[CreateReview] Book not found - BookId: {bookId}");
                throw new InvalidOperationException("Book not found");
            }
            
            _logger.LogInformation($"[CreateReview] Book found - Title: {book.Title}");

            // 2. Check if user has purchased this book
            var hasPurchased = await _reviewRepository.HasUserPurchasedBookAsync(userId, bookId);
            _logger.LogInformation($"[CreateReview] Purchase check - HasPurchased: {hasPurchased}");
            
            if (!hasPurchased)
            {
                _logger.LogWarning($"[CreateReview] User has not purchased book - UserId: {userId}, BookId: {bookId}");
                throw new InvalidOperationException("You can only review books you have purchased");
            }

            // 3. Check if user has already reviewed this book (Approved or Pending)
            var existingReview = await _reviewRepository.GetUserReviewForBookAsync(userId, bookId);
            if (existingReview != null)
            {
                if (existingReview.Status == "Approved")
                    throw new InvalidOperationException("You have already reviewed this book. Use update endpoint to modify your review.");
                
                if (existingReview.Status == "Pending")
                    throw new InvalidOperationException("Your review is pending approval. Use update endpoint to modify it.");

                // If status is Rejected, allow creating new review by deleting the old one
                if (existingReview.Status == "Rejected")
                {
                    _logger.LogInformation($"[CreateReview] Deleting rejected review {existingReview.Id} to allow new submission");
                    existingReview.IsDeleted = true;
                    _reviewRepository.Update(existingReview);
                    await _reviewRepository.SaveChangesAsync();
                }
            }

            // 4. Create review
            var review = new Domain.Entities.Common.Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = bookId,
                OrderId = null,
                Rating = dto.Rating,
                Title = dto.Title,
                Content = dto.Content,
                Status = "Approved",
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            _logger.LogInformation("User {UserId} created review {ReviewId} for book {BookId}", 
                userId, review.Id, bookId);

            return await MapToReviewDto(review);
        }

        public async Task<ReviewDto> CreateQuickRatingAsync(Guid userId, Guid bookId, QuickRatingDto dto)
        {
            // 1. Check if book exists
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            // 2. Check if user has purchased this book
            var hasPurchased = await _reviewRepository.HasUserPurchasedBookAsync(userId, bookId);
            if (!hasPurchased)
                throw new InvalidOperationException("You can only rate books you have purchased");

            // 3. Check if user has already reviewed this book
            var hasReviewed = await _reviewRepository.HasUserReviewedBookAsync(userId, bookId);
            if (hasReviewed)
                throw new InvalidOperationException("You have already rated this book");

            // 4. Create minimal review with only rating
            var review = new Domain.Entities.Common.Review
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                BookId = bookId,
                OrderId = null,
                Rating = dto.Rating,
                Title = null,
                Content = $"Quick rating: {dto.Rating} stars", // Minimal content for quick rating
                Status = "Approved", // Auto-approve quick ratings as they have no text content
                IsVerifiedPurchase = true,
                CreatedAt = DateTime.UtcNow,
                ApprovedAt = DateTime.UtcNow,
                ApprovedBy = null // System auto-approved
            };

            await _reviewRepository.AddAsync(review);
            await _reviewRepository.SaveChangesAsync();

            // Update book statistics immediately since it's auto-approved
            await UpdateBookStatisticsAsync(bookId);

            _logger.LogInformation("User {UserId} created quick rating {ReviewId} ({Rating} stars) for book {BookId}", 
                userId, review.Id, dto.Rating, bookId);

            return await MapToReviewDto(review);
        }

        public async Task<(IEnumerable<ReviewListDto> Reviews, int TotalCount)> GetBookReviewsAsync(
            Guid bookId, int page, int pageSize, string? sortBy = null)
        {
            var reviews = await _reviewRepository.GetApprovedReviewsByBookIdAsync(bookId, page, pageSize, sortBy);
            var totalCount = await _reviewRepository.GetTotalReviewsCountByBookIdAsync(bookId, approvedOnly: true);

            var reviewDtos = reviews.Select(r => new ReviewListDto
            {
                Id = r.Id,
                UserId = r.UserId,
                UserName = r.User?.Profiles?.FullName ?? "Anonymous",
                Rating = r.Rating,
                Title = r.Title,
                Content = r.Content,
                IsVerifiedPurchase = r.IsVerifiedPurchase,
                CreatedAt = r.CreatedAt
            });

            return (reviewDtos, totalCount);
        }

        public async Task<ReviewStatisticsDto> GetBookReviewStatisticsAsync(Guid bookId)
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                throw new InvalidOperationException("Book not found");

            var distribution = await _reviewRepository.GetRatingDistributionAsync(bookId);

            return new ReviewStatisticsDto
            {
                AverageRating = book.AverageRating,
                TotalReviews = book.TotalReviews,
                RatingDistribution = distribution
            };
        }

        public async Task<ReviewDto?> GetReviewByIdAsync(Guid id)
        {
            var review = await _reviewRepository.GetByIdWithDetailsAsync(id);
            if (review == null)
                return null;

            return await MapToReviewDto(review);
        }

        public async Task<ReviewDto> ApproveReviewAsync(Guid id, Guid approvedBy)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
                throw new InvalidOperationException("Review not found");

            if (review.Status == "Approved")
                throw new InvalidOperationException("Review is already approved");

            review.Status = "Approved";
            review.ApprovedAt = DateTime.UtcNow;
            review.ApprovedBy = approvedBy;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();

            // Update book statistics
            await UpdateBookStatisticsAsync(review.BookId);

            _logger.LogInformation("Review {ReviewId} approved by {AdminId}", id, approvedBy);

            return await MapToReviewDto(review);
        }

        public async Task<ReviewDto> RejectReviewAsync(Guid id, string? reason)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
                throw new InvalidOperationException("Review not found");

            review.Status = "Rejected";
            review.UpdatedAt = DateTime.UtcNow;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();

            _logger.LogInformation("Review {ReviewId} rejected. Reason: {Reason}", id, reason);

            return await MapToReviewDto(review);
        }

        public async Task DeleteReviewAsync(Guid id)
        {
            var review = await _reviewRepository.GetByIdAsync(id);
            if (review == null)
                throw new InvalidOperationException("Review not found");

            var wasApproved = review.Status == "Approved";
            var bookId = review.BookId;

            review.IsDeleted = true;
            review.UpdatedAt = DateTime.UtcNow;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();

            // Update book statistics if review was approved
            if (wasApproved)
            {
                await UpdateBookStatisticsAsync(bookId);
            }

            _logger.LogInformation("Review {ReviewId} deleted", id);
        }

        public async Task DeleteUserReviewAsync(Guid userId, Guid bookId)
        {
            var review = await _reviewRepository.GetUserReviewForBookAsync(userId, bookId);
            if (review == null)
                throw new InvalidOperationException("You have not reviewed this book yet");

            var wasApproved = review.Status == "Approved";

            review.IsDeleted = true;
            review.UpdatedAt = DateTime.UtcNow;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();

            // Update book statistics if review was approved
            if (wasApproved)
            {
                await UpdateBookStatisticsAsync(bookId);
            }

            _logger.LogInformation("User {UserId} deleted their review {ReviewId} for book {BookId}", 
                userId, review.Id, bookId);
        }

        public async Task<(IEnumerable<ReviewDto> Reviews, int TotalCount)> GetPendingReviewsAsync(int page, int pageSize)
        {
            var reviews = await _reviewRepository.GetPendingReviewsAsync(page, pageSize);
            var totalCount = await _reviewRepository.GetPendingReviewsCountAsync();

            var reviewDtos = new List<ReviewDto>();
            foreach (var review in reviews)
            {
                reviewDtos.Add(await MapToReviewDto(review));
            }

            return (reviewDtos, totalCount);
        }

        private async Task UpdateBookStatisticsAsync(Guid bookId)
        {
            var book = await _bookRepository.GetByIdAsync(bookId);
            if (book == null)
                return;

            // Only get reviews for this specific book (optimized)
            var totalReviews = await _reviewRepository.GetTotalReviewsCountByBookIdAsync(bookId, approvedOnly: true);
            var distribution = await _reviewRepository.GetRatingDistributionAsync(bookId);

            // Calculate average from distribution
            decimal totalRating = 0;
            int totalCount = 0;
            foreach (var item in distribution)
            {
                totalRating += item.Key * item.Value;
                totalCount += item.Value;
            }

            book.TotalReviews = totalCount;
            book.AverageRating = totalCount > 0 ? Math.Round(totalRating / totalCount, 2) : 0;

            _bookRepository.Update(book);
            await _bookRepository.SaveChangesAsync();

            _logger.LogInformation("Updated statistics for book {BookId}: {TotalReviews} reviews, {AverageRating} avg rating",
                bookId, book.TotalReviews, book.AverageRating);
        }

        private async Task<ReviewDto> MapToReviewDto(Domain.Entities.Common.Review review)
        {
            // Load related entities if not loaded
            if (review.User == null || review.Book == null)
            {
                review = await _reviewRepository.GetByIdWithDetailsAsync(review.Id) 
                    ?? throw new InvalidOperationException("Review not found");
            }

            return new ReviewDto
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = review.User?.Profiles?.FullName ?? "Anonymous",
                BookId = review.BookId,
                BookTitle = review.Book?.Title ?? "",
                OrderId = review.OrderId,
                Rating = review.Rating,
                Title = review.Title,
                Content = review.Content,
                Status = review.Status,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                IsEdited = review.IsEdited,
                CreatedAt = review.CreatedAt,
                UpdatedAt = review.UpdatedAt,
                ApprovedAt = review.ApprovedAt
            };
        }

        public async Task<ReviewDto> UpdateReviewAsync(Guid userId, Guid bookId, UpdateReviewDto dto)
        {
            var review = await _reviewRepository.GetUserReviewForBookAsync(userId, bookId);
            if (review == null)
                throw new InvalidOperationException("You have not reviewed this book yet");

            // Only allow updating Pending or Rejected reviews
            if (review.Status == "Approved")
                throw new InvalidOperationException("Cannot update an approved review. Please delete and create a new one.");

            review.Rating = dto.Rating;
            review.Title = dto.Title;
            review.Content = dto.Content;
            review.Status = "Pending"; // Reset to Pending after update
            review.IsEdited = true;
            review.UpdatedAt = DateTime.UtcNow;

            _reviewRepository.Update(review);
            await _reviewRepository.SaveChangesAsync();

            _logger.LogInformation("User {UserId} updated review {ReviewId} for book {BookId}", 
                userId, review.Id, bookId);

            return await MapToReviewDto(review);
        }

        public async Task<ReviewDto?> GetUserReviewForBookAsync(Guid userId, Guid bookId)
        {
            var review = await _reviewRepository.GetUserReviewForBookAsync(userId, bookId);
            if (review == null)
                return null;

            return await MapToReviewDto(review);
        }

        public async Task<object> GetReviewEligibilityDebugAsync(Guid userId, Guid bookId)
        {
            var hasPurchased = await _reviewRepository.HasUserPurchasedBookAsync(userId, bookId);
            var hasReviewed = await _reviewRepository.HasUserReviewedBookAsync(userId, bookId);
            var existingReview = await _reviewRepository.GetUserReviewForBookAsync(userId, bookId);
            var book = await _bookRepository.GetByIdAsync(bookId);

            return new
            {
                UserId = userId,
                BookId = bookId,
                BookExists = book != null,
                BookTitle = book?.Title,
                HasPurchased = hasPurchased,
                HasReviewed = hasReviewed,
                ExistingReview = existingReview != null ? new
                {
                    ReviewId = existingReview.Id,
                    Status = existingReview.Status,
                    Rating = existingReview.Rating,
                    CreatedAt = existingReview.CreatedAt
                } : null,
                CanCreateNew = book != null && hasPurchased && !hasReviewed,
                CanUpdate = existingReview != null && existingReview.Status != "Approved",
                Message = book == null ? "Book not found" :
                         !hasPurchased ? "User has not purchased this book" :
                         hasReviewed ? $"User already has a review (Status: {existingReview?.Status})" :
                         "User can review this book"
            };
        }
    }
}
