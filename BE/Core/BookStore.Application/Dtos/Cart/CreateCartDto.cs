namespace BookStore.Application.Dtos.Cart
{
    public class CreateCartDto
    {
        public Guid UserId { get; set; }
    }

    public class AddToCartDto
    {
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
        public int Quantity { get; set; } = 1;
    }

    public class RemoveFromCartDto
    {
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
    }

    public class UpdateCartItemDto
    {
        public Guid UserId { get; set; }
        public Guid BookId { get; set; }
        public int Quantity { get; set; }
    }

    public class ClearCartDto
    {
        public Guid UserId { get; set; }
    }
}
