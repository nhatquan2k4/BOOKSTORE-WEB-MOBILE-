using System;

namespace BookStore.Application.DTOs.ChatBot
{
    public class CachedCategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int BookCount { get; set; }
    }
}
