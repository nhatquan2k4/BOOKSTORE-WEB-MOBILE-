using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Review : Common.BaseEntity
    {
        public int Rating { get; set; } // e.g., 1 to 5
        public string Comment { get; set; }

    }
}
