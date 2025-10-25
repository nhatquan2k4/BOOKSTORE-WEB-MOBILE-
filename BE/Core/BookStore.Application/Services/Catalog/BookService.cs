using BookStore.Application.DTOs.Catalog.Book;
using BookStore.Application.DTOs.Catalog.Author;
using BookStore.Application.DTOs.Catalog.Category;
using BookStore.Application.DTOs.Catalog.Publisher;
using BookStore.Application.Interfaces.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.ValueObjects;
using BookStore.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using BookStore.Application.Mappers.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookService : IBookService
    {
        private readonly AppDbContext _context;

        public BookService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(List<BookDto> Items, int TotalCount)> GetAllAsync(
            int pageNumber = 1,
            int pageSize = 10,
            string? searchTerm = null,
            Guid? categoryId = null,
            Guid? authorId = null,
            Guid? publisherId = null,
            bool? isAvailable = null)
        {
            var query = _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .AsQueryable();

            // Filters
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(b => b.Title.Contains(searchTerm) ||
                                        b.ISBN.Value.Contains(searchTerm));
            }

            if (categoryId.HasValue)
            {
                query = query.Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId.Value));
            }

            if (authorId.HasValue)
            {
                query = query.Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId.Value));
            }

            if (publisherId.HasValue)
            {
                query = query.Where(b => b.PublisherId == publisherId.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(b => b.IsAvailable == isAvailable.Value);
            }

            var totalCount = await query.CountAsync();

            var books = await query
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN.Value,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    PageCount = b.PageCount,
                    IsAvailable = b.IsAvailable,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher.Name,
                    BookFormatId = b.BookFormatId,
                    BookFormatName = b.BookFormat != null ? b.BookFormat.FormatType : null,
                    AuthorNames = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    CategoryNames = b.BookCategories.Select(bc => bc.Category.Name).ToList()
                })
                .ToListAsync();

            return (books, totalCount);
        }

        public async Task<BookDetailDto?> GetByIdAsync(Guid id)
        {
            var book = await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Include(b => b.Images)
                .Include(b => b.Files)
                .Include(b => b.Metadata)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (book == null) return null;

            return book.ToDetailDto();
        }

        public async Task<BookDetailDto?> GetByISBNAsync(string isbn)
        {
            var book = await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Include(b => b.Images)
                .Include(b => b.Files)
                .Include(b => b.Metadata)
                .FirstOrDefaultAsync(b => b.ISBN.Value == isbn);

            if (book == null) return null;

            return book.ToDetailDto();
        }

        public async Task<bool> IsISBNExistsAsync(string isbn, Guid? excludeBookId = null)
        {
            var query = _context.Books.Where(b => b.ISBN.Value == isbn);

            if (excludeBookId.HasValue)
            {
                query = query.Where(b => b.Id != excludeBookId.Value);
            }

            return await query.AnyAsync();
        }


        public async Task<BookDetailDto> CreateAsync(CreateBookDto dto)
        {
            // Validate ISBN
            if (await IsISBNExistsAsync(dto.ISBN))
            {
                throw new InvalidOperationException($"ISBN {dto.ISBN} đã tồn tại");
            }

            // Validate Publisher exists
            var publisherExists = await _context.Publishers.AnyAsync(p => p.Id == dto.PublisherId);
            if (!publisherExists)
            {
                throw new InvalidOperationException("Nhà xuất bản không tồn tại");
            }

            // Validate BookFormat exists (if provided)
            if (dto.BookFormatId.HasValue)
            {
                var formatExists = await _context.BookFormats.AnyAsync(f => f.Id == dto.BookFormatId.Value);
                if (!formatExists)
                {
                    throw new InvalidOperationException("Định dạng sách không tồn tại");
                }
            }

            // Create Book
            var book = new Book
            {
                Id = Guid.NewGuid(),
                Title = dto.Title,
                ISBN = new ISBN(dto.ISBN),
                Description = dto.Description,
                PublicationYear = dto.PublicationYear,
                Language = dto.Language,
                Edition = dto.Edition,
                PageCount = dto.PageCount,
                IsAvailable = dto.IsAvailable,
                PublisherId = dto.PublisherId,
                BookFormatId = dto.BookFormatId
            };

            _context.Books.Add(book);

            // Add Authors (many-to-many)
            if (dto.AuthorIds.Any())
            {
                foreach (var authorId in dto.AuthorIds)
                {
                    var authorExists = await _context.Authors.AnyAsync(a => a.Id == authorId);
                    if (!authorExists) continue;

                    _context.BookAuthors.Add(new BookAuthor
                    {
                        BookId = book.Id,
                        AuthorId = authorId
                    });
                }
            }

            // Add Categories (many-to-many)
            if (dto.CategoryIds.Any())
            {
                foreach (var categoryId in dto.CategoryIds)
                {
                    var categoryExists = await _context.Categories.AnyAsync(c => c.Id == categoryId);
                    if (!categoryExists) continue;

                    _context.BookCategories.Add(new BookCategory
                    {
                        BookId = book.Id,
                        CategoryId = categoryId
                    });
                }
            }

            await _context.SaveChangesAsync();

            return (await GetByIdAsync(book.Id))!;
        }

        public async Task<BookDetailDto> UpdateAsync(UpdateBookDto dto)
        {
            var book = await _context.Books
                .Include(b => b.BookAuthors)
                .Include(b => b.BookCategories)
                .FirstOrDefaultAsync(b => b.Id == dto.Id);

            if (book == null)
            {
                throw new InvalidOperationException("Sách không tồn tại");
            }

            // Validate ISBN (exclude current book)
            if (await IsISBNExistsAsync(dto.ISBN, dto.Id))
            {
                throw new InvalidOperationException($"ISBN {dto.ISBN} đã được sử dụng bởi sách khác");
            }

            // Update properties
            book.Title = dto.Title;
            book.ISBN = new ISBN(dto.ISBN);
            book.Description = dto.Description;
            book.PublicationYear = dto.PublicationYear;
            book.Language = dto.Language;
            book.Edition = dto.Edition;
            book.PageCount = dto.PageCount;
            book.IsAvailable = dto.IsAvailable;
            book.PublisherId = dto.PublisherId;
            book.BookFormatId = dto.BookFormatId;

            // Update Authors
            _context.BookAuthors.RemoveRange(book.BookAuthors);
            foreach (var authorId in dto.AuthorIds)
            {
                _context.BookAuthors.Add(new BookAuthor
                {
                    BookId = book.Id,
                    AuthorId = authorId
                });
            }

            // Update Categories
            _context.BookCategories.RemoveRange(book.BookCategories);
            foreach (var categoryId in dto.CategoryIds)
            {
                _context.BookCategories.Add(new BookCategory
                {
                    BookId = book.Id,
                    CategoryId = categoryId
                });
            }

            await _context.SaveChangesAsync();

            return (await GetByIdAsync(book.Id))!;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            // Hard delete (vì IBookService không có soft delete)
            _context.Books.Remove(book);
            await _context.SaveChangesAsync();

            return true;
        }

        // ===== BUSINESS METHODS =====

        public async Task<bool> UpdateAvailabilityAsync(Guid id, bool isAvailable)
        {
            var book = await _context.Books.FindAsync(id);
            if (book == null) return false;

            book.IsAvailable = isAvailable;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<List<BookDto>> GetByCategoryAsync(Guid categoryId, int top = 10)
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Where(b => b.BookCategories.Any(bc => bc.CategoryId == categoryId) && b.IsAvailable)
                .Take(top)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN.Value,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    PageCount = b.PageCount,
                    IsAvailable = b.IsAvailable,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher.Name,
                    BookFormatId = b.BookFormatId,
                    BookFormatName = b.BookFormat != null ? b.BookFormat.FormatType : null,
                    AuthorNames = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    CategoryNames = b.BookCategories.Select(bc => bc.Category.Name).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<BookDto>> GetByAuthorAsync(Guid authorId, int top = 10)
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Where(b => b.BookAuthors.Any(ba => ba.AuthorId == authorId) && b.IsAvailable)
                .Take(top)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN.Value,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    PageCount = b.PageCount,
                    IsAvailable = b.IsAvailable,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher.Name,
                    BookFormatId = b.BookFormatId,
                    BookFormatName = b.BookFormat != null ? b.BookFormat.FormatType : null,
                    AuthorNames = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    CategoryNames = b.BookCategories.Select(bc => bc.Category.Name).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<BookDto>> GetByPublisherAsync(Guid publisherId, int top = 10)
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Where(b => b.PublisherId == publisherId && b.IsAvailable)
                .Take(top)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN.Value,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    PageCount = b.PageCount,
                    IsAvailable = b.IsAvailable,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher.Name,
                    BookFormatId = b.BookFormatId,
                    BookFormatName = b.BookFormat != null ? b.BookFormat.FormatType : null,
                    AuthorNames = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    CategoryNames = b.BookCategories.Select(bc => bc.Category.Name).ToList()
                })
                .ToListAsync();
        }

        public async Task<List<BookDto>> SearchAsync(string searchTerm, int top = 20)
        {
            return await _context.Books
                .Include(b => b.Publisher)
                .Include(b => b.BookFormat)
                .Include(b => b.BookAuthors).ThenInclude(ba => ba.Author)
                .Include(b => b.BookCategories).ThenInclude(bc => bc.Category)
                .Where(b => (b.Title.Contains(searchTerm) || b.ISBN.Value.Contains(searchTerm)) && b.IsAvailable)
                .Take(top)
                .Select(b => new BookDto
                {
                    Id = b.Id,
                    Title = b.Title,
                    ISBN = b.ISBN.Value,
                    PublicationYear = b.PublicationYear,
                    Language = b.Language,
                    PageCount = b.PageCount,
                    IsAvailable = b.IsAvailable,
                    PublisherId = b.PublisherId,
                    PublisherName = b.Publisher.Name,
                    BookFormatId = b.BookFormatId,
                    BookFormatName = b.BookFormat != null ? b.BookFormat.FormatType : null,
                    AuthorNames = b.BookAuthors.Select(ba => ba.Author.Name).ToList(),
                    CategoryNames = b.BookCategories.Select(bc => bc.Category.Name).ToList()
                })
                .ToListAsync();
        }
    }
}