namespace Press.WebApi.Domain.Interfaces;

using Press.WebApi.Domain.Entities;

public interface IUsers
{
	Task<IReadOnlyCollection<User>> GetAllAsync();
	Task<User?> GetByIdAsync(int id);
	Task<User> AddAsync(User user);
	Task<bool> UpdateAsync(User user);
	Task<bool> DeleteAsync(int id);
}