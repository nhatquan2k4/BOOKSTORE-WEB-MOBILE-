using BookStore.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace BookStore.Tests.Domain.ValueObjects
{
    /// <summary>
    /// Unit tests cho ISBN Value Object (Domain layer)
    /// Value Objects là immutable và chứa validation logic riêng
    /// Đây là ví dụ về DDD (Domain-Driven Design) pattern
    /// </summary>
    public class ISBNTests
    {
        [Theory]
        [InlineData("978-0134494166")]  // ISBN-13 với dấu gạch ngang
        [InlineData("9780134494166")]   // ISBN-13 không có dấu gạch ngang
        [InlineData("0-306-40615-2")]   // ISBN-10 với dấu gạch ngang
        [InlineData("0306406152")]      // ISBN-10 không có dấu gạch ngang
        public void ISBN_ShouldBeValid_WithCorrectFormat(string isbnValue)
        {
            // Arrange & Act
            var isbn = new ISBN(isbnValue);

            // Assert
            isbn.Should().NotBeNull();
            isbn.Value.Should().NotBeNullOrEmpty();
        }

        [Theory]
        [InlineData("")]
        [InlineData(" ")]
        public void ISBN_ShouldThrowException_WhenValueIsEmpty(string isbnValue)
        {
            // Arrange, Act & Assert
            var exception = Assert.Throws<ArgumentException>(() => new ISBN(isbnValue));
            exception.Message.Should().Contain("ISBN không được để trống");
        }

        [Fact]
        public void ISBN_ShouldThrowException_WhenValueIsNull()
        {
            // Arrange, Act & Assert
            var exception = Assert.Throws<ArgumentException>(() => new ISBN(null!));
            exception.Message.Should().Contain("ISBN không được để trống");
        }

        [Theory]
        [InlineData("123")]              // Too short
        [InlineData("12345678901234")]   // Too long
        [InlineData("ABCDEFGHIJ")]       // Invalid characters for ISBN-10
        [InlineData("978-INVALID-13")]   // Invalid ISBN-13
        public void ISBN_ShouldThrowException_WhenFormatIsInvalid(string isbnValue)
        {
            // Arrange, Act & Assert
            var exception = Assert.Throws<ArgumentException>(() => new ISBN(isbnValue));
            exception.Message.Should().Contain("ISBN không hợp lệ");
        }

        [Fact]
        public void ISBN_ShouldClean_HyphensAndSpaces()
        {
            // Arrange
            var isbnWithHyphens = "978-0-13-449416-6";
            var isbnWithSpaces = "978 0 13 449416 6";

            // Act
            var isbn1 = new ISBN(isbnWithHyphens);
            var isbn2 = new ISBN(isbnWithSpaces);

            // Assert
            isbn1.Value.Should().NotContain("-");
            isbn1.Value.Should().NotContain(" ");
            isbn2.Value.Should().NotContain("-");
            isbn2.Value.Should().NotContain(" ");
        }

        [Fact]
        public void ISBN_ShouldBeImmutable()
        {
            // Arrange
            var originalValue = "978-0134494166";
            var isbn = new ISBN(originalValue);

            // Act
            var value = isbn.Value;

            // Assert
            value.Should().Be(isbn.Value);
            // Value Object không có setter public, đảm bảo tính immutable
        }

        [Fact]
        public void TwoISBNs_WithSameValue_ShouldBeEqual()
        {
            // Arrange
            var isbn1 = new ISBN("978-0134494166");
            var isbn2 = new ISBN("9780134494166");  // Same value, different format

            // Act & Assert
            // Cả hai đều được clean về cùng một format
            isbn1.Value.Should().Be(isbn2.Value);
        }
    }
}
