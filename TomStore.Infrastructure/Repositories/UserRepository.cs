using Microsoft.EntityFrameworkCore;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;
using TomStore.Infrastructure.Data;

namespace TomStore.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(ApplicationDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByTelefoneAsync(string telefone)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.Telefone == telefone);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        return await _dbSet.FirstOrDefaultAsync(u => u.UserName == username);
    }

    public async Task<bool> ExistsByTelefoneAsync(string telefone)
    {
        return await _dbSet.AnyAsync(u => u.Telefone == telefone);
    }

    public async Task<bool> ExistsByUsernameAsync(string username)
    {
        return await _dbSet.AnyAsync(u => u.UserName == username);
    }
}
