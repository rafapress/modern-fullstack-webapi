namespace Press.WebApi.Controllers;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Press.WebApi.Domain.Entities;
using Press.WebApi.Domain.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public record LoginRequest(string Email, string Password);
public record LoginResponse(string AccessToken, object User);

[ApiController]
[Route("api/[controller]")]
[Tags("Autenticação")]
public class AuthController(IUsers users, IConfiguration config) : ControllerBase
{

  [HttpPost("login")]
  public async Task Login([FromBody] LoginRequest request)
  {

    var allUsers  = await users.GetAllAsync();
    var user      = allUsers.FirstOrDefault(u => u.Email == request.Email);

    if (user is null || user.Password != request.Password)
    {

      Response.StatusCode = StatusCodes.Status202Accepted;

      await Response.WriteAsJsonAsync(new
      {
        title   = "Falha na Autenticação",
        status  = "INVALID_CREDENTIALS",
        detail  = "E-mail ou senha inválidos."
      });

      return;

    }

    var jwtSettings = config.GetSection("JwtSettings");
    var secretKey   = jwtSettings["SecretKey"] ?? throw new InvalidOperationException("SecretKey não encontrada.");
    var key         = Encoding.UTF8.GetBytes(secretKey);

    var claims = new List<Claim>
    {
      new(ClaimTypes.Name, user.Name),
      new(ClaimTypes.Email, user.Email),
      new("UserId", user.Id.ToString())
    };

    var tokenDescriptor = new SecurityTokenDescriptor
    {
      Subject             = new ClaimsIdentity(claims),
      Expires             = DateTime.UtcNow.AddHours(3),
      Issuer              = jwtSettings["Issuer"],
      Audience            = jwtSettings["Audience"],
      SigningCredentials  = new SigningCredentials(
              new SymmetricSecurityKey(key),
              SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler      = new JwtSecurityTokenHandler();
    var token             = tokenHandler.CreateToken(tokenDescriptor);

    Response.StatusCode   = StatusCodes.Status200OK;
    await Response.WriteAsJsonAsync(new
    {
      AccessToken = tokenHandler.WriteToken(token),
      User        = new { user.Id, user.Name, user.Email }
    });

  }

}