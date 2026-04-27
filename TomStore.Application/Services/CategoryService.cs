using Microsoft.Extensions.Logging;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;

namespace TomStore.Application.Services;

public class CategoryService : TomStore.Application.Interfaces.ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly ILogger<CategoryService> _logger;

    public CategoryService(
        ICategoryRepository categoryRepository,
        ILogger<CategoryService> logger)
    {
        _categoryRepository = categoryRepository;
        _logger = logger;
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        try
        {
            return await _categoryRepository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting category by ID {CategoryId}", id);
            return null;
        }
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        try
        {
            return await _categoryRepository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all categories");
            return Enumerable.Empty<Category>();
        }
    }

    public async Task<IEnumerable<Category>> GetByNameAsync(string name)
    {
        try
        {
            return await _categoryRepository.GetByNameAsync(name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting categories by name {Name}", name);
            return Enumerable.Empty<Category>();
        }
    }

    public async Task<Category> CreateAsync(Category category)
    {
        try
        {
            category.CreatedAt = DateTime.Now;
            category.UpdatedAt = DateTime.Now;
            return await _categoryRepository.AddAsync(category);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating category {CategoryName}", category.Nome);
            throw;
        }
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        try
        {
            category.UpdatedAt = DateTime.Now;
            await _categoryRepository.UpdateAsync(category);
            return category;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating category {CategoryId}", category.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var category = await _categoryRepository.GetByIdAsync(id);
            if (category == null)
            {
                return false;
            }

            await _categoryRepository.DeleteAsync(category);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting category {CategoryId}", id);
            return false;
        }
    }
}
