using Microsoft.AspNetCore.Http;

namespace TomStore.Infrastructure.Services;

public interface IUploadService
{
    Task<string> UploadImageAsync(IFormFile file);
    bool IsImageValid(IFormFile file);
    void DeleteImage(string imagePath);
}
