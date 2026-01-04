using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace BookStore.Tests.Domain.Entities
{

    public class BookEntityTests
    {
        [Fact]
        public void Book_ShouldInitialize_WithCorrectDefaultValues()
        {
            // Arrange & Act
            var book = new Book
            {
                Id = Guid.NewGuid()
            };

            // Assert
            book.Id.Should().NotBeEmpty();
            book.IsAvailable.Should().BeTrue();
            book.Language.Should().Be("vi");
            book.BookAuthors.Should().BeEmpty();
            book.BookCategories.Should().BeEmpty();
            book.Images.Should().BeEmpty();
        }

        [Fact]
        public void Book_ShouldSet_PropertiesCorrectly()
        {
            // Arrange
            var bookId = Guid.NewGuid();
            var publisherId = Guid.NewGuid();
            var isbn = new ISBN("978-3-16-148410-0");
            var title = "Clean Architecture";
            var publicationYear = 2017;
            var pageCount = 432;

            // Act
            var book = new Book
            {
                Id = bookId,
                Title = title,
                ISBN = isbn,
                PublicationYear = publicationYear,
                PageCount = pageCount,
                PublisherId = publisherId,
                Description = "A comprehensive guide to clean architecture",
                Edition = "1st Edition",
                Language = "en"
            };

            // Assert
            book.Id.Should().Be(bookId);
            book.Title.Should().Be(title);
            book.ISBN.Should().Be(isbn);
            book.PublicationYear.Should().Be(publicationYear);
            book.PageCount.Should().Be(pageCount);
            book.PublisherId.Should().Be(publisherId);
            book.Description.Should().Be("A comprehensive guide to clean architecture");
            book.Edition.Should().Be("1st Edition");
            book.Language.Should().Be("en");
        }

        [Fact]
        public void Book_CanBeUnavailable_WhenSetToFalse()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                ISBN = new ISBN("978-3-16-148410-0"),
                PublisherId = Guid.NewGuid(),
                IsAvailable = false
            };

            // Act & Assert
            book.IsAvailable.Should().BeFalse();
        }

        [Fact]
        public void Book_ShouldSupport_CollectionNavigation()
        {
            // Arrange
            var book = new Book
            {
                Title = "Test Book",
                ISBN = new ISBN("978-3-16-148410-0"),
                PublisherId = Guid.NewGuid()
            };

            // Act
            book.BookAuthors.Add(new BookAuthor { BookId = book.Id, AuthorId = Guid.NewGuid() });
            book.BookCategories.Add(new BookCategory { BookId = book.Id, CategoryId = Guid.NewGuid() });

            // Assert
            book.BookAuthors.Should().HaveCount(1);
            book.BookCategories.Should().HaveCount(1);
        }
    }
}
