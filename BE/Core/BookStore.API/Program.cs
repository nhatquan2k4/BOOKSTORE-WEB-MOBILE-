using BookStore.API.BackgroundServices;
using BookStore.API.Filters;
using BookStore.API.Middlewares;
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

// builder.Services.AddScoped<ISignalRService, SignalRService>(); // Commented out - classes do not exist

// Configure MinIO Settings
builder.Services.Configure<MinIOSettings>(builder.Configuration.GetSection("MinIO"));

// Configure Payment Settings
builder.Services.Configure<BookStore.API.Settings.PaymentSettings>(builder.Configuration.GetSection("PaymentSettings"));

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

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            var endpoint = context.HttpContext.GetEndpoint();
            var allowAnonymous = endpoint?.Metadata?.GetMetadata<Microsoft.AspNetCore.Authorization.IAllowAnonymous>() != null;

            if (allowAnonymous)
            {
                context.NoResult();
                context.HttpContext.User = new System.Security.Claims.ClaimsPrincipal(new System.Security.Claims.ClaimsIdentity());
                return Task.CompletedTask;
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
        policy.SetIsOriginAllowed(origin => true) // <--- QUAN TRỌNG: Cho phép mọi Origin khi Dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // <--- QUAN TRỌNG: Cần thiết cho SignalR
    });
});

// Configure Email Settings
builder.Services.Configure<BookStore.Application.Settings.EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Register Services
builder.Services.AddScoped<IMinIOService, MinIOService>();
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddScoped<IPasswordService, PasswordService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<BookStore.Application.IService.Identity.Email.IEmailService, BookStore.Application.Services.Identity.Email.EmailService>();
builder.Services.AddScoped<IEmailVerificationService, BookStore.Application.Services.Identity.Email.EmailVerificationService>();
builder.Services.AddScoped<IPasswordResetService, PasswordResetService>();
builder.Services.AddScoped<BookStore.Application.IService.Identity.User.IUserService, UserService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IUserAddressService, UserAddressService>();
builder.Services.AddScoped<BookStore.Application.IService.Identity.Role.IRoleService, BookStore.Application.Services.Identity.Role.RoleService>();
builder.Services.AddScoped<BookStore.Application.IService.Identity.Permission.IPermissionService, BookStore.Application.Services.Identity.Permission.PermissionService>();

// Register Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IUserRoleRepository, UserRoleRepository>();
builder.Services.AddScoped<IUserProfileRepository, UserProfileRepository>();
builder.Services.AddScoped<IUserAddressRepository, UserAddressRepository>();
builder.Services.AddScoped<IUserDeviceRepository, UserDeviceRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<IPermissionRepository, PermissionRepository>();
builder.Services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
builder.Services.AddScoped<IRefreshTokenRepository, RefreshTokenRepository>();
builder.Services.AddScoped<IEmailVerificationTokenRepository, EmailVerificationTokenRepository>();
builder.Services.AddScoped<IPasswordResetTokenRepository, PasswordResetTokenRepository>();

// Add Controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
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

// Ordering & Payment Repositories
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
builder.Services.AddScoped<IOrderStatusLogRepository, OrderStatusLogRepository>();
builder.Services.AddScoped<IRefundRepository, RefundRepository>();
builder.Services.AddScoped<IPaymentTransactionRepository, PaymentTransactionRepository>();

// Cart
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();

// Wishlist
builder.Services.AddScoped<BookStore.Domain.IRepository.Catalog.IWishlistRepository, BookStore.Infrastructure.Repositories.Catalog.WishlistRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Catalog.IWishlistService, BookStore.Application.Services.Catalog.WishlistService>();

// Shipping
builder.Services.AddScoped<BookStore.Domain.IRepository.Shipping.IShipperRepository, BookStore.Infrastructure.Repositories.Shipping.ShipperRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Shipping.IShipmentRepository, BookStore.Infrastructure.Repositories.Shipping.ShipmentRepository>();

// Inventory
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IWarehouseRepository, BookStore.Infrastructure.Repositories.Inventory.WarehouseRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IPriceRepository, BookStore.Infrastructure.Repositories.Inventory.PriceRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IStockItemRepository, BookStore.Infrastructure.Repositories.Inventory.StockItemRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Inventory.IInventoryTransactionRepository, BookStore.Infrastructure.Repositories.Inventory.InventoryTransactionRepository>();

