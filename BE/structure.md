BookStore.Solution/
│
├── BookStore.API/                          # Host Application Layer
│   ├── Program.cs
│   ├── appsettings.json
│   ├── Middlewares/
│   │   ├── ExceptionMiddleware.cs
│   │   └── TenantMiddleware.cs
│   ├── Extensions/
│   │   ├── ModuleExtensions.cs
│   │   └── ServiceCollectionExtensions.cs
│   └── HostedServices/
│       └── NotificationBackgroundService.cs
│
├── BookStore.Shared/                       # Shared Kernel
│   ├── BookStore.Shared.Abstractions/      # Common Interfaces & Contracts
│   │   ├── Messaging/
│   │   │   ├── ICommand.cs
│   │   │   ├── ICommandHandler.cs
│   │   │   ├── IQuery.cs
│   │   │   ├── IQueryHandler.cs
│   │   │   ├── IEvent.cs
│   │   │   └── IEventHandler.cs
│   │   ├── Modules/
│   │   │   └── IModule.cs
│   │   ├── Domain/
│   │   │   ├── IEntity.cs
│   │   │   ├── IAggregateRoot.cs
│   │   │   ├── IDomainEvent.cs
│   │   │   └── IRepository.cs
│   │   ├── Time/
│   │   │   └── IClock.cs
│   │   └── Auth/
│   │       ├── ICurrentUser.cs
│   │       └── IPermissionChecker.cs
│   │
│   ├── BookStore.Shared.Infrastructure/    # Shared Infrastructure
│   │   ├── Messaging/
│   │   │   ├── InMemoryEventBus.cs
│   │   │   └── MessageBroker.cs
│   │   ├── Database/
│   │   │   ├── BaseDbContext.cs
│   │   │   └── UnitOfWork.cs
│   │   ├── Auth/
│   │   │   ├── CurrentUserService.cs
│   │   │   └── JwtTokenService.cs
│   │   ├── Time/
│   │   │   └── Clock.cs
│   │   ├── Files/
│   │   │   ├── MinIOService.cs
│   │   │   └── IFileStorage.cs
│   │   └── Exceptions/
│   │       └── GlobalExceptionHandler.cs
│   │
│   └── BookStore.Shared.Domain/            # Common Domain Building Blocks
│       ├── Entities/
│       │   ├── Entity.cs
│       │   └── AggregateRoot.cs
│       ├── ValueObjects/
│       │   ├── Money.cs
│       │   ├── Email.cs
│       │   ├── PhoneNumber.cs
│       │   └── Address.cs
│       ├── Events/
│       │   └── DomainEvent.cs
│       ├── Exceptions/
│       │   ├── DomainException.cs
│       │   └── BusinessRuleException.cs
│       └── Results/
│           ├── Result.cs
│           └── Error.cs
│
├── Modules/                                # Business Modules
│   │
│   ├── Catalog/                           # 📚 CATALOG MODULE
│   │   ├── BookStore.Modules.Catalog.Api/
│   │   │   ├── CatalogModule.cs           # Module Registration
│   │   │   ├── Controllers/
│   │   │   │   ├── BooksController.cs
│   │   │   │   ├── CategoriesController.cs
│   │   │   │   ├── AuthorsController.cs
│   │   │   │   ├── PublishersController.cs
│   │   │   │   └── ReviewsController.cs
│   │   │   └── Permissions/
│   │   │       └── CatalogPermissions.cs
│   │   │
│   │   ├── BookStore.Modules.Catalog.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Books/
│   │   │   │   │   ├── Book.cs            # Aggregate Root
│   │   │   │   │   ├── BookImage.cs
│   │   │   │   │   ├── IBookRepository.cs
│   │   │   │   │   └── Events/
│   │   │   │   │       ├── BookCreatedEvent.cs
│   │   │   │   │       └── BookPriceChangedEvent.cs
│   │   │   │   ├── Categories/
│   │   │   │   │   ├── Category.cs
│   │   │   │   │   └── ICategoryRepository.cs
│   │   │   │   ├── Authors/
│   │   │   │   │   ├── Author.cs
│   │   │   │   │   └── IAuthorRepository.cs
│   │   │   │   ├── Publishers/
│   │   │   │   │   ├── Publisher.cs
│   │   │   │   │   └── IPublisherRepository.cs
│   │   │   │   └── Reviews/
│   │   │   │       ├── Review.cs
│   │   │   │       └── IReviewRepository.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Books/
│   │   │   │   │   ├── Commands/
│   │   │   │   │   │   ├── CreateBook/
│   │   │   │   │   │   │   ├── CreateBookCommand.cs
│   │   │   │   │   │   │   └── CreateBookCommandHandler.cs
│   │   │   │   │   │   ├── UpdateBook/
│   │   │   │   │   │   └── DeleteBook/
│   │   │   │   │   ├── Queries/
│   │   │   │   │   │   ├── GetBook/
│   │   │   │   │   │   ├── GetBooks/
│   │   │   │   │   │   └── SearchBooks/
│   │   │   │   │   └── DTOs/
│   │   │   │   │       ├── BookDto.cs
│   │   │   │   │       └── BookDetailsDto.cs
│   │   │   │   ├── Categories/
│   │   │   │   │   ├── Commands/
│   │   │   │   │   ├── Queries/
│   │   │   │   │   └── DTOs/
│   │   │   │   ├── Authors/
│   │   │   │   ├── Publishers/
│   │   │   │   └── Reviews/
│   │   │   │
│   │   │   └── Contracts/                 # Public Contracts
│   │   │       └── Events/
│   │   │           ├── BookCreatedIntegrationEvent.cs
│   │   │           └── BookPriceChangedIntegrationEvent.cs
│   │   │
│   │   └── BookStore.Modules.Catalog.Infrastructure/
│   │       ├── Database/
│   │       │   ├── CatalogDbContext.cs
│   │       │   ├── Configurations/
│   │       │   │   ├── BookConfiguration.cs
│   │       │   │   ├── CategoryConfiguration.cs
│   │       │   │   └── AuthorConfiguration.cs
│   │       │   └── Migrations/
│   │       ├── Repositories/
│   │       │   ├── BookRepository.cs
│   │       │   ├── CategoryRepository.cs
│   │       │   └── AuthorRepository.cs
│   │       └── EventHandlers/
│   │           └── BookCreatedEventHandler.cs
│   │
│   ├── Identity/                          # 👤 IDENTITY MODULE
│   │   ├── BookStore.Modules.Identity.Api/
│   │   │   ├── IdentityModule.cs
│   │   │   └── Controllers/
│   │   │       ├── AuthController.cs
│   │   │       ├── UsersController.cs
│   │   │       ├── RolesController.cs
│   │   │       └── PermissionsController.cs
│   │   │
│   │   ├── BookStore.Modules.Identity.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Users/
│   │   │   │   │   ├── User.cs
│   │   │   │   │   ├── UserProfile.cs
│   │   │   │   │   ├── IUserRepository.cs
│   │   │   │   │   └── Events/
│   │   │   │   │       └── UserRegisteredEvent.cs
│   │   │   │   ├── Roles/
│   │   │   │   │   ├── Role.cs
│   │   │   │   │   └── IRoleRepository.cs
│   │   │   │   ├── Permissions/
│   │   │   │   │   ├── Permission.cs
│   │   │   │   │   └── IPermissionRepository.cs
│   │   │   │   └── RefreshTokens/
│   │   │   │       ├── RefreshToken.cs
│   │   │   │       └── IRefreshTokenRepository.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Auth/
│   │   │   │   │   ├── Commands/
│   │   │   │   │   │   ├── Login/
│   │   │   │   │   │   ├── Register/
│   │   │   │   │   │   ├── RefreshToken/
│   │   │   │   │   │   └── Logout/
│   │   │   │   │   └── DTOs/
│   │   │   │   ├── Users/
│   │   │   │   ├── Roles/
│   │   │   │   └── Permissions/
│   │   │   │
│   │   │   └── Contracts/
│   │   │       └── Events/
│   │   │           └── UserRegisteredIntegrationEvent.cs
│   │   │
│   │   └── BookStore.Modules.Identity.Infrastructure/
│   │       ├── Database/
│   │       │   ├── IdentityDbContext.cs
│   │       │   └── Configurations/
│   │       ├── Repositories/
│   │       └── Services/
│   │           ├── PasswordHasher.cs
│   │           └── EmailService.cs
│   │
│   ├── Orders/                            # 📦 ORDERS MODULE
│   │   ├── BookStore.Modules.Orders.Api/
│   │   │   ├── OrdersModule.cs
│   │   │   └── Controllers/
│   │   │       ├── OrdersController.cs
│   │   │       └── OrderHistoryController.cs
│   │   │
│   │   ├── BookStore.Modules.Orders.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Orders/
│   │   │   │   │   ├── Order.cs            # Aggregate Root
│   │   │   │   │   ├── OrderItem.cs
│   │   │   │   │   ├── OrderStatus.cs
│   │   │   │   │   ├── IOrderRepository.cs
│   │   │   │   │   └── Events/
│   │   │   │   │       ├── OrderCreatedEvent.cs
│   │   │   │   │       ├── OrderConfirmedEvent.cs
│   │   │   │   │       └── OrderCancelledEvent.cs
│   │   │   │   └── OrderHistory/
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateOrder/
│   │   │   │   │   ├── ConfirmOrder/
│   │   │   │   │   └── CancelOrder/
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetOrder/
│   │   │   │   │   └── GetOrderHistory/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │       └── Events/
│   │   │           ├── OrderCreatedIntegrationEvent.cs
│   │   │           └── OrderConfirmedIntegrationEvent.cs
│   │   │
│   │   └── BookStore.Modules.Orders.Infrastructure/
│   │       ├── Database/
│   │       │   ├── OrdersDbContext.cs
│   │       │   └── Configurations/
│   │       └── Repositories/
│   │
│   ├── Cart/                              # 🛒 CART MODULE
│   │   ├── BookStore.Modules.Cart.Api/
│   │   │   ├── CartModule.cs
│   │   │   └── Controllers/
│   │   │       └── CartController.cs
│   │   │
│   │   ├── BookStore.Modules.Cart.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── ShoppingCart.cs        # Aggregate Root
│   │   │   │   ├── CartItem.cs
│   │   │   │   ├── ICartRepository.cs
│   │   │   │   └── Events/
│   │   │   │       ├── ItemAddedToCartEvent.cs
│   │   │   │       └── CartClearedEvent.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── AddItemToCart/
│   │   │   │   │   ├── RemoveItemFromCart/
│   │   │   │   │   └── ClearCart/
│   │   │   │   ├── Queries/
│   │   │   │   │   └── GetCart/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │
│   │   └── BookStore.Modules.Cart.Infrastructure/
│   │       ├── Database/
│   │       │   └── CartDbContext.cs
│   │       └── Repositories/
│   │
│   ├── Inventory/                         # 📊 INVENTORY MODULE
│   │   ├── BookStore.Modules.Inventory.Api/
│   │   │   ├── InventoryModule.cs
│   │   │   └── Controllers/
│   │   │       ├── StockController.cs
│   │   │       ├── WarehousesController.cs
│   │   │       └── PricesController.cs
│   │   │
│   │   ├── BookStore.Modules.Inventory.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Stock/
│   │   │   │   │   ├── Stock.cs
│   │   │   │   │   ├── StockMovement.cs
│   │   │   │   │   ├── IStockRepository.cs
│   │   │   │   │   └── Events/
│   │   │   │   ├── Warehouses/
│   │   │   │   │   ├── Warehouse.cs
│   │   │   │   │   └── IWarehouseRepository.cs
│   │   │   │   └── Pricing/
│   │   │   │       ├── Price.cs
│   │   │   │       └── IPriceRepository.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Stock/
│   │   │   │   ├── Warehouses/
│   │   │   │   └── Pricing/
│   │   │   │
│   │   │   └── Contracts/
│   │   │       └── Events/
│   │   │           ├── StockUpdatedIntegrationEvent.cs
│   │   │           └── LowStockAlertIntegrationEvent.cs
│   │   │
│   │   └── BookStore.Modules.Inventory.Infrastructure/
│   │       ├── Database/
│   │       │   └── InventoryDbContext.cs
│   │       ├── Repositories/
│   │       └── EventHandlers/
│   │           └── OrderCreatedEventHandler.cs  # Reserve stock
│   │
│   ├── Payment/                           # 💳 PAYMENT MODULE
│   │   ├── BookStore.Modules.Payment.Api/
│   │   │   ├── PaymentModule.cs
│   │   │   └── Controllers/
│   │   │       └── PaymentController.cs
│   │   │
│   │   ├── BookStore.Modules.Payment.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Payment.cs
│   │   │   │   ├── PaymentMethod.cs
│   │   │   │   ├── PaymentStatus.cs
│   │   │   │   ├── IPaymentRepository.cs
│   │   │   │   └── Events/
│   │   │   │       ├── PaymentCompletedEvent.cs
│   │   │   │       └── PaymentFailedEvent.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── ProcessPayment/
│   │   │   │   │   └── RefundPayment/
│   │   │   │   ├── Queries/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │       └── Events/
│   │   │           └── PaymentCompletedIntegrationEvent.cs
│   │   │
│   │   └── BookStore.Modules.Payment.Infrastructure/
│   │       ├── Database/
│   │       │   └── PaymentDbContext.cs
│   │       ├── Repositories/
│   │       └── PaymentGateways/
│   │           ├── IPaymentGateway.cs
│   │           ├── VNPayGateway.cs
│   │           └── MoMoGateway.cs
│   │
│   ├── Shipping/                          # 🚚 SHIPPING MODULE
│   │   ├── BookStore.Modules.Shipping.Api/
│   │   │   ├── ShippingModule.cs
│   │   │   └── Controllers/
│   │   │       └── ShippingController.cs
│   │   │
│   │   ├── BookStore.Modules.Shipping.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Shipment.cs
│   │   │   │   ├── ShippingMethod.cs
│   │   │   │   ├── TrackingInfo.cs
│   │   │   │   ├── IShipmentRepository.cs
│   │   │   │   └── Events/
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateShipment/
│   │   │   │   │   └── UpdateShipmentStatus/
│   │   │   │   ├── Queries/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │
│   │   └── BookStore.Modules.Shipping.Infrastructure/
│   │       ├── Database/
│   │       │   └── ShippingDbContext.cs
│   │       ├── Repositories/
│   │       └── EventHandlers/
│   │           └── OrderConfirmedEventHandler.cs
│   │
│   ├── Rental/                            # 📖 RENTAL MODULE (Book Rental)
│   │   ├── BookStore.Modules.Rental.Api/
│   │   │   ├── RentalModule.cs
│   │   │   └── Controllers/
│   │   │       └── RentalController.cs
│   │   │
│   │   ├── BookStore.Modules.Rental.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Rental.cs
│   │   │   │   ├── RentalItem.cs
│   │   │   │   ├── RentalStatus.cs
│   │   │   │   ├── IRentalRepository.cs
│   │   │   │   └── Events/
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── CreateRental/
│   │   │   │   │   ├── ReturnBook/
│   │   │   │   │   └── ExtendRental/
│   │   │   │   ├── Queries/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │
│   │   └── BookStore.Modules.Rental.Infrastructure/
│   │       ├── Database/
│   │       │   └── RentalDbContext.cs
│   │       └── Repositories/
│   │
│   ├── Notifications/                     # 🔔 NOTIFICATIONS MODULE
│   │   ├── BookStore.Modules.Notifications.Api/
│   │   │   ├── NotificationsModule.cs
│   │   │   └── Controllers/
│   │   │       └── NotificationsController.cs
│   │   │
│   │   ├── BookStore.Modules.Notifications.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── Notification.cs
│   │   │   │   ├── NotificationType.cs
│   │   │   │   └── INotificationRepository.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Commands/
│   │   │   │   │   ├── SendNotification/
│   │   │   │   │   └── MarkAsRead/
│   │   │   │   ├── Queries/
│   │   │   │   │   └── GetUserNotifications/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │
│   │   └── BookStore.Modules.Notifications.Infrastructure/
│   │       ├── Database/
│   │       │   └── NotificationsDbContext.cs
│   │       ├── Repositories/
│   │       ├── EventHandlers/              # Listen to all modules
│   │       │   ├── OrderCreatedEventHandler.cs
│   │       │   ├── PaymentCompletedEventHandler.cs
│   │       │   └── ShipmentStatusChangedEventHandler.cs
│   │       └── Services/
│   │           ├── EmailNotificationService.cs
│   │           └── PushNotificationService.cs
│   │
│   ├── Analytics/                         # 📈 ANALYTICS MODULE
│   │   ├── BookStore.Modules.Analytics.Api/
│   │   │   ├── AnalyticsModule.cs
│   │   │   └── Controllers/
│   │   │       ├── DashboardController.cs
│   │   │       └── ReportsController.cs
│   │   │
│   │   ├── BookStore.Modules.Analytics.Core/
│   │   │   ├── Domain/
│   │   │   │   ├── SalesMetrics.cs
│   │   │   │   ├── UserActivity.cs
│   │   │   │   └── IAnalyticsRepository.cs
│   │   │   │
│   │   │   ├── Application/
│   │   │   │   ├── Queries/
│   │   │   │   │   ├── GetSalesReport/
│   │   │   │   │   ├── GetTopSellingBooks/
│   │   │   │   │   └── GetUserStatistics/
│   │   │   │   └── DTOs/
│   │   │   │
│   │   │   └── Contracts/
│   │   │
│   │   └── BookStore.Modules.Analytics.Infrastructure/
│   │       ├── Database/
│   │       │   └── AnalyticsDbContext.cs    # Read Model
│   │       ├── Repositories/
│   │       └── EventHandlers/                # Update read models
│   │           ├── OrderCreatedEventHandler.cs
│   │           └── PaymentCompletedEventHandler.cs
│   │
│   └── Checkout/                          # 💰 CHECKOUT MODULE (Orchestration)
│       ├── BookStore.Modules.Checkout.Api/
│       │   ├── CheckoutModule.cs
│       │   └── Controllers/
│       │       └── CheckoutController.cs
│       │
│       ├── BookStore.Modules.Checkout.Core/
│       │   ├── Application/
│       │   │   ├── Commands/
│       │   │   │   └── ProcessCheckout/
│       │   │   │       ├── ProcessCheckoutCommand.cs
│       │   │   │       └── ProcessCheckoutCommandHandler.cs  # Orchestrator
│       │   │   └── DTOs/
│       │   │
│       │   └── Contracts/
│       │
│       └── BookStore.Modules.Checkout.Infrastructure/
│           └── Services/
│               └── CheckoutOrchestrator.cs    # Coordinates: Cart → Order → Payment → Shipping
│
└── Tests/
    ├── BookStore.Tests.Integration/
    │   ├── Catalog/
    │   ├── Orders/
    │   └── Checkout/
    │
    └── BookStore.Tests.Unit/
        ├── Catalog/
        ├── Orders/
        └── Identity/