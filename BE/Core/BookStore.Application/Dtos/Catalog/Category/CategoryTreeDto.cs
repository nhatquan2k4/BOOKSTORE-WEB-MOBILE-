using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Catalog.Category
{
    public class CategoryTreeDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid? ParentId { get; set; }
        public int BookCount { get; set; }
        public int Level { get; set; } // Cấp độ: 0 = root, 1 = level 1, etc.
        public List<CategoryTreeDto> SubCategories { get; set; } = new();
    }
}
