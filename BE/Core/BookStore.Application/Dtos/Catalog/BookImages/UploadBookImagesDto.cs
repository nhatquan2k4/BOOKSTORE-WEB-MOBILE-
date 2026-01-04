namespace BookStore.Application.Dtos.Catalog.BookImages
{

    public class UploadBookImagesDto
    {
        public Guid BookId { get; set; }
        public List<string> ImageUrls { get; set; } = new();


        public int? CoverImageIndex { get; set; }
    }
}
