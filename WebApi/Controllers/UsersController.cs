namespace Press.WebApi.Controllers;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Press.WebApi.Domain.Entities;
using Press.WebApi.Domain.Interfaces;


[ApiController]
[Route("api/[controller]")]
[Authorize]
[Tags("Gestão de Usuários")]
public class UsersController(IUsers users) : ControllerBase
{
	// GET /api/users
	[HttpGet]
	public async Task<IActionResult> GetAll()
	{

		var data = await users.GetAllAsync();

		var response = data.Select(u => new
		{
			u.Id,
			u.Name,
			u.Email,
			u.CPF,
			u.RG,
			u.Phone,
			u.Address,
			u.Number,
			u.District,
			u.City,
			u.FU,
			u.CreatedAt,
			u.UpdatedAt
		});

		return Ok(response);

	}

	// GET /api/users/{id}
	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(int id)
	{

		var user = await users.GetByIdAsync(id);

		if (user is null)
			return NotFound(new { Message = "Usuário não encontrado" });

		return Ok(new
		{
			user.Id,
			user.Name,
			user.Email,
			user.CPF,
			user.RG,
			user.Phone,
			user.Address,
			user.Number,
			user.District,
			user.City,
			user.FU,
			user.CreatedAt,
			user.UpdatedAt
		});

	}

	// POST /api/users
	[HttpPost]
	[AllowAnonymous]
	public async Task<IActionResult> Create([FromBody] User user)
	{

		var created = await users.AddAsync(user);

		return CreatedAtAction(nameof(GetById), new { id = created.Id }, new
		{
			created.Id,
			created.Name,
			created.Email
		});

	}

	// PUT /api/users/{id}
	[HttpPut("{id}")]
	public async Task<IActionResult> Update(int id, [FromBody] User user)
	{

		if (id != user.Id)
			return BadRequest(new { Message = "Inconsistência de valor do ID" });

		return await users.UpdateAsync(user)
						? Ok(new { Message = "Usuário atualizado com sucesso" })
						: NotFound(new { Message = "Usuário não encontrado" });

	}

	// DELETE /api/users/{id}
	[HttpDelete("{id}")]
	public async Task<IActionResult> Delete(int id)
	{

		return await users.DeleteAsync(id)
						? Ok(new { Message = "Usuário excluído com sucesso" })
						: NotFound(new { Message = "Usuário não encontrado" });

	}

}