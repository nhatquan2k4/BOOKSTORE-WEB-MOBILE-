using System;
using System.Collections.Generic;

namespace BookStore.Application.DTOs.ChatBot
{

    public class CachedBookDto
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public decimal? Price { get; set; }
        public string? Currency { get; set; }
        public List<string> Authors { get; set; } = new();
        public List<string> Categories { get; set; } = new();
        public string? Publisher { get; set; }
        public int? PublicationYear { get; set; }
        public string? Isbn { get; set; }
        public int? PageCount { get; set; }
        public string? Language { get; set; }
        public int StockQuantity { get; set; }
        public string? ImageUrl { get; set; }

        // Search optimization fields
        public string SearchText { get; set; } = string.Empty; // Combines title + authors + description for faster search
    }
}
