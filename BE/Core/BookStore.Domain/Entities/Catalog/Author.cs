using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Author : Common.BaseEntity
    {
        public string name { get; set; }
        public string? bio { get; set; }
    }
}
