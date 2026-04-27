using System.ComponentModel.DataAnnotations;

namespace TomStore.Application.DTOs;

public class LoginDTO
{
    [Required(ErrorMessage = "Usuário ou telefone é obrigatório")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Senha é obrigatória")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; }
}
