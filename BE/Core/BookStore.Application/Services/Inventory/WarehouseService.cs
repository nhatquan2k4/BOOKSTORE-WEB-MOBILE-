using BookStore.Application.Dtos.Inventory;
using BookStore.Application.IService.Inventory;
using BookStore.Application.Mappers.Inventory;
using BookStore.Domain.Entities.Pricing___Inventory;
using BookStore.Domain.IRepository.Inventory;

namespace BookStore.Application.Services.Inventory
{
    public class WarehouseService : IWarehouseService
    {
        private readonly IWarehouseRepository _warehouseRepository;

        public WarehouseService(IWarehouseRepository warehouseRepository)
        {
            _warehouseRepository = warehouseRepository;
        }

        public async Task<IEnumerable<WarehouseDto>> GetAllWarehousesAsync()
        {
            var warehouses = await _warehouseRepository.GetAllWarehousesAsync();
            return warehouses.Select(w => w.ToDto());
        }

        public async Task<WarehouseDto?> GetWarehouseByIdAsync(Guid id)
        {
            var warehouse = await _warehouseRepository.GetWarehouseWithStatisticsAsync(id);
            return warehouse?.ToDto();
        }

        public async Task<WarehouseDto> CreateWarehouseAsync(CreateWarehouseDto dto)
        {
            var warehouse = dto.ToEntity();

            await _warehouseRepository.AddAsync(warehouse);
            await _warehouseRepository.SaveChangesAsync();

            return warehouse.ToDto();
        }

        public async Task<WarehouseDto?> UpdateWarehouseAsync(Guid id, UpdateWarehouseDto dto)
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(id);
            if (warehouse == null) return null;

            warehouse.UpdateFromDto(dto);

            _warehouseRepository.Update(warehouse);
            await _warehouseRepository.SaveChangesAsync();

            return await GetWarehouseByIdAsync(id);
        }

        public async Task<bool> DeleteWarehouseAsync(Guid id)
        {
            var warehouse = await _warehouseRepository.GetByIdAsync(id);
            if (warehouse == null) return false;

            _warehouseRepository.Delete(warehouse);
            await _warehouseRepository.SaveChangesAsync();
            return true;
        }
    }
}
