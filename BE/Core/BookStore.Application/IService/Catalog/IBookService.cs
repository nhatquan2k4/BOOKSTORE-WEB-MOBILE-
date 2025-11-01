﻿using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService;

namespace BookStore.Application.IService.Catalog
{
    public interface IBookService : IGenericService<BookDto, CreateBookDto, UpdateBookDto>
    {
        // Override methods to return BookDetailDto
        new Task<BookDetailDto?> GetByIdAsync(Guid id);
        new Task<BookDetailDto> AddAsync(CreateBookDto dto);
        new Task<BookDetailDto> UpdateAsync(UpdateBookDto dto);

        // Custom GetAllAsync with pagination and filters
        Task<(List<BookDto> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null);

        // Specific queries
        Task<BookDetailDto?> GetByISBNAsync(string isbn);
        Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null);
        Task<bool> UpdateAvailabilityAsync(Guid id, bool isAvailable);
        Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10);
        Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10);
        Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10);
        Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20);
    }
}