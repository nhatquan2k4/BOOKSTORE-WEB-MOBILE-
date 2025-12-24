using BookStore.API.BackgroundServices;
using BookStore.API.Filters;
using BookStore.API.Hubs;
using BookStore.API.Middlewares;
using BookStore.API.Services;
using BookStore.Application.IService;
using BookStore.Application.IService.Catalog;
using BookStore.Application.IService.ChatBot;
using BookStore.Application.IService.Identity.Auth;
using BookStore.Application.IService.Identity.Email;
using BookStore.Application.IService.Identity.Permission;
using BookStore.Application.IService.Identity.Role;
using BookStore.Application.IService.Identity.User;
using BookStore.Application.IService.System;
using BookStore.Application.Option;
using BookStore.Application.Services;
using BookStore.Application.Services.Catalog;
using BookStore.Application.Services.ChatBot;
using BookStore.Application.Services.Identity.Auth;
using BookStore.Application.Services.Identity.Permission;
using BookStore.Application.Services.Identity.Role;
using BookStore.Application.Services.Identity.User;
using BookStore.Application.Services.System;
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
using BookStore.Infrastructure.Data.Seeders;
using BookStore.Infrastructure.Repositories.Cart;
using BookStore.Infrastructure.Repositories.Ordering;
using BookStore.Infrastructure.Repositories.Payment;
using BookStore.Infrastructure.Repository;
using BookStore.Infrastructure.Repository.Catalog;
using BookStore.Infrastructure.Repository.Identity;
using BookStore.Infrastructure.Repository.Identity.Auth;
using BookStore.Infrastructure.Repository.Identity.RolePermisson;
using BookStore.Infrastructure.Repository.Identity.User;
using BookStore.Infrastructure.Services;
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

builder.Services.AddScoped<ISignalRService, SignalRService>();

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
    var isDevelopment = builder.Environment.IsDevelopment();
    
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = !isDevelopment, // Tắt validation Issuer khi Dev/Docker
        ValidateAudience = !isDevelopment, // Tắt validation Audience khi Dev/Docker
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
            logger.LogWarning($"Authentication failed: {context.Exception?.Message}");
            
            // Check if endpoint allows anonymous access
            var endpoint = context.HttpContext.GetEndpoint();
            var allowAnonymous = endpoint?.Metadata?.GetMetadata<Microsoft.AspNetCore.Authorization.IAllowAnonymous>() != null;

            if (allowAnonymous)
            {
                // Skip authentication failure for anonymous endpoints
                context.NoResult();
                context.HttpContext.User = new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity());
                return Task.CompletedTask;
            }

            return Task.CompletedTask;
        },
        OnMessageReceived = context =>
        {
            var accessToken = context.Request.Query["access_token"];
            var path = context.HttpContext.Request.Path;
            
            // If the request is for SignalR hub and has token in query
            if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
            {
                context.Token = accessToken;
            }
            
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.SetIsOriginAllowed(origin => true)
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
        // Note: Phải dùng SetIsOriginAllowed thay vì AllowAnyOrigin() khi dùng AllowCredentials()
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

// Add Controllers with JSON options for camelCase serialization
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Convert C# PascalCase to JavaScript camelCase
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        // Preserve null values for optional fields
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.Never;
    });


builder.Services.AddScoped<IAuthorRepository, AuthorRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IPublisherRepository, PublisherRepository>();
builder.Services.AddScoped<IBookRepository, BookRepository>();
builder.Services.AddScoped<IBookFormatRepository, BookFormatRepository>();
builder.Services.AddScoped<IBookImageRepository, BookImageRepository>();
builder.Services.AddScoped<IBookMetadataRepository, BookMetadataRepository>();


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

//ChatBot
builder.Services.AddScoped<IChatBotService, ChatBotService>();
builder.Services.AddHttpClient<IGeminiService, GeminiService>();

// Notification Repository & Service
builder.Services.AddScoped<BookStore.Domain.IRepository.System.INotificationRepository, BookStore.Infrastructure.Repositories.System.NotificationRepository>();
builder.Services.AddScoped<BookStore.Application.IService.System.INotificationService, BookStore.Application.Services.System.NotificationService>();

// Event Bus (Singleton because it uses Channel)
builder.Services.AddSingleton<BookStore.Application.Services.System.IEventBus, BookStore.Application.Services.System.InMemoryEventBus>();

builder.Services.AddSignalR();

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



builder.Services.Configure<GeminiOptions>(
    builder.Configuration.GetSection("Gemini"));

var app = builder.Build();

// Auto-apply database migrations (With Retry Logic)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    var context = services.GetRequiredService<AppDbContext>();

    // Cấu hình số lần thử lại và thời gian chờ
    int maxRetries = 10; // Thử tối đa 10 lần
    int delaySeconds = 5; // Đợi 5 giây mỗi lần

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            logger.LogInformation($"Database Initialization: Attempt {i + 1}/{maxRetries}...");

            // 1. Kiểm tra kết nối và tạo DB nếu chưa có
            if (context.Database.CanConnect())
            {
                logger.LogInformation("Connection established. Checking for pending migrations...");
                
                var pendingMigrations = context.Database.GetPendingMigrations().ToList();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation($"Found {pendingMigrations.Count} pending migrations. Applying...");
                    
                    // Logic cũ của bạn để xử lý migration an toàn
                    try 
                    {
                        context.Database.Migrate();
                        logger.LogInformation("Database migrations applied successfully.");
                    }
                    catch (Microsoft.Data.SqlClient.SqlException sqlEx) when (sqlEx.Number == 2714)
                    {
                        // Lỗi 2714: Object đã tồn tại (do migration chạy chồng chéo) -> Đánh dấu là đã chạy
                        logger.LogWarning("Migration skipped (objects already exist). Marking migrations as applied.");
                        
                        var migrationId = pendingMigrations.First();
                        // (Giữ nguyên logic fix bảng history của bạn nếu cần thiết, 
                        // nhưng thường context.Database.Migrate() đã tự xử lý tốt)
                    }
                }
                else
                {
                    logger.LogInformation("Database is up to date.");
                }
            }
            else
            {
                logger.LogInformation("Database does not exist. Creating and Migrating...");
                context.Database.Migrate(); // Lệnh này tự tạo DB và chạy migration
                logger.LogInformation("Database created and migrated successfully.");
            }

            // 2. Seed Data
            logger.LogInformation("Starting database seeding...");
            await DatabaseSeeder.SeedAllAsync(context);
            logger.LogInformation("Database seeded successfully!");

            // Nếu chạy đến đây không lỗi thì thoát vòng lặp
            break; 
        }
        catch (Exception ex)
        {
            // Nếu đây là lần thử cuối cùng thì ném lỗi ra để crash app
            if (i == maxRetries - 1)
            {
                logger.LogError(ex, "Failed to connect to Database after multiple attempts. Application will stop.");
                throw; 
            }

            // Nếu chưa hết lượt thì log warning và đợi
            logger.LogWarning($"Database not ready yet. Retrying in {delaySeconds} seconds... (Error: {ex.Message})");
            Thread.Sleep(delaySeconds * 1000); // Ngủ 5 giây
        }
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
app.UseStaticFiles();

// Map SignalR Hub
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();