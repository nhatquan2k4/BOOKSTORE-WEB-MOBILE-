using BookStore.API.Filters;
using BookStore.API.Middlewares;
using BookStore.API.BackgroundServices;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.IService.Identity.Email;
using BookStore.Application.IService.Identity.Permission;
using BookStore.Application.IService.Identity.Role;
using BookStore.Application.IService.Identity.User;
using BookStore.Application.IService.System;
using BookStore.Application.Services.System;
using BookStore.Application.Services;
using BookStore.Application.Services.Catalog;
using BookStore.Application.Services.Identity.Auth;
using BookStore.Application.Services.Identity.Permission;
using BookStore.Application.Services.Identity.Role;
using BookStore.Application.Services.Identity.User;
using BookStore.Application.Settings;
using BookStore.Domain.IRepository;
using BookStore.Domain.IRepository.Cart;
using BookStore.Domain.IRepository.Catalog;
using BookStore.Domain.IRepository.Identity;
using BookStore.Domain.IRepository.Identity.Auth;
using BookStore.Domain.IRepository.Identity.RolePermisson;
using BookStore.Domain.IRepository.Identity.User;
using BookStore.Domain.IRepository.Ordering;
using BookStore.Domain.IRepository.Payment;
using BookStore.Infrastructure.Data;
using BookStore.Infrastructure.Repositories.Cart;
using BookStore.Infrastructure.Repositories.Ordering;
using BookStore.Infrastructure.Repositories.Payment;
using BookStore.Infrastructure.Repository;
using BookStore.Infrastructure.Repository.Catalog;
using BookStore.Infrastructure.Repository.Identity;
using BookStore.Infrastructure.Repository.Identity.Auth;
using BookStore.Infrastructure.Repository.Identity.RolePermisson;
using BookStore.Infrastructure.Repository.Identity.User;
using BookStore.Infrastructure.Data.Seeders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);


var cs = builder.Configuration.GetConnectionString("UsersDb")
         ?? throw new InvalidOperationException("Missing connection string 'UsersDb'.");
builder.Services.AddDbContext<AppDbContext>(opt =>
    opt.UseSqlServer(cs));

// Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()
    ?? throw new InvalidOperationException("JWT Settings not configured");

// Configure MinIO Settings
builder.Services.Configure<MinIOSettings>(builder.Configuration.GetSection("MinIO"));

// Configure JWT Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",  // Next.js frontend URL
                "http://localhost:5173"   // Vite admin frontend URL
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Email Settings
builder.Services.Configure<BookStore.Application.Settings.EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Register Services
// MinIO Service
builder.Services.AddScoped<IMinIOService, MinIOService>();

// Auth Services
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();

// Email Services (Identity)
builder.Services.AddScoped<BookStore.Application.IService.Identity.Email.IEmailService, BookStore.Application.Services.Identity.Email.EmailService>();
builder.Services.AddScoped<IEmailVerificationService, BookStore.Application.Services.Identity.Email.EmailVerificationService>();

builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();

// User Service
builder.Services.AddScoped<BookStore.Application.IService.Identity.User.IUserService, UserService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IUserAddressService, UserAddressService>();

// Role & Permission Services
builder.Services.AddScoped<BookStore.Application.IService.Identity.Role.IRoleService, BookStore.Application.Services.Identity.Role.RoleService>();
builder.Services.AddScoped<BookStore.Application.IService.Identity.Permission.IPermissionService, BookStore.Application.Services.Identity.Permission.PermissionService>();

// Register Repositories
// User & Auth
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IUserAddressRepository, UserAddressRepository>();
builder.Services.AddScoped<IUserDeviceRepository, UserDeviceRepository>();

// Role & Permission
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();

// Tokens
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

// Add Controllers
builder.Services.AddControllers();


builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBookFormatRepository, BookFormatRepository>();
builder.Services.AddScoped<IBookImageRepository, BookImageRepository>();
// builder.Services.AddScoped<IBookFileRepository, BookFileRepository>();    // Uncomment khi đã tạo repository
// builder.Services.AddScoped<IBookMetadataRepository, BookMetadataRepository>(); // Uncomment khi đã tạo repository


