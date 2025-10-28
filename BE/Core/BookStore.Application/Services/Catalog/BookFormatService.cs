using BookStore.Application.Dtos.Catalog.Book;
using BookStore.Application.IService.Catalog;
using BookStore.Domain.Entities.Catalog;
using BookStore.Domain.Interfaces.Catalog;

namespace BookStore.Application.Services.Catalog
{
    public class BookFormatService : IBookFormatService
    {
        private readonly IBookFormatRepository _bookFormatRepository;

        public BookFormatService(IBookFormatRepository bookFormatRepository)
        {
            _bookFormatRepository = bookFormatRepository;
        }

        public async Task<IEnumerable<BookFormatDto>> GetAllAsync()
        {
            var formats = await _bookFormatRepository.GetAllAsync();
            return formats.Select(f => new BookFormatDto
            {
                Id = f.Id,
                FormatType = f.FormatType,
                Description = f.Description
            });
        }

        public async Task<BookFormatDto?> GetByIdAsync(Guid id)
        {
            var format = await _bookFormatRepository.GetByIdAsync(id);
            if (format == null) return null;

            return new BookFormatDto
            {
                Id = format.Id,
                FormatType = format.FormatType,
                Description = format.Description
            };
        }

        public async Task<BookFormatDto?> GetByFormatTypeAsync(string formatType)
        {
            var format = await _bookFormatRepository.GetByFormatType(formatType);
            if (format == null) return null;

            return new BookFormatDto
            {
                Id = format.Id,
                FormatType = format.FormatType,
                Description = format.Description
            };
        }

        public async Task<BookFormatDto> CreateAsync(BookFormatDto dto)
        {
            // Validate format type exists
            if (await _bookFormatRepository.IsFormatTypeExistsAsync(dto.FormatType))
            {
                throw new InvalidOperationException($"Định dạng '{dto.FormatType}' đã tồn tại");
            }

            var format = new BookFormat
            {
                Id = Guid.NewGuid(),
                FormatType = dto.FormatType,
                Description = dto.Description
            };

            await _bookFormatRepository.AddAsync(format);
            await _bookFormatRepository.SaveChangesAsync();

            dto.Id = format.Id;
            return dto;
        }

        public async Task<BookFormatDto> UpdateAsync(BookFormatDto dto)
        {
            var format = await _bookFormatRepository.GetByIdAsync(dto.Id);
            if (format == null)
            {
                throw new InvalidOperationException("Định dạng sách không tồn tại");
            }

            // Validate format type exists (exclude current format)
            if (await _bookFormatRepository.IsFormatTypeExistsAsync(dto.FormatType, dto.Id))
            {
                throw new InvalidOperationException($"Định dạng '{dto.FormatType}' đã được sử dụng");
            }

            format.FormatType = dto.FormatType;
            format.Description = dto.Description;

            _bookFormatRepository.Update(format);
            await _bookFormatRepository.SaveChangesAsync();

            return dto;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var format = await _bookFormatRepository.GetByIdAsync(id);
            if (format == null) return false;

            _bookFormatRepository.Delete(format);
            await _bookFormatRepository.SaveChangesAsync();

            return true;
        }

        public async Task<bool> IsFormatTypeExistsAsync(string formatType, Guid? excludeId = null)
        {
            return await _bookFormatRepository.IsFormatTypeExistsAsync(formatType, excludeId);
        }
    }
}