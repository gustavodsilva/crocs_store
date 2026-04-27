using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace TomStore.Domain.Entities;

public class User : IdentityUser
{
    [Required]
    [StringLength(255)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(20)]
    public string Telefone { get; set; } = string.Empty;

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

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DateTime? LastLogin { get; set; }
    public bool Active { get; set; } = true;

    // Navigation properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
