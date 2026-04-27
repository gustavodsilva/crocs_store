using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TomStore.Domain.Entities;

namespace TomStore.Infrastructure.Data;

public class ApplicationDbContext : IdentityDbContext<User>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Configure Product
        builder.Entity<Product>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Preco).HasColumnType("decimal(10,2)");
            entity.Property(e => e.Imagem).HasMaxLength(500);
            entity.HasOne(e => e.Categoria).WithMany(c => c.Products).HasForeignKey(e => e.CategoriaId);
            entity.HasOne(e => e.User).WithMany(u => u.Products).HasForeignKey(e => e.UserId);
        });

        // Configure Category
        builder.Entity<Category>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(255);
            entity.HasMany(c => c.Products).WithOne(p => p.Categoria).HasForeignKey(p => p.CategoriaId);
        });

        // Configure User custom properties
        builder.Entity<User>(entity =>
        {
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Telefone).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Cep).HasMaxLength(10);
            entity.Property(e => e.Rua).HasMaxLength(255);
            entity.Property(e => e.Bairro).HasMaxLength(100);
            entity.Property(e => e.Cidade).HasMaxLength(100);
            entity.Property(e => e.Estado).HasMaxLength(50);
            entity.Property(e => e.Numero).HasMaxLength(20);
            entity.Property(e => e.Complemento).HasMaxLength(255);
            entity.HasIndex(e => e.Telefone).IsUnique();
        });

        // Seed initial data
        SeedData(builder);
    }

    private void SeedData(ModelBuilder builder)
    {
        // Create categories
        var categories = new[]
        {
            new Category { Id = 1, Nome = "Camisas", CreatedAt = DateTime.Now },
            new Category { Id = 2, Nome = "Bermudas", CreatedAt = DateTime.Now },
            new Category { Id = 3, Nome = "Moletons", CreatedAt = DateTime.Now },
            new Category { Id = 4, Nome = "Calças", CreatedAt = DateTime.Now },
            new Category { Id = 5, Nome = "Acessórios", CreatedAt = DateTime.Now }
        };

        builder.Entity<Category>().HasData(categories);

        // Create admin user (password will be set in code)
        var adminUser = new User
        {
            Id = "1",
            UserName = "adminTom",
            Email = "admin@tomstore.com",
            Nome = "Administrador Tom Store",
            Telefone = "11985278370",
            EmailConfirmed = true,
            PhoneNumberConfirmed = true,
            Active = true,
            CreatedAt = DateTime.Now,
            UpdatedAt = DateTime.Now
        };

        var adminHasher = new PasswordHasher<User>();
        adminUser.PasswordHash = adminHasher.HashPassword(adminUser, "password");

        builder.Entity<User>().HasData(adminUser);

        // Create sample products
        var products = new[]
        {
            new Product { Id = 1, Nome = "Camisa Preta Básica", Preco = 79.90m, Imagem = "camisa_preta.jpg", CategoriaId = 1, UserId = adminUser.Id, CreatedAt = DateTime.Now },
            new Product { Id = 2, Nome = "Camisa Branca Básica", Preco = 79.90m, Imagem = "camisa_branca.jpg", CategoriaId = 1, UserId = adminUser.Id, CreatedAt = DateTime.Now },
            new Product { Id = 3, Nome = "Bermuda Jeans", Preco = 99.90m, Imagem = "bermuda_jeans.jpg", CategoriaId = 2, UserId = adminUser.Id, CreatedAt = DateTime.Now },
            new Product { Id = 4, Nome = "Bermuda Moletom", Preco = 89.90m, Imagem = "bermuda_moletom.jpg", CategoriaId = 2, UserId = adminUser.Id, CreatedAt = DateTime.Now },
            new Product { Id = 5, Nome = "Moletom Preto", Preco = 129.90m, Imagem = "moletom_preto.jpg", CategoriaId = 3, UserId = adminUser.Id, CreatedAt = DateTime.Now }
        };

        builder.Entity<Product>().HasData(products);
    }
}
