using Microsoft.EntityFrameworkCore;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;
using TomStore.Infrastructure.Data;

namespace TomStore.Infrastructure.Repositories;

public class ProductRepository : Repository<Product>, IProductRepository
{
    public ProductRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<IEnumerable<Product>> GetByCategoriaIdAsync(int categoriaId)
    {
        return await _dbSet
            .Include(p => p.Categoria)
            .Where(p => p.CategoriaId == categoriaId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Product>> SearchAsync(string term)
    {
        return await _dbSet
            .Include(p => p.Categoria)
            .Where(p => p.Nome.Contains(term) || p.Categoria.Nome.Contains(term))
            .ToListAsync();
    }
}
