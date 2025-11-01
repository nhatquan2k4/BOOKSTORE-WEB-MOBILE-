using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using BookStore.Application.Dtos.Catalog.Book;

namespace BookStore.Application.Dtos.Catalog.Category
{
    public class CategoryDetailDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentId { get; set; }
        public string? ParentName { get; set; }
        public int BookCount { get; set; }
        public List<CategoryBreadcrumbDto> Breadcrumbs { get; set; } = new();
        public List<CategoryTreeDto> SubCategories { get; set; } = new();
        public List<BookDto> Books { get; set; } = new();
    }
}
