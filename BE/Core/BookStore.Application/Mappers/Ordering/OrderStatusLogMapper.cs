using BookStore.Application.Dtos.Ordering;
using BookStore.Domain.Entities.Ordering___Payment;

namespace BookStore.Application.Mappers.Ordering
{
    public static class OrderStatusLogMapper
    {
        public static OrderStatusLogDto ToDto(this OrderStatusLog entity)
        {
            return new OrderStatusLogDto
            {
                Id = entity.Id,
                OrderId = entity.OrderId,
                OrderNumber = entity.Order?.OrderNumber ?? string.Empty,
                OldStatus = entity.OldStatus,
                NewStatus = entity.NewStatus,
                ChangedAt = entity.ChangedAt,
                ChangedBy = entity.ChangedBy
            };
        }

        public static IEnumerable<OrderStatusLogDto> ToDtoList(this IEnumerable<OrderStatusLog> entities)
        {
            return entities.Select(e => e.ToDto());
        }
    }
}
