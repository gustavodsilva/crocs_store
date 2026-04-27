using TomStore.Domain.Entities;

namespace TomStore.Application.Interfaces;

public interface IUserService
{
    Task<User?> AuthenticateAsync(string username, string password);
    Task<User> RegisterAsync(User user, string password);
    Task<User?> GetByIdAsync(string id);
    Task<bool> UpdateLastLoginAsync(string userId);
}
