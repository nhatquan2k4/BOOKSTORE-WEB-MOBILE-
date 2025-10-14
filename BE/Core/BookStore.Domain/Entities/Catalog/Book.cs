using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Book : Common.BaseEntity
    {
        public string Title { get; set; }
        public decimal Price { get; set; }
        public string? Description { get; set; }
    }
}
