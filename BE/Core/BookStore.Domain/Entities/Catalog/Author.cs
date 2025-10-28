using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Author
    {
        public Guid Id { get; set; } 
        public string Name { get; set; } = null!; 
        public string? Biography { get; set; } 
        public string? AvartarUrl { get; set; }

        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();
    }
}