namespace TomStore.Domain.Interfaces;

public interface IProductRepository : IRepository<TomStore.Domain.Entities.Product>
{
    Task<IEnumerable<TomStore.Domain.Entities.Product>> GetByCategoriaIdAsync(int categoriaId);
    Task<IEnumerable<TomStore.Domain.Entities.Product>> SearchAsync(string term);
}
