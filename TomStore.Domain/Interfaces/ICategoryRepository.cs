namespace TomStore.Domain.Interfaces;

public interface ICategoryRepository : IRepository<TomStore.Domain.Entities.Category>
{
    Task<IEnumerable<TomStore.Domain.Entities.Category>> GetByNameAsync(string name);
}
