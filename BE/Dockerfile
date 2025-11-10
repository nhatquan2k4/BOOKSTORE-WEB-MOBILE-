FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["Core/BookStore.API/BookStore.API.csproj", "Core/BookStore.API/"]
COPY ["Core/BookStore.Application/BookStore.Application.csproj", "Core/BookStore.Application/"]
COPY ["Core/BookStore.Domain/BookStore.Domain.csproj", "Core/BookStore.Domain/"]
COPY ["Core/BookStore.Infrastructure/BookStore.Infrastructure.csproj", "Core/BookStore.Infrastructure/"]
COPY ["BookStore.Shared/BookStore.Shared.csproj", "BookStore.Shared/"]

RUN dotnet restore "Core/BookStore.API/BookStore.API.csproj"

COPY . .

WORKDIR "/src/Core/BookStore.API"
RUN dotnet build "BookStore.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "BookStore.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

EXPOSE 8080
EXPOSE 8081

COPY --from=publish /app/publish .

ENTRYPOINT ["dotnet", "BookStore.API.dll"]
