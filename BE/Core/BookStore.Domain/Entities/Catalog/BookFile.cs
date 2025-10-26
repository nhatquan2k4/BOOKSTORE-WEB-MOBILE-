using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class BookFile
    {
        public Guid Id { get; set; }

        public string FileUrl { get; set; } = null!;          
        public string FileType { get; set; } = null!;         
        public long FileSize { get; set; }                   
        public bool IsPreview { get; set; }                 

        public Guid BookId { get; set; }
        public virtual Book Book { get; set; } = null!;
    }
}