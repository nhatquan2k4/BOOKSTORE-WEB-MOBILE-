using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.BookImages;
using BookStore.Application.Mappers.Catalog;
using BookStore.Application.Mappers.Catalog.Author;
using BookStore.Application.Mappers.Catalog.Category;
using BookStore.Application.Mappers.Catalog.Publisher;
using BookStore.Application.Mappers.Catalog.BookImages;
using BookStore.Domain.ValueObjects;
using BookEntity = BookStore.Domain.Entities.Catalog.Book;

namespace BookStore.Application.Mappers.Catalog.Book
{

    public static class BookMapper
    {

        public static BookDto ToDto(this BookEntity book)
        {
            return new BookDto
            {
                Id = book.Id,
                Title = book.Title ?? string.Empty,
                ISBN = book.ISBN?.Value ?? string.Empty,
                PublicationYear = book.PublicationYear,
                Language = book.Language ?? string.Empty,
                PageCount = book.PageCount,
                IsAvailable = book.IsAvailable,
                PublisherId = book.PublisherId,
                PublisherName = book.Publisher?.Name ?? string.Empty,
                BookFormatId = book.BookFormatId,
                BookFormatName = book.BookFormat?.FormatType ?? string.Empty,

                AuthorNames = book.BookAuthors?
                    .Where(ba => ba?.Author != null)
                    .Select(ba => ba!.Author.Name)
                    .ToList() ?? new List<string>(),

                CategoryNames = book.BookCategories?
                    .Where(bc => bc?.Category != null)
                    .Select(bc => bc!.Category.Name)
                    .ToList() ?? new List<string>(),

                CurrentPrice = book.GetCurrentPriceAmount(),
                DiscountPrice = book.GetCurrentDiscountPriceAmount(),

                // Stock Quantity (sum across all warehouses)
                StockQuantity = book.StockItems?.Sum(s => s.QuantityOnHand) ?? 0,

                // Reviews (TODO: Calculate from Reviews when schema is fixed)
                AverageRating = null,
                TotalReviews = 0,

                // Cover Image
                CoverImage = book.Images?
                    .Where(img => img.IsCover)
                    .OrderBy(img => img.DisplayOrder)
                    .FirstOrDefault()?.ImageUrl
            };
        }
        public static BookDetailDto ToDetailDto(this BookEntity book)
        {
            return new BookDetailDto
            {
                Id = book.Id,
                Title = book.Title,
                ISBN = book.ISBN.Value,
                Description = book.Description,
                PublicationYear = book.PublicationYear,
                Language = book.Language,
                Edition = book.Edition,
                PageCount = book.PageCount,
                IsAvailable = book.IsAvailable,

                CurrentPrice = book.GetCurrentPriceAmount(),
                DiscountPrice = book.GetCurrentDiscountPriceAmount(),

                // Stock Quantity (sum across all warehouses)
                StockQuantity = book.StockItems?.Sum(s => s.QuantityOnHand) ?? 0,

                // Publisher - sử dụng PublisherMapper
                Publisher = book.Publisher?.ToDto()!,

                // BookFormat - sử dụng BookFormatMapper
                BookFormat = book.BookFormat?.ToDto(),

                // Authors - sử dụng AuthorMapper
                Authors = book.BookAuthors?.Select(ba => AuthorMapper.ToDto(ba.Author)).ToList()
                    ?? new List<Dtos.Catalog.Author.AuthorDto>(),

                // Categories - sử dụng CategoryMapper
                Categories = book.BookCategories?.Select(bc => bc.Category.ToDto()).ToList()
                    ?? new List<Dtos.Catalog.Category.CategoryDto>(),

                // Images - sử dụng BookImageMapper
                Images = book.Images?.ToDtoList() ?? new List<Dtos.Catalog.BookImages.BookImageDto>(),

                // Files - sử dụng BookFileMapper
                Files = book.Files?.ToDtoList() ?? new List<BookFileDto>(),

                // Metadata - sử dụng BookMetadataMapper
                Metadata = book.Metadata?.ToDtoList() ?? new List<BookMetadataDto>(),

                // Reviews (TODO: Calculate from Reviews when schema is fixed)
                AverageRating = null,
                TotalReviews = 0
            };
        }
        public static BookEntity ToEntity(this CreateBookDto dto)
        {
            return new BookEntity
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
                // BookAuthors và BookCategories sẽ được thêm riêng trong Service
            };
        }

        public static void UpdateFromDto(this BookEntity book, UpdateBookDto dto)
        {
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
        }

        public static List<BookDto> ToDtoList(this IEnumerable<BookEntity> books)
        {
            return books.Select(b => b.ToDto()).ToList();
        }

        public static decimal? GetCurrentPriceAmount(this BookEntity book)
        {
            return book.Prices?
                .Where(p => p.IsCurrent
                            && p.EffectiveFrom <= DateTime.UtcNow
                            && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow))
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefault()?.Amount;
        }

        public static decimal? GetCurrentDiscountPriceAmount(this BookEntity book)
        {
            return book.Prices?
                .Where(p => p.IsCurrent
                            && p.EffectiveFrom <= DateTime.UtcNow
                            && (!p.EffectiveTo.HasValue || p.EffectiveTo >= DateTime.UtcNow)
                            && p.DiscountId.HasValue)
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefault()?.Amount;
        }

        public static List<RentalPlanDto> ToRentalPlanDtos(this decimal purchasePrice)
        {
            var plans = new List<RentalPlanDto>();
            var configs = new[]
            {
                new { Days = 3, Percent = 0.10m, Label = "3 ngày", Popular = false },
                new { Days = 7, Percent = 0.15m, Label = "7 ngày", Popular = false },
                new { Days = 14, Percent = 0.25m, Label = "14 ngày", Popular = false },
                new { Days = 30, Percent = 0.40m, Label = "30 ngày", Popular = false },
                new { Days = 180, Percent = 0.60m, Label = "180 ngày", Popular = true }
            };

            var base3Price = Math.Ceiling((purchasePrice * 0.10m) / 1000) * 1000;
            if (base3Price < 2000) base3Price = 2000;
            var basePerDay = base3Price / 3;

            var index = 1;
            foreach (var config in configs)
            {
                var price = Math.Ceiling((purchasePrice * config.Percent) / 1000) * 1000;
                var minPrice = config.Days <= 3 ? 2000 : 3000;
                if (price < minPrice) price = minPrice;

                if (plans.Any() && price <= plans.Last().Price)
                {
                    price = plans.Last().Price + 1000;
                }

                var savings = 0;
                if (config.Days > 7 && basePerDay > 0)
                {
                    var theoreticalPrice = basePerDay * config.Days;
                    if (theoreticalPrice > price)
                    {
                        savings = (int)Math.Round((1 - price / theoreticalPrice) * 100);
                        if (savings < 0) savings = 0;
                    }
                }

                plans.Add(new RentalPlanDto
                {
                    Id = index++,
                    Days = config.Days,
                    DurationLabel = config.Label,
                    Price = price,
                    SavingsPercentage = savings,
                    IsPopular = config.Popular
                });
            }

            return plans;
        }
    }
}
