using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookCategory
    {
        public Guid BookId { get; set; }                      // FK tới Book
        public virtual Book Book { get; set; } = null!;

        public Guid CategoryId { get; set; }                  // FK tới Category
        public virtual Category Category { get; set; } = null!;
    }
}
