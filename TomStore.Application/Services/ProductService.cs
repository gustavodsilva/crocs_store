using Microsoft.Extensions.Logging;
using TomStore.Domain.Entities;
using TomStore.Domain.Interfaces;

namespace TomStore.Application.Services;

public class ProductService : TomStore.Application.Interfaces.IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ILogger<ProductService> _logger;

    public ProductService(
        IProductRepository productRepository,
        ILogger<ProductService> logger)
    {
        _productRepository = productRepository;
        _logger = logger;
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        try
        {
            return await _productRepository.GetByIdAsync(id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting product by ID {ProductId}", id);
            return null;
        }
    }

    public async Task<IEnumerable<Product>> GetAllAsync()
    {
        try
        {
            return await _productRepository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all products");
            return Enumerable.Empty<Product>();
        }
    }

    public async Task<IEnumerable<Product>> GetByCategoriaIdAsync(int categoriaId)
    {
        try
        {
            return await _productRepository.GetByCategoriaIdAsync(categoriaId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting products by category {CategoryId}", categoriaId);
            return Enumerable.Empty<Product>();
        }
    }

    public async Task<IEnumerable<Product>> SearchAsync(string term)
    {
        try
        {
            return await _productRepository.SearchAsync(term);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching products with term {Term}", term);
            return Enumerable.Empty<Product>();
        }
    }

    public async Task<Product> CreateAsync(Product product)
    {
        try
        {
            product.CreatedAt = DateTime.Now;
            product.UpdatedAt = DateTime.Now;
            return await _productRepository.AddAsync(product);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating product {ProductName}", product.Nome);
            throw;
        }
    }

    public async Task<Product> UpdateAsync(Product product)
    {
        try
        {
            product.UpdatedAt = DateTime.Now;
            await _productRepository.UpdateAsync(product);
            return product;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating product {ProductId}", product.Id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            var product = await _productRepository.GetByIdAsync(id);
            if (product == null)
            {
                return false;
            }

            await _productRepository.DeleteAsync(product);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting product {ProductId}", id);
            return false;
        }
    }
}
