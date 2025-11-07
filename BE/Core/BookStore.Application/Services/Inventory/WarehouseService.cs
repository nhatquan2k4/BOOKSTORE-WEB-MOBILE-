using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Application.Service;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;

namespace BookStore.Application.Services.Inventory
{
    public class WarehouseService
        : GenericService<Warehouse, WarehouseDto, CreateWarehouseDto, UpdateWarehouseDto>,
          IWarehouseService
    {
        private readonly IWarehouseRepository _warehouseRepository;

        public WarehouseService(IWarehouseRepository warehouseRepository)
            : base(warehouseRepository)
        {
            _warehouseRepository = warehouseRepository;
        }

        // Override mapping methods
        protected override WarehouseDto MapToDto(Warehouse entity)
        {
            return entity.ToDto();
        }

        protected override Warehouse MapToEntity(CreateWarehouseDto dto)
        {
            return dto.ToEntity();
        }

        protected override Warehouse MapToEntity(UpdateWarehouseDto dto)
        {
            // For update, need to get existing entity and update it
            throw new NotImplementedException("Use UpdateWarehouseAsync instead");
        }


        // Specific methods for Warehouse
        public async Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync()
        {
            // Use base GetAllAsync
            return await GetAllAsync();
        }

        public async Task<WarehouseDto?> GetWarehouseByIdAsync(Guid id)
        {
            var warehouse = await _warehouseRepository.GetWarehouseWithStatisticsAsync(id);
            return warehouse?.ToDto();
        }

        public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto dto)
        {
            // Use base AddAsync
            return await AddAsync(dto);
        }

        public async Task<WarehouseDto?> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto dto)
        {
            var warehouse = await _repository.GetByIdAsync(id);
            if (warehouse == null) return null;

            warehouse.UpdateFromDto(dto);

            _repository.Update(warehouse);
            await _repository.SaveChangesAsync();

            return await GetWarehouseByIdAsync(id);
        }

        public async Task<bool> DeleteWarehouseAsync(Guid id)
        {
            // Use base DeleteAsync
            return await DeleteAsync(id);
        }
    }
}