using BookStore.Application.DTOs.Catalog.Review;
using BookEntity = BookStore.Domain.Entities.Catalog.Book;
using ReviewEntity = BookStore.Domain.Entities.Common.Review;

namespace BookStore.Application.Mappers.Review
{
    public static class ReviewMapper
    {
        public static ReviewDto ToDto(this ReviewEntity review)
        {
            return new ReviewDto
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = review.User?.Profiles?.FullName ?? "Anonymous",
                BookId = review.BookId,
                BookTitle = review.Book?.Title ?? string.Empty,
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

        public static ReviewListDto ToListDto(this ReviewEntity review)
        {
            return new ReviewListDto
            {
                Id = review.Id,
                UserId = review.UserId,
                UserName = review.User?.Profiles?.FullName ?? "Anonymous",
                Rating = review.Rating,
                Title = review.Title,
                Content = review.Content,
                IsVerifiedPurchase = review.IsVerifiedPurchase,
                CreatedAt = review.CreatedAt
            };
        }

        public static IEnumerable<ReviewListDto> ToListDtos(this IEnumerable<ReviewEntity> reviews)
        {
            return reviews.Select(review => review.ToListDto());
        }

        public static ReviewStatisticsDto ToReviewStatisticsDto(
            this BookEntity book,
            Dictionary<int, int> ratingDistribution)
        {
            return new ReviewStatisticsDto
            {
                AverageRating = book.AverageRating,
                TotalReviews = book.TotalReviews,
                RatingDistribution = ratingDistribution
            };
        }

        public static ReviewEligibilityDebugDto ToEligibilityDebugDto(
            Guid userId,
            Guid bookId,
            bool hasPurchased,
            bool hasReviewed,
            ReviewEntity? existingReview,
            BookEntity? book)
        {
            return new ReviewEligibilityDebugDto
            {
                UserId = userId,
                BookId = bookId,
                BookExists = book != null,
                BookTitle = book?.Title,
                HasPurchased = hasPurchased,
                HasReviewed = hasReviewed,
                ExistingReview = existingReview == null
                    ? null
                    : new ExistingReviewDebugDto
                    {
                        ReviewId = existingReview.Id,
                        Status = existingReview.Status,
                        Rating = existingReview.Rating,
                        CreatedAt = existingReview.CreatedAt
                    },
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
