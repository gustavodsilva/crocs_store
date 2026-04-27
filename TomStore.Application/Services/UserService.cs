using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using TomStore.Application.DTOs;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;

namespace TomStore.Application.Services;

public class UserService : TomStore.Application.Interfaces.IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ILogger<UserService> _logger;

    public UserService(
        IUserRepository userRepository,
        IPasswordHasher<User> passwordHasher,
        ILogger<UserService> logger)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _logger = logger;
    }

    public async Task<User?> AuthenticateAsync(string username, string password)
    {
        try
        {
            // Try to find user by username or phone
            var user = await _userRepository.GetByUsernameAsync(username) ??
                      await _userRepository.GetByTelefoneAsync(username);

            if (user == null || !user.Active)
            {
                return null;
            }

            // Verify password
            var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash ?? "", password);
            
            if (result == PasswordVerificationResult.Failed)
            {
                return null;
            }

            // Update last login
            await UpdateLastLoginAsync(user.Id);

            return user;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error authenticating user {Username}", username);
            return null;
        }
    }

    public async Task<User> RegisterAsync(User user, string password)
    {
        try
        {
            // Check if user already exists
            if (await _userRepository.ExistsByTelefoneAsync(user.Telefone) ||
                await _userRepository.ExistsByUsernameAsync(user.UserName ?? ""))
            {
                throw new InvalidOperationException("Usuário já cadastrado.");
            }

            // Hash password
            user.PasswordHash = _passwordHasher.HashPassword(user, password);
            
            // Set default values
            user.CreatedAt = DateTime.Now;
            user.UpdatedAt = DateTime.Now;
            user.Active = true;

            // Create user
            return await _userRepository.AddAsync(user);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering user {Username}", user.UserName);
            throw;
        }
    }

    public async Task<User?> GetByIdAsync(string id)
    {
        try
        {
            return await _userRepository.GetByIdAsync(int.Parse(id));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user by ID {UserId}", id);
            return null;
        }
    }

    public async Task<bool> UpdateLastLoginAsync(string userId)
    {
        try
        {
            var user = await _userRepository.GetByIdAsync(int.Parse(userId));
            if (user != null)
            {
                user.LastLogin = DateTime.Now;
                await _userRepository.UpdateAsync(user);
                return true;
            }
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last login for user {UserId}", userId);
            return false;
        }
    }
}
