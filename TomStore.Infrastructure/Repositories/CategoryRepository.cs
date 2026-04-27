using Microsoft.EntityFrameworkCore;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;
using TomStore.Infrastructure.Data;

namespace TomStore.Infrastructure.Repositories;

public class CategoryRepository : Repository<Category>, ICategoryRepository
{
    public CategoryRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Category>> GetByNameAsync(string name)
    {
        return await _dbSet
            .Where(c => c.Nome.Contains(name))
            .ToListAsync();
    }
}
