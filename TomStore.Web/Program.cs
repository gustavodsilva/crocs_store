using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using TomStore.Application.Interfaces;
using TomStore.Application.Services;
using TomStore.Domain.Entities;
using TomStore.Infrastructure.Data;
using TomStore.Infrastructure.Repositories;
using TomStore.Infrastructure.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Configure Entity Framework
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"),
    b => b.MigrationsAssembly("TomStore.Infrastructure")));

// Configure ASP.NET Core Identity
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure Cookie Authentication
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.Cookie.HttpOnly = true;
    options.ExpireTimeSpan = TimeSpan.FromHours(24);
    options.SlidingExpiration = true;
});

// === DOMAIN LAYER INTERFACES ===
// (No direct registrations - interfaces are defined here but implemented in other layers)

// === APPLICATION LAYER ===
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IProductService, ProductService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();

// === INFRASTRUCTURE LAYER ===
// Repositories
builder.Services.AddScoped<TomStore.Domain.Interfaces.IUserRepository, TomStore.Infrastructure.Repositories.UserRepository>();
builder.Services.AddScoped<TomStore.Domain.Interfaces.IProductRepository, TomStore.Infrastructure.Repositories.ProductRepository>();
builder.Services.AddScoped<TomStore.Domain.Interfaces.ICategoryRepository, TomStore.Infrastructure.Repositories.CategoryRepository>();

// Services
builder.Services.AddScoped<TomStore.Infrastructure.Services.IUploadService, TomStore.Infrastructure.Services.UploadService>();

// Add HttpContextAccessor for services that need it
builder.Services.AddHttpContextAccessor();

// Add HttpClient for ViaCEP API
builder.Services.AddHttpClient();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "admin",
    pattern: "{area:exists=false}/{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "admin_default",
    pattern: "{area:Admin}/{controller=Dashboard}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
