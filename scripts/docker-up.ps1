# Sobe postgres + API. Use --minio para incluir MinIO.
param([switch]$Minio)
$env:COMPOSE_PROFILES = if ($Minio) { "minio" } else { "" }
docker compose up -d
Write-Host "Postgres: localhost:5432 | API: http://localhost:3000 | Swagger: http://localhost:3000/api-docs"
