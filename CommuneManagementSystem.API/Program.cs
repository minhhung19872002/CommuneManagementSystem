using Microsoft.EntityFrameworkCore;
using CommuneManagementSystem.API.Data;
using CommuneManagementSystem.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddControllers();
builder.Services.AddOpenApi();
builder.Services.AddScoped<ISystemLogService, SystemLogService>();

// SQLite + InMemory mock
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=commune.db"));

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Seed mock data
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.EnsureRuntimeSchema();
    db.Seed();
}

// Pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowReact");
app.MapControllers();

app.Run();
