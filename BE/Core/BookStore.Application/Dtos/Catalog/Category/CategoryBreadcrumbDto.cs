using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Catalog.Category
{
    public class CategoryBreadcrumbDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Level { get; set; }
    }
}
