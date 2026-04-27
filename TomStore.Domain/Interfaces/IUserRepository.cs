namespace TomStore.Domain.Interfaces;

public interface IUserRepository : IRepository<TomStore.Domain.Entities.User>
{
    Task<TomStore.Domain.Entities.User?> GetByTelefoneAsync(string telefone);
    Task<TomStore.Domain.Entities.User?> GetByUsernameAsync(string username);
    Task<bool> ExistsByTelefoneAsync(string telefone);
    Task<bool> ExistsByUsernameAsync(string username);
}