builder.Services.AddScoped<IAuthorService, AuthorService>();
builder.Services.AddScoped<ICategoryService, CategoryService>();
builder.Services.AddScoped<IPublisherService, PublisherService>();
builder.Services.AddScoped<IBookService, BookService>();
builder.Services.AddScoped<IBookImageService, BookImageService>();


// Ordering Repositories
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
builder.Services.AddScoped<IOrderStatusLogRepository, OrderStatusLogRepository>();
builder.Services.AddScoped<IRefundRepository, RefundRepository>();

// Payment Repository
builder.Services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();

//Cart Repositories
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();

// Wishlist Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.Catalog.IWishlistRepository, BookStore.Infrastructure.Repositories.Catalog.WishlistRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Catalog.IWishlistService, BookStore.Application.Services.Catalog.WishlistService>();

// Shipping Repositories
builder.Services.AddScoped<BookStore.Domain.IRepository.Shipping.IShipperRepository, BookStore.Infrastructure.Repositories.Shipping.ShipperRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Shipping.IShipmentRepository, BookStore.Infrastructure.Repositories.Shipping.ShipmentRepository>();

// Inventory Repositories
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IWarehouseRepository, BookStore.Infrastructure.Repositories.Inventory.WarehouseRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IPriceRepository, BookStore.Infrastructure.Repositories.Inventory.PriceRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IStockItemRepository, BookStore.Infrastructure.Repositories.Inventory.StockItemRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IInventoryTransactionRepository, BookStore.Infrastructure.Repositories.Inventory.InventoryTransactionRepository>();

// Checkout Service
builder.Services.AddScoped<BookStore.Application.IService.Checkout.ICheckoutService, BookStore.Application.Services.Checkout.CheckoutService>();

// Ordering, Payment & Cart Services
builder.Services.AddScoped<BookStore.Application.IService.Ordering.IOrderService, BookStore.Application.Services.Ordering.OrderService>();
builder.Services.AddScoped<BookStore.Application.IService.Payment.IPaymentService, BookStore.Application.Services.Payment.PaymentService>();
builder.Services.AddScoped<BookStore.Application.IService.Cart.ICartService, BookStore.Application.Services.Cart.CartService>();

// Shipping Services
builder.Services.AddScoped<BookStore.Application.IService.Shipping.IShipperService, BookStore.Application.Services.Shipping.ShipperService>();
builder.Services.AddScoped<BookStore.Application.IService.Shipping.IShipmentService, BookStore.Application.Services.Shipping.ShipmentService>();

// Inventory Services
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IWarehouseService, BookStore.Application.Services.Inventory.WarehouseService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IPriceService, BookStore.Application.Services.Inventory.PriceService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IStockItemService, BookStore.Application.Services.Inventory.StockItemService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IInventoryTransactionService, BookStore.Application.Services.Inventory.InventoryTransactionService>();

// Review Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.Review.IReviewRepository, BookStore.Infrastructure.Repositories.Review.ReviewRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Review.IReviewService, BookStore.Application.Services.Review.ReviewService>();

// Comment Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.Comment.ICommentRepository, BookStore.Infrastructure.Repositories.Comment.CommentRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Comment.ICommentService, BookStore.Application.Services.Comment.CommentService>();

// NotificationTemplate Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.System.INotificationTemplateRepository, BookStore.Infrastructure.Repositories.System.NotificationTemplateRepository>();
builder.Services.AddScoped<BookStore.Application.IService.System.INotificationTemplateService, BookStore.Application.Services.System.NotificationTemplateService>();

// Analytics Repositories
builder.Services.AddScoped<BookStore.Domain.IRepository.Analytics.IAuditLogRepository, BookStore.Infrastructure.Repositories.Analytics.AuditLogRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Analytics.IBookViewRepository, BookStore.Infrastructure.Repositories.Analytics.BookViewRepository>();

// Analytics Services
builder.Services.AddScoped<BookStore.Application.IService.Analytics.IAuditLogService, BookStore.Application.Service.Analytics.AuditLogService>();
builder.Services.AddScoped<BookStore.Application.IService.Analytics.IBookViewService, BookStore.Application.Service.Analytics.BookViewService>();
builder.Services.AddScoped<BookStore.Application.IService.Analytics.IDashboardService, BookStore.Application.Service.Analytics.DashboardService>();

