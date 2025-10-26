using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Category
    {
        public Guid Id { get; set; } 
        public string Name { get; set; } = null!; 
        public string? Description { get; set; } 
        public Guid? ParentId { get; set; }


        // Quan hệ đệ quy: 1 thể loại cha có nhiều thể loại con
        public virtual Category? Parent { get; set; }
        public virtual ICollection<Category> SubCategories { get; set; } = new List<Category>();

        // Quan hệ nhiều-nhiều với Book thông qua BookCategory
        public virtual ICollection<BookCategory> BookCategories { get; set; } = new List<BookCategory>();
    }
}