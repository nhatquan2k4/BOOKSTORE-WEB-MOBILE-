using BookStore.Domain.Entities.Common;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.Entities.Pricing_Inventory;
using BookStore.Domain.Entities.Rental;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BookStore.Domain.Entities.Catalog
{
    public class Book
    {
        public Guid Id { get; set; }

        public string Title { get; set; } = null!;             // Tên sách
        public string ISBN { get; set; } = null!;              // Mã ISBN (định danh duy nhất cho sách)
        public string Description { get; set; } = null!;       // Tóm tắt nội dung sách
        public int PublicationYear { get; set; }               // Năm xuất bản
        public string Language { get; set; } = "vi";           // Ngôn ngữ (vi, en, jp,...)
        public bool IsAvailable { get; set; } = true;          // Còn phát hành không
        public string? Edition { get; set; }                   // Phiên bản (tái bản lần thứ mấy)
        public int PageCount { get; set; }                     // Số trang

        // 🔗 1-n: Mỗi sách thuộc 1 nhà xuất bản
        public Guid PublisherId { get; set; }
        public virtual Publisher Publisher { get; set; } = null!;

        // 🔗 n-n: Nhiều tác giả cho 1 sách
        public virtual ICollection<BookAuthor> BookAuthors { get; set; } = new List<BookAuthor>();

        // 🔗 n-n: Sách có thể thuộc nhiều thể loại
        public virtual ICollection<BookCategory> BookCategories { get; set; } = new List<BookCategory>();

        // 🔗 1-n: Ảnh, file, metadata
        public virtual ICollection<BookImage> Images { get; set; } = new List<BookImage>();
        public virtual ICollection<BookFile> Files { get; set; } = new List<BookFile>();
        public virtual ICollection<BookMetadata> Metadata { get; set; } = new List<BookMetadata>();

        // 🔗 1-n: Quan hệ sang module Pricing & Review
        public virtual ICollection<Price> Prices { get; set; } = new List<Price>();
        public virtual StockItem? StockItem { get; set; }              // Tồn kho vật lý
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>(); // Đánh giá
        public virtual ICollection<BookRental> Rentals { get; set; } = new List<BookRental>(); // Thuê ebook
    }
}
