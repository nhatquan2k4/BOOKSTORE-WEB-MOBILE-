using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Application.Dtos.Catalog.Book
{
    public class CreateBookDto
    {
        public string Title { get; set; } = string.Empty;
        public string ISBN { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int PublicationYear { get; set; }
        public string Language { get; set; } = "vi";
        public string? Edition { get; set; }
        public int PageCount { get; set; }
        public bool IsAvailable { get; set; } = true;
        public Guid PublisherId { get; set; }
        public Guid? BookFormatId { get; set; }

        // Many-to-Many
        public List<Guid> AuthorIds { get; set; } = new();
        public List<Guid> CategoryIds { get; set; } = new();
    }
}