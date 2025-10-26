﻿namespace BookStore.Application.DTOs.Catalog.Category
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        public Guid ParentId { get; set; }
    }
}