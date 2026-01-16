namespace Press.WebApi.Infrastructure.Data.Repositories;

using Microsoft.EntityFrameworkCore;
using Press.WebApi.Domain.Entities;
using Press.WebApi.Domain.Interfaces;
using Press.WebApi.Infrastructure.Data;

public class UsersRepository(PressDbContext context) : IUsers
{
	public async Task<IReadOnlyCollection<User>> GetAllAsync() =>
			await context.Users.AsNoTracking().ToListAsync();

	public async Task<User?> GetByIdAsync(int id) =>
			await context.Users.FindAsync(id);

	public async Task<User> AddAsync(User user)
	{
		context.Users.Add(user);
		await context.SaveChangesAsync();
		return user;
	}

	public async Task<bool> UpdateAsync(User user)
	{
		context.Users.Update(user);
		return await context.SaveChangesAsync() > 0;
	}

	public async Task<bool> DeleteAsync(int id)
	{
		return await context.Users
				.Where(u => u.Id == id)
				.ExecuteDeleteAsync() > 0;
	}

}