using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TomStore.Domain.Entities;

public class Product
{
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [Column(TypeName = "decimal(10,2)")]
    public decimal Preco { get; set; }

    [StringLength(500)]
    public string? Imagem { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Foreign Keys
    public int CategoriaId { get; set; }
    public string UserId { get; set; } = string.Empty;

    // Navigation properties
    [ForeignKey("CategoriaId")]
    public virtual Category Categoria { get; set; } = null!;

    [ForeignKey("UserId")]
    public virtual User User { get; set; } = null!;
}
