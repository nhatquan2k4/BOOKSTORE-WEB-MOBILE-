using BookStore.Application.IService.Catalog;
using BookStore.Application.Services.Catalog;
using BookStore.Domain.IRepository;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repository;
using BookStore.Infrastructure.Repository.Catalog;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using System;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// 1. Đăng ký DbContext
// ============================================
var cs = builder.Configuration.GetConnectionString("UsersDb")
         ?? throw new InvalidOperationException("Missing connection string 'UsersDb'.");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(cs));

// ============================================
// 2. Đăng ký Generic Repository
// ============================================
builder.Services.AddScoped(typeof(IGenericRepository<>), typeof(GenericRepository<>));

// ============================================
// 3. Đăng ký Repositories (Catalog)
// ============================================
builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBookFormatRepository, BookFormatRepository>();
// builder.Services.AddScoped<IBookImageRepository, BookImageRepository>();  // Uncomment khi đã tạo repository
// builder.Services.AddScoped<IBookFileRepository, BookFileRepository>();    // Uncomment khi đã tạo repository
// builder.Services.AddScoped<IBookMetadataRepository, BookMetadataRepository>(); // Uncomment khi đã tạo repository

// ============================================
// 4. Đăng ký Services (Catalog)
// ============================================
builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPublisherService, PublisherService>();
builder.Services.AddScoped<IBookService, BookService>();

// ============================================
// 5. Add Controllers
// ============================================
builder.Services.AddControllers();

// ============================================
// 6. Add Swagger/OpenAPI
// ============================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "BookStore API",
        Version = "v1",
        Description = "API quản lý cửa hàng sách",
        Contact = new OpenApiContact
        {
            Name = "BookStore Team",
            Email = "contact@bookstore.com"
        }
    });

    // Enable XML comments for Swagger (optional)
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// ============================================
// 7. CORS (nếu cần cho frontend)
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ============================================
// Configure the HTTP request pipeline
// ============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API V1");
        c.RoutePrefix = string.Empty; // Swagger UI at root: https://localhost:xxxx/
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAll");

// Enable Authentication & Authorization (nếu có)
// app.UseAuthentication();
// app.UseAuthorization();

// Map Controllers
app.MapControllers();

app.Run();