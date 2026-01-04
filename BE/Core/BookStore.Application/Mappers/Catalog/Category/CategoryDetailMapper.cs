using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Dtos.Catalog.Category;
using BookStore.Application.Mappers.Catalog.Book;
using CategoryEntity = BookStore.Domain.Entities.Catalog.Category;

namespace BookStore.Application.Mappers.Catalog.Category
{

    public static class CategoryDetailMapper
    {

        public static CategoryDetailDto ToDetailDto(this CategoryEntity category)
        {
            return new CategoryDetailDto
            {
                Id = category.Id,
                Name = category.Name,
                Description = category.Description,
                ParentId = category.ParentId,
                ParentName = category.Parent?.Name,
                BookCount = category.BookCategories?.Count ?? 0,

                // Breadcrumbs sẽ được build trong Service layer
                Breadcrumbs = new List<CategoryBreadcrumbDto>(),

                // SubCategories (chỉ 1 level, không đệ quy sâu)
                SubCategories = category.SubCategories?
                    .Select(sub => sub.ToTreeDto(1))
                    .ToList() ?? new List<CategoryTreeDto>(),

                // Books thuộc category này
                Books = category.BookCategories?
                    .Select(bc => bc.Book.ToDto())
                    .ToList() ?? new List<BookDto>()
            };
        }
    }
}
