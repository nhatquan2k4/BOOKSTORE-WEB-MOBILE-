using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookImage
    {
        public Guid Id { get; set; }

        public string ImageUrl { get; set; } = null!;
        public bool IsCover { get; set; }
        public int DisplayOrder { get; set; }

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;
    }
}