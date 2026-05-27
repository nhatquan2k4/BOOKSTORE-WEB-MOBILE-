using BookStore.Application.Dtos.Rental;
using BookStore.Domain.Entities.Rental;

namespace BookStore.Application.Mappers.Rental
{
    public static class BookRentalMapper
    {
        public static BookRentalDto ToDto(this BookRental rental)
        {
            return new BookRentalDto
            {
                Id = rental.Id,
                UserId = rental.UserId,
                UserEmail = rental.User?.Email ?? "N/A",
                BookId = rental.BookId,
                BookTitle = rental.Book?.Title ?? "N/A",
                BookISBN = rental.Book?.ISBN?.Value,
                BookCoverImage = rental.Book?.Images?
                    .OrderBy(image => image.DisplayOrder)
                    .FirstOrDefault()?.ImageUrl,
                RentalPlanId = rental.RentalPlanId,
                RentalPlanName = rental.RentalPlan?.Name ?? "N/A",
                DurationDays = rental.RentalPlan?.DurationDays ?? 0,
                Price = rental.RentalPlan?.Price ?? 0,
                StartDate = rental.StartDate,
                EndDate = rental.EndDate,
                IsReturned = rental.IsReturned,
                IsRenewed = rental.IsRenewed,
                Status = rental.Status ?? "Unknown"
            };
        }

        public static IEnumerable<BookRentalDto> ToDtoList(this IEnumerable<BookRental> rentals)
        {
            return rentals.Select(rental => rental.ToDto());
        }
    }
}
