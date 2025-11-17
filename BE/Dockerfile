FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj files trước để cache restore
COPY Core/BookStore.API/BookStore.API.csproj Core/BookStore.API/
COPY Core/BookStore.Application/BookStore.Application.csproj Core/BookStore.Application/
COPY Core/BookStore.Domain/BookStore.Domain.csproj Core/BookStore.Domain/
COPY Core/BookStore.Infrastructure/BookStore.Infrastructure.csproj Core/BookStore.Infrastructure/
COPY Core/BookStore.Tests/BookStore.Tests.csproj Core/BookStore.Tests/
COPY BookStore.Shared/BookStore.Shared.csproj BookStore.Shared/

# Restore dependencies
RUN dotnet restore Core/BookStore.API/BookStore.API.csproj

# Copy toàn bộ source
COPY . .

# Build solution (không publish)
RUN dotnet build Core/BookStore.API/BookStore.API.csproj -c Release --no-restore

# Run unit tests
RUN dotnet test Core/BookStore.Tests/BookStore.Tests.csproj --no-build --logger:trx

# PUBLISH #
FROM build AS publish
WORKDIR /src/Core/BookStore.API
RUN dotnet publish BookStore.API.csproj -c Release -o /app/publish /p:UseAppHost=false

# RUNTIME #
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Expose API ports
EXPOSE 8080
EXPOSE 8081

# Copy publish output
COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "BookStore.API.dll"]
