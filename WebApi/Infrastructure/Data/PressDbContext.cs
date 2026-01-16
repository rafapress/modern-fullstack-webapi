namespace Press.WebApi.Infrastructure.Data;

using Microsoft.EntityFrameworkCore;
using Press.WebApi.Domain.Entities;

public class PressDbContext(DbContextOptions<PressDbContext> options) : DbContext(options)
{
	public DbSet<User> Users { get; set; } = null!;
}