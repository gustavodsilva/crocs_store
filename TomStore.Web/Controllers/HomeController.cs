using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using TomStore.Application.DTOs;
using TomStore.Application.Interfaces;
using TomStore.Domain.Entities;

namespace TomStore.Web.Controllers;

public class HomeController : Controller
{
    private readonly IProductService _productService;
    private readonly ILogger<HomeController> _logger;

    public HomeController(IProductService productService, ILogger<HomeController> logger)
    {
        _productService = productService;
        _logger = logger;
    }

    public async Task<IActionResult> Index()
    {
        try
        {
            var products = await _productService.GetAllAsync();
            return View(products);
        }
        catch (Exception ex)
        {
            // Retornar dados mock temporariamente para testar
            var mockProducts = new List<Product>
            {
                new Product { Id = 1, Nome = "Camisa Preta Básica", Preco = 79.90m, Imagem = "camisa_preta.jpg", CategoriaId = 1, UserId = "1", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
                new Product { Id = 2, Nome = "Camisa Branca Básica", Preco = 79.90m, Imagem = "camisa_branca.jpg", CategoriaId = 1, UserId = "1", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now },
                new Product { Id = 3, Nome = "Bermuda Jeans", Preco = 99.90m, Imagem = "bermuda_jeans.jpg", CategoriaId = 2, UserId = "1", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now }
            };
            
            // Adicionar categorias mock
            mockProducts[0].Categoria = new Category { Id = 1, Nome = "Camisas", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
            mockProducts[1].Categoria = new Category { Id = 1, Nome = "Camisas", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
            mockProducts[2].Categoria = new Category { Id = 2, Nome = "Bermudas", CreatedAt = DateTime.Now, UpdatedAt = DateTime.Now };
            
            return View(mockProducts);
        }
    }

    [HttpGet]
    public async Task<IActionResult> Search(string term)
    {
        if (string.IsNullOrWhiteSpace(term))
        {
            return Json(new { products = new List<object>() });
        }

        var products = await _productService.SearchAsync(term);
        
        var result = products.Select(p => new
        {
            p.Id,
            p.Nome,
            p.Preco,
            p.Imagem,
            Categoria = p.Categoria.Nome
        });

        return Json(new { products = result });
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

public class ErrorViewModel
{
    public string? RequestId { get; set; }

    public bool ShowRequestId => !string.IsNullOrEmpty(RequestId);
}
