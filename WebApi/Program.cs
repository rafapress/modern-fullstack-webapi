using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using Press.WebApi.Domain.Interfaces;
using Press.WebApi.Infrastructure.Data;
using Press.WebApi.Infrastructure.Data.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<PressDbContext>(options =>
		options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUsers, UsersRepository>();
builder.Services.Configure<RouteOptions>(options =>
{
	options.LowercaseUrls							= true;
	options.LowercaseQueryStrings			= true;
});

builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontend", policy =>
	{
		policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
	});
});

var jwtSettings					= builder.Configuration.GetSection("JwtSettings");
var secretKey						= jwtSettings["SecretKey"] ?? throw new InvalidOperationException("SecretKey nula");
var key									= Encoding.UTF8.GetBytes(secretKey.PadRight(32));

builder.Services.AddAuthentication(options =>
{
	options.DefaultAuthenticateScheme	= JwtBearerDefaults.AuthenticationScheme;
	options.DefaultChallengeScheme		= JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
	options.RequireHttpsMetadata			= false;
	options.SaveToken									= true;

	options.TokenValidationParameters = new TokenValidationParameters
	{
		ValidateIssuer									= true,
		ValidateAudience								= true,
		ValidateLifetime								= true,
		ValidateIssuerSigningKey				= true,
		ValidIssuer											= jwtSettings["Issuer"],
		ValidAudience										= jwtSettings["Audience"],
		IssuerSigningKey								= new SymmetricSecurityKey(key)
	};

});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddProblemDetails();

builder.Services.AddSwaggerGen(c =>
{
	c.SwaggerDoc("v1", new OpenApiInfo { Title = "Press.WebApi", Version = "v1" });

	c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
	{
		Name							= "Authorization",
		Type							= SecuritySchemeType.Http,
		Scheme						= "Bearer",
		BearerFormat			= "JWT",
		In								= ParameterLocation.Header,
		Description				= "Insira o token JWT"
	});

	c.AddSecurityRequirement((doc) => new OpenApiSecurityRequirement
	{
		{ new OpenApiSecuritySchemeReference("Bearer", doc), [] }
	});

});

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI(c =>
	{
		c.SwaggerEndpoint("/swagger/v1/swagger.json", "Press.WebApi v1");
		c.RoutePrefix = string.Empty;
	});
}

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();