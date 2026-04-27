using System.ComponentModel.DataAnnotations;

namespace TomStore.Domain.ValueObjects;

public class Address
{
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

    public bool IsValid()
    {
        return !string.IsNullOrEmpty(Rua) && 
               !string.IsNullOrEmpty(Bairro) && 
               !string.IsNullOrEmpty(Cidade) && 
               !string.IsNullOrEmpty(Estado) && 
               !string.IsNullOrEmpty(Numero);
    }
}
