namespace Press.WebApi.Domain.Entities;

public class User
{
	public int Id { get; init; }
	public required string Name { get; set; }
	public required string Email { get; set; }
	public string? Password { get; set; } = null;
	public string? CPF { get; set; } = null;
	public string? RG { get; set; } = null;
	public string? Phone { get; set; } = null;
	public string? Address { get; set; } = null;
	public string? Number { get; set; } = null;
	public string? District { get; set; } = null;
	public string? City { get; set; } = null;
	public string? FU { get; set; } = null;
	public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
	public DateTime? UpdatedAt { get; set; }

}