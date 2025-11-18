using BookStore.Application.Dtos.Rental;
using BookStore.Domain.Entities.Rental;

namespace BookStore.Application.Mappers.Rental
{
    public static class RentalPlanMapper
    {
        public static RentalPlanDto ToDto(this RentalPlan entity)
        {
            return new RentalPlanDto
            {
                Id = entity.Id,
                Name = entity.Name,
                Description = entity.Description,
                Price = entity.Price,
                DurationDays = entity.DurationDays,
                IsActive = entity.IsActive,
                CreatedAt = entity.CreatedAt
            };
        }

        public static RentalPlan ToEntity(this CreateRentalPlanDto dto)
        {
            return new RentalPlan
            {
                Id = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                DurationDays = dto.DurationDays,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
        }

        public static void UpdateEntity(this RentalPlan entity, UpdateRentalPlanDto dto)
        {
            entity.Name = dto.Name;
            entity.Description = dto.Description;
            entity.Price = dto.Price;
            entity.DurationDays = dto.DurationDays;
            entity.IsActive = dto.IsActive;
        }
    }
}
