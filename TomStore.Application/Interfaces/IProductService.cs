using TomStore.Domain.Entities;

namespace TomStore.Application.Interfaces;

public interface IProductService
{
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task<IEnumerable<Product>> GetByCategoriaIdAsync(int categoriaId);
    Task<IEnumerable<Product>> SearchAsync(string term);
    Task<Product> CreateAsync(Product product);
    Task<Product> UpdateAsync(Product product);
    Task<bool> DeleteAsync(int id);
}
