using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStore.Application.Dtos.Catalog.Author;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Dtos.Catalog.Publisher;

namespace BookStore.Application.Dtos.Catalog.Book
{
    public class BookDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public int PublicationYear { get; set; }
        public string Language { get; set; } = string.Empty;
        public int PageCount { get; set; }
        public bool IsAvailable { get; set; }

        // Publisher (chỉ lấy tên)
        public Guid PublisherId { get; set; }
        public string PublisherName { get; set; } = string.Empty;

        // Format (chỉ lấy tên)
        public Guid? BookFormatId { get; set; }
        public string? BookFormatName { get; set; }

        // Authors (danh sách tên)
        public List<string> AuthorNames { get; set; } = new();

        // Categories (danh sách tên)
        public List<string> CategoryNames { get; set; } = new();

        // Pricing (từ Prices collection)
        public decimal? CurrentPrice { get; set; }
        public decimal? DiscountPrice { get; set; }

        // Stock
        public int? StockQuantity { get; set; }

        // Review summary
        public double? AverageRating { get; set; }
        public int TotalReviews { get; set; }
    }
}