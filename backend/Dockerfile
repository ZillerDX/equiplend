# Use .NET 10 SDK for building
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["EquipLend.Api/EquipLend.Api.csproj", "EquipLend.Api/"]
RUN dotnet restore "EquipLend.Api/EquipLend.Api.csproj"

# Copy everything and publish release build
COPY . .
WORKDIR "/src/EquipLend.Api"
RUN dotnet publish "EquipLend.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime image
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

# Railway provides PORT dynamically
ENV PORT=5080
ENV ASPNETCORE_URLS=http://+:${PORT}
EXPOSE 5080

ENTRYPOINT ["dotnet", "EquipLend.Api.dll"]
