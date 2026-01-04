using BookStore.Application.IService.ChatBot;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace BookStore.API.BackgroundServices
{

    public class BookCacheInitializerService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<BookCacheInitializerService> _logger;

        public BookCacheInitializerService(
            IServiceProvider serviceProvider,
            ILogger<BookCacheInitializerService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("[BookCacheInitializer] Starting cache initialization...");

            try
            {
                // Wait a bit for the application to fully start
                await Task.Delay(TimeSpan.FromSeconds(2), stoppingToken);

                using var scope = _serviceProvider.CreateScope();
                var cacheService = scope.ServiceProvider.GetRequiredService<IBookDataCacheService>();

                await cacheService.LoadCacheAsync();

                _logger.LogInformation("[BookCacheInitializer] Cache initialization completed successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "[BookCacheInitializer] Failed to initialize cache");
            }

            // Optional: Schedule periodic cache refresh (e.g., every hour)
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);

                    _logger.LogInformation("[BookCacheInitializer] Starting periodic cache refresh...");

                    using var scope = _serviceProvider.CreateScope();
                    var cacheService = scope.ServiceProvider.GetRequiredService<IBookDataCacheService>();

                    await cacheService.RefreshCacheAsync();

                    _logger.LogInformation("[BookCacheInitializer] Periodic cache refresh completed");
                }
                catch (OperationCanceledException)
                {
                    // Normal during shutdown
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "[BookCacheInitializer] Failed to refresh cache");
                }
            }
        }
    }
}
