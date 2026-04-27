using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using TomStore.Application.DTOs;
using TomStore.Application.Interfaces;
using TomStore.Domain.Entities;

namespace TomStore.Web.Controllers;

public class AccountController : Controller
{
    private readonly IUserService _userService;
    private readonly SignInManager<User> _signInManager;
    private readonly IHttpClientFactory _httpClientFactory;

    public AccountController(
        IUserService userService,
        SignInManager<User> signInManager,
        IHttpClientFactory httpClientFactory)
    {
        _userService = userService;
        _signInManager = signInManager;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginDTO model)
    {
        if (ModelState.IsValid)
        {
            var user = await _userService.AuthenticateAsync(model.Username, model.Password);

            if (user != null)
            {
                var result = await _signInManager.PasswordSignInAsync(
                    user, model.Password, model.RememberMe, lockoutOnFailure: false);

                if (result.Succeeded)
                {
                    // Check if user is admin
                    if (await _signInManager.UserManager.IsInRoleAsync(user, "Admin"))
                    {
                        return RedirectToAction("Index", "Dashboard", new { area = "Admin" });
                    }

                    return RedirectToAction("Index", "Home");
                }

                ModelState.AddModelError(string.Empty, "Senha incorreta.");
            }
            else
            {
                ModelState.AddModelError(string.Empty, "Usuário não encontrado.");
            }
        }

        return View(model);
    }

    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterDTO model)
    {
        if (ModelState.IsValid)
        {
            // Get address from ViaCEP if CEP provided
            if (!string.IsNullOrEmpty(model.Cep))
            {
                try
                {
                    var address = await GetAddressFromCep(model.Cep.Replace("-", ""));
                    if (address == null)
                    {
                        ModelState.AddModelError(string.Empty, "CEP não encontrado.");
                        return View(model);
                    }
                    
                    // Update model with address data
                    model.Rua = address.Rua;
                    model.Bairro = address.Bairro;
                    model.Cidade = address.Cidade;
                    model.Estado = address.Estado;
                }
                catch
                {
                    ModelState.AddModelError(string.Empty, "CEP não encontrado.");
                    return View(model);
                }
            }

            // Create user entity
            var user = new User
            {
                UserName = model.Username,
                Email = model.Email,
                Nome = model.Nome,
                Telefone = model.Telefone,
                Cep = model.Cep,
                Rua = model.Rua,
                Bairro = model.Bairro,
                Cidade = model.Cidade,
                Estado = model.Estado,
                Numero = model.Numero,
                Complemento = model.Complemento,
                DataNascimento = model.DataNascimento,
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                Active = true
            };

            try
            {
                var createdUser = await _userService.RegisterAsync(user, model.Password);
                
                // Add role (you might need to implement this in UserService)
                // await _userService.AddToRoleAsync(createdUser, "Cliente");
                
                await _signInManager.SignInAsync(createdUser, isPersistent: false);
                return RedirectToAction("Index", "Home");
            }
            catch (InvalidOperationException ex)
            {
                ModelState.AddModelError(string.Empty, ex.Message);
            }
        }

        return View(model);
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Index", "Home");
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> CheckSession()
    {
        var user = await _userService.GetByIdAsync(User.Identity?.Name ?? "");
        if (user != null && user.Active)
        {
            return Json(new { 
                logged_in = true, 
                user = new { 
                    user.Id, 
                    user.Nome, 
                    user.UserName, 
                    user.Telefone, 
                    user.Email 
                } 
            });
        }

        return Json(new { logged_in = false });
    }

    private async Task<AddressDto?> GetAddressFromCep(string cep)
    {
        var httpClient = _httpClientFactory.CreateClient();
        var response = await httpClient.GetAsync($"https://viacep.com.br/ws/{cep}/json/");

        if (response.IsSuccessStatusCode)
        {
            var address = await response.Content.ReadFromJsonAsync<AddressDto>();
            return address?.Erro == true ? null : address;
        }

        return null;
    }
}

public class AddressDto
{
    public string Cep { get; set; } = string.Empty;
    public string Rua { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Cidade { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public bool Erro { get; set; }
}