// Services
builder.Services.AddScoped<BookStore.Application.IService.Checkout.ICheckoutService, BookStore.Application.Services.Checkout.CheckoutService>();
builder.Services.AddScoped<BookStore.Application.IService.Ordering.IOrderService, BookStore.Application.Services.Ordering.OrderService>();
builder.Services.AddScoped<BookStore.Application.IService.Payment.IPaymentService, BookStore.Application.Services.Payment.PaymentService>();
builder.Services.AddScoped<BookStore.Application.IService.Cart.ICartService, BookStore.Application.Services.Cart.CartService>();
builder.Services.AddScoped<BookStore.Application.IService.Shipping.IShipperService, BookStore.Application.Services.Shipping.ShipperService>();
builder.Services.AddScoped<BookStore.Application.IService.Shipping.IShipmentService, BookStore.Application.Services.Shipping.ShipmentService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IWarehouseService, BookStore.Application.Services.Inventory.WarehouseService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IPriceService, BookStore.Application.Services.Inventory.PriceService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IStockItemService, BookStore.Application.Services.Inventory.StockItemService>();
builder.Services.AddScoped<BookStore.Application.IService.Inventory.IInventoryTransactionService, BookStore.Application.Services.Inventory.InventoryTransactionService>();

// Review & Comment
builder.Services.AddScoped<BookStore.Domain.IRepository.Review.IReviewRepository, BookStore.Infrastructure.Repositories.Review.ReviewRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Review.IReviewService, BookStore.Application.Services.Review.ReviewService>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Comment.ICommentRepository, BookStore.Infrastructure.Repositories.Comment.CommentRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Comment.ICommentService, BookStore.Application.Services.Comment.CommentService>();

// Notifications
builder.Services.AddScoped<BookStore.Domain.IRepository.System.INotificationTemplateRepository, BookStore.Infrastructure.Repositories.System.NotificationTemplateRepository>();
builder.Services.AddScoped<BookStore.Application.IService.System.INotificationTemplateService, BookStore.Application.Services.System.NotificationTemplateService>();
builder.Services.AddScoped<BookStore.Domain.IRepository.System.INotificationRepository, BookStore.Infrastructure.Repositories.System.NotificationRepository>();
builder.Services.AddScoped<BookStore.Application.IService.System.INotificationService, BookStore.Application.Services.System.NotificationService>();

// Analytics
builder.Services.AddScoped<BookStore.Domain.IRepository.Analytics.IAuditLogRepository, BookStore.Infrastructure.Repositories.Analytics.AuditLogRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Analytics.IBookViewRepository, BookStore.Infrastructure.Repositories.Analytics.BookViewRepository>();
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

// SignalR
builder.Services.AddSignalR();

// Background Service
builder.Services.AddHostedService<BookStore.API.BackgroundServices.NotificationBackgroundService>();

// Rental
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IRentalPlanRepository, BookStore.Infrastructure.Repositories.Rental.RentalPlanRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IUserSubscriptionRepository, BookStore.Infrastructure.Repositories.Rental.UserSubscriptionRepository>();
builder.Services.AddScoped<BookStore.Domain.IRepository.Rental.IBookRentalRepository, BookStore.Infrastructure.Repositories.Rental.BookRentalRepository>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IRentalPlanService, BookStore.Application.Services.Rental.RentalPlanService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IUserSubscriptionService, BookStore.Application.Services.Rental.UserSubscriptionService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IBookRentalService, BookStore.Application.Services.Rental.BookRentalService>();
builder.Services.AddScoped<BookStore.Application.IService.Rental.IEbookService, BookStore.Application.Services.Rental.EbookService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "BookStore API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme.",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
    c.OperationFilter<FileUploadOperationFilter>();
});



builder.Services.Configure<GeminiOptions>(
    builder.Configuration.GetSection("Gemini"));

var app = builder.Build();

// Auto-apply database migrations
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    int maxRetries = 10;
    int delaySeconds = 5;

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            var context = services.GetRequiredService<AppDbContext>();
            if (context.Database.CanConnect())
            {
                var pendingMigrations = context.Database.GetPendingMigrations().ToList();
                if (pendingMigrations.Any())
                {
                    try 
                    {
                        context.Database.Migrate();
                        logger.LogInformation("Database migrations applied successfully.");
                    }
                    catch (Microsoft.Data.SqlClient.SqlException sqlEx) when (sqlEx.Number == 2714)
                    {
                        logger.LogWarning("Migration skipped (objects already exist).");
                    }
                }
            }
            else
            {
                context.Database.Migrate();
                logger.LogInformation("Database created and migrated successfully.");
            }

            await DatabaseSeeder.SeedAllAsync(context);
            logger.LogInformation("Database seeded successfully!");
            break; 
        }
        catch (Exception ex)
        {
            if (i == maxRetries - 1) throw; 
            logger.LogWarning($"Database not ready yet. Retrying in {delaySeconds} seconds...");
            Thread.Sleep(delaySeconds * 1000);
        }
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "BookStore API V1");
        c.RoutePrefix = "swagger";
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseCors("AllowFrontend");
app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.UseStaticFiles();

// app.MapHub<NotificationHub>("/hubs/notifications"); // Commented out - NotificationHub does not exist

app.Run();