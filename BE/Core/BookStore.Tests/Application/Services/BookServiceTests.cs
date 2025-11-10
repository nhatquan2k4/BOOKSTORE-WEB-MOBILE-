using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.Services.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.ValueObjects;
using BookStore.Shared.Utilities;
using FluentAssertions;
using Moq;
using Xunit;

namespace BookStore.Tests.Application.Services
{
    /// <summary>
    /// Unit tests cho BookService (Application layer)
    /// Test business logic trong service layer, sử dụng Moq để mock dependencies
    /// Tuân thủ Clean Architecture: Application layer phụ thuộc vào Domain, không phụ thuộc vào Infrastructure
    /// </summary>
    public class BookServiceTests
    {
        private readonly Mock<IBookRepository> _mockBookRepository;
        private readonly Mock<IAuthorRepository> _mockAuthorRepository;
        private readonly Mock<ICategoryRepository> _mockCategoryRepository;
        private readonly Mock<IPublisherRepository> _mockPublisherRepository;
        private readonly Mock<IBookFormatRepository> _mockBookFormatRepository;
        private readonly BookService _bookService;

        public BookServiceTests()
        {
            _mockBookRepository = new Mock<IBookRepository>();
            _mockAuthorRepository = new Mock<IAuthorRepository>();
            _mockCategoryRepository = new Mock<ICategoryRepository>();
            _mockPublisherRepository = new Mock<IPublisherRepository>();
            _mockBookFormatRepository = new Mock<IBookFormatRepository>();

            _bookService = new BookService(
                _mockBookRepository.Object,
                _mockAuthorRepository.Object,
                _mockCategoryRepository.Object,
                _mockPublisherRepository.Object,
                _mockBookFormatRepository.Object
            );
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnPagedResult_WithCorrectData()
        {
            // Arrange
            var books = new List<Book>
            {
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Clean Architecture",
                    ISBN = new ISBN("978-0134494166"),
                    PublicationYear = 2017,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = true,
                    PageCount = 432,
                    Language = "en"
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Domain-Driven Design",
                    ISBN = new ISBN("978-0321125217"),
                    PublicationYear = 2003,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = true,
                    PageCount = 560,
                    Language = "en"
                }
            };

            _mockBookRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(books);

            // Act
            var result = await _bookService.GetAllAsync(pageNumber: 1, pageSize: 10);

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(2);
            result.TotalCount.Should().Be(2);
            result.PageNumber.Should().Be(1);
            result.PageSize.Should().Be(10);

            _mockBookRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WithSearchTerm_ShouldFilterBooks()
        {
            // Arrange
            var books = new List<Book>
            {
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Clean Architecture",
                    ISBN = new ISBN("978-0134494166"),
                    PublicationYear = 2017,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = true,
                    PageCount = 432,
                    Language = "en"
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Domain-Driven Design",
                    ISBN = new ISBN("978-0321125217"),
                    PublicationYear = 2003,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = true,
                    PageCount = 560,
                    Language = "en"
                }
            };

            _mockBookRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(books);

            // Act
            var result = await _bookService.GetAllAsync(
                pageNumber: 1,
                pageSize: 10,
                searchTerm: "Clean");

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(1);
            result.Items.First().Title.Should().Contain("Clean");

            _mockBookRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WithIsAvailableFilter_ShouldReturnOnlyAvailableBooks()
        {
            // Arrange
            var books = new List<Book>
            {
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Available Book",
                    ISBN = new ISBN("978-0134494166"),
                    PublicationYear = 2017,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = true,
                    PageCount = 432,
                    Language = "en"
                },
                new Book
                {
                    Id = Guid.NewGuid(),
                    Title = "Unavailable Book",
                    ISBN = new ISBN("978-0321125217"),
                    PublicationYear = 2003,
                    PublisherId = Guid.NewGuid(),
                    IsAvailable = false,
                    PageCount = 560,
                    Language = "en"
                }
            };

            _mockBookRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(books);

            // Act
            var result = await _bookService.GetAllAsync(
                pageNumber: 1,
                pageSize: 10,
                isAvailable: true);

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(1);
            result.Items.First().IsAvailable.Should().BeTrue();
            result.Items.First().Title.Should().Be("Available Book");

            _mockBookRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        }

        [Fact]
        public async Task GetAllAsync_WithPagination_ShouldReturnCorrectPage()
        {
            // Arrange
            // Sử dụng danh sách ISBN hợp lệ đã được validate
            var validISBN = "978-0134494166";

            var books = Enumerable.Range(0, 25).Select(i => new Book
            {
                Id = Guid.NewGuid(),
                Title = $"Book {i + 1}",
                ISBN = new ISBN(validISBN),  // Sử dụng cùng một ISBN hợp lệ cho tất cả books
                PublicationYear = 2020 + i,
                PublisherId = Guid.NewGuid(),
                IsAvailable = true,
                PageCount = 100 + i,
                Language = "en"
            }).ToList();

            _mockBookRepository.Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(books);

            // Act
            var result = await _bookService.GetAllAsync(pageNumber: 2, pageSize: 10);

            // Assert
            result.Should().NotBeNull();
            result.Items.Should().HaveCount(10);
            result.TotalCount.Should().Be(25);
            result.PageNumber.Should().Be(2);
            result.PageSize.Should().Be(10);

            _mockBookRepository.Verify(repo => repo.GetAllAsync(), Times.Once);
        }
    }
}