// Notification Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.System.INotificationRepository, BookStore.Infrastructure.Repositories.System.NotificationRepository>();
builder.Services.AddScoped<BookStore.Application.IService.System.INotificationService, BookStore.Application.Services.System.NotificationService>();

// Event Bus (Singleton because it uses Channel)
builder.Services.AddSingleton<BookStore.Application.Services.System.IEventBus, BookStore.Application.Services.System.InMemoryEventBus>();

// Background Service for notifications
builder.Services.AddHostedService<BookStore.API.BackgroundServices.NotificationBackgroundService>();

// Rental Services (Story 18 - Ebook Rental)
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IRentalPlanRepository, BookStore.Infrastructure.Repositories.Rental.RentalPlanRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IUserSubscriptionRepository, BookStore.Infrastructure.Repositories.Rental.UserSubscriptionRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IBookRentalRepository, BookStore.Infrastructure.Repositories.Rental.BookRentalRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IRentalPlanService, BookStore.Application.Services.Rental.RentalPlanService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IUserSubscriptionService, BookStore.Application.Services.Rental.UserSubscriptionService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IBookRentalService, BookStore.Application.Services.Rental.BookRentalService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IEbookService, BookStore.Application.Services.Rental.EbookService>();

//Controller
builder.Services.AddControllers();


builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookStore API", Version = "v1" });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    // Add file upload support in Swagger
    c.OperationFilter<FileUploadOperationFilter>();
});

var app = builder.Build();

// Auto-apply database migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();

    try
    {
        var context = services.GetRequiredService<AppDbContext>();

        // Check if database exists
        var canConnect = context.Database.CanConnect();
        if (!canConnect)
        {
            logger.LogInformation("Database does not exist. Creating database and applying migrations...");
            context.Database.Migrate();
            logger.LogInformation("Database created successfully");
        }
        else
        {
            // Check for pending migrations
            var pendingMigrations = context.Database.GetPendingMigrations().ToList();
            var appliedMigrations = context.Database.GetAppliedMigrations().ToList();

            logger.LogInformation("Applied migrations: {Count}", appliedMigrations.Count);

            if (pendingMigrations.Any())
            {
                logger.LogInformation("Found {Count} pending migrations", pendingMigrations.Count);

                // Try to apply migrations, but catch specific errors
                try
                {
                    context.Database.Migrate();
                    logger.LogInformation("Database migrations applied successfully");
                }
                catch (Microsoft.Data.SqlClient.SqlException sqlEx) when (sqlEx.Number == 2714)
                {
                    // Error 2714: There is already an object named 'X' in the database
                    logger.LogWarning("Migration skipped - database objects already exist. This is expected if schema was created manually.");

                    // Manually mark migration as applied
                    var migrationId = pendingMigrations.First();
                    var productVersion = typeof(Microsoft.EntityFrameworkCore.DbContext).Assembly
                        .GetCustomAttributes(typeof(System.Reflection.AssemblyInformationalVersionAttribute), false)
                        .OfType<System.Reflection.AssemblyInformationalVersionAttribute>()
                        .FirstOrDefault()?.InformationalVersion ?? "8.0.0";

                    var sql = "INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ({0}, {1})";
                    context.Database.ExecuteSqlRaw(sql, migrationId, productVersion);

                    logger.LogInformation("Migration {MigrationId} marked as applied", migrationId);
                }
            }
            else
            {
                logger.LogInformation("Database is up to date. No pending migrations.");
            }
        }

        // Seed all data
        try
        {
            logger.LogInformation("Starting database seeding...");
            await DatabaseSeeder.SeedAllAsync(context);
            logger.LogInformation("✅ Database seeded successfully!");
        }
        catch (Exception seedEx)
        {
            logger.LogError(seedEx, "❌ An error occurred while seeding database");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while managing database migrations");
        logger.LogWarning("Continuing application startup despite migration error");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API V1");
        c.RoutePrefix = "swagger"; // Swagger UI at /swagger
    });
}

// Only use HTTPS redirection in production
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

// Enable CORS (must be before Authentication & Authorization)
app.UseCors("AllowFrontend");

// Exception handling middleware
app.UseMiddleware<ExceptionMiddleware>();

// Add Authentication & Authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Map Controllers
app.MapControllers();

app.Run();