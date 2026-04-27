using System.ComponentModel.DataAnnotations;

namespace TomStore.Domain.Entities;

public class Category
{
    public int Id { get; set; }

    [Required]
    [StringLength(255)]
    public string Nome { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    // Navigation properties
    public virtual ICollection<Product> Products { get; set; } = new List<Product>();
}
