using System.ComponentModel.DataAnnotations;

namespace BookStore.Application.DTOs.Catalog.Review
{
    public class CreateReviewDto
    {
        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [MinLength(10, ErrorMessage = "Content must be at least 10 characters")]
        [MaxLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; } = null!;
    }

    public class ReviewDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public Guid BookId { get; set; }
        public string BookTitle { get; set; } = string.Empty;
        public Guid? OrderId { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string Content { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public bool IsVerifiedPurchase { get; set; }
        public bool IsEdited { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public DateTime? ApprovedAt { get; set; }
    }

    public class ReviewListDto
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string Content { get; set; } = string.Empty;
        public bool IsVerifiedPurchase { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class UpdateReviewDto
    {
        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
        public string? Title { get; set; }

        [Required(ErrorMessage = "Content is required")]
        [MinLength(10, ErrorMessage = "Content must be at least 10 characters")]
        [MaxLength(2000, ErrorMessage = "Content cannot exceed 2000 characters")]
        public string Content { get; set; } = null!;
    }

    public class QuickRatingDto
    {
        [Required(ErrorMessage = "Rating is required")]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }
    }

    public class UpdateReviewStatusDto
    {
        public string? Reason { get; set; }
    }

    public class ReviewStatisticsDto
    {
        public decimal AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public Dictionary<int, int> RatingDistribution { get; set; } = new();
    }

    public class ReviewEligibilityDebugDto
    {
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
        public bool BookExists { get; set; }
        public string? BookTitle { get; set; }
        public bool HasPurchased { get; set; }
        public bool HasReviewed { get; set; }
        public ExistingReviewDebugDto? ExistingReview { get; set; }
        public bool CanCreateNew { get; set; }
        public bool CanUpdate { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    public class ExistingReviewDebugDto
    {
        public Guid ReviewId { get; set; }
        public string Status { get; set; } = string.Empty;
        public int Rating { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
