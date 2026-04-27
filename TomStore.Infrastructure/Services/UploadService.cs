using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.IO;
using System.Text.RegularExpressions;

namespace TomStore.Infrastructure.Services;

public class UploadService : IUploadService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<UploadService> _logger;

    public UploadService(IConfiguration configuration, ILogger<UploadService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> UploadImageAsync(IFormFile file)
    {
        if (!IsImageValid(file))
        {
            throw new ArgumentException("Arquivo de imagem inválido");
        }

        var uploadPath = _configuration["UploadSettings:UploadPath"] ?? "wwwroot/uploads";
        var maxFileSize = !string.IsNullOrEmpty(_configuration["UploadSettings:MaxFileSize"]) ? long.Parse(_configuration["UploadSettings:MaxFileSize"]!) : 2097152; // 2MB

        if (file.Length > maxFileSize)
        {
            throw new ArgumentException($"Arquivo muito grande. Tamanho máximo: {maxFileSize / 1024 / 1024}MB");
        }

        // Create directory if it doesn't exist
        if (!Directory.Exists(uploadPath))
        {
            Directory.CreateDirectory(uploadPath);
        }

        // Generate unique filename
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var uniqueFileName = $"{DateTime.Now:yyyyMMdd_HHmmss}_{Guid.NewGuid():N}{fileExtension}";
        var filePath = Path.Combine(uploadPath, uniqueFileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        _logger.LogInformation("Imagem enviada: {FileName}", uniqueFileName);

        return uniqueFileName;
    }

    public bool IsImageValid(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return false;
        }

        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        if (!allowedExtensions.Contains(fileExtension))
        {
            return false;
        }

        // Validate MIME type
        var allowedMimeTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp" };
        
        if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
        {
            return false;
        }

        return true;
    }

    public void DeleteImage(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
        {
            return;
        }

        var fullPath = Path.Combine("wwwroot/uploads", imagePath);
        
        if (System.IO.File.Exists(fullPath))
        {
            System.IO.File.Delete(fullPath);
            _logger.LogInformation("Imagem excluída: {FileName}", imagePath);
        }
    }
}
