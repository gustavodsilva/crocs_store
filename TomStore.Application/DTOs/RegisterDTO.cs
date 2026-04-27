using System.ComponentModel.DataAnnotations;

namespace TomStore.Application.DTOs;

public class RegisterDTO
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(255)]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Telefone é obrigatório")]
    [StringLength(20)]
    public string Telefone { get; set; } = string.Empty;

    [EmailAddress]
    public string? Email { get; set; }

    [StringLength(10)]
    public string? Cep { get; set; }

    [StringLength(255)]
    public string? Rua { get; set; }

    [StringLength(100)]
    public string? Bairro { get; set; }

    [StringLength(100)]
    public string? Cidade { get; set; }

    [StringLength(50)]
    public string? Estado { get; set; }

    [StringLength(20)]
    public string? Numero { get; set; }

    [StringLength(255)]
    public string? Complemento { get; set; }

    public DateTime? DataNascimento { get; set; }

    [Required]
    [StringLength(100)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [StringLength(100, MinimumLength = 6)]
    public string Password { get; set; } = string.Empty;

    [Compare("Password", ErrorMessage = "As senhas não coincidem")]
    public string ConfirmPassword { get; set; } = string.Empty;
}
