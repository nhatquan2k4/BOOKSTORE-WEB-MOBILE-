namespace BookStore.Application.Dtos.Cart
{
    public class UpdateCartDto
    {
        public Guid CartId { get; set; }
        public List<UpdateCartItemDto>? Items { get; set; }
    }
}
