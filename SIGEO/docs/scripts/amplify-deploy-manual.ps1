# Deploy manual do SIGEO no AWS Amplify (upload do zip do build)
$AppId = "dlfqr6sbjb6zp"
$BranchName = "main"
$ZipPath = "d:\SERVIDOR\SISGEO\SIGEOV2\SIGEO\dist-sigeo.zip"

if (-not (Test-Path $ZipPath)) {
    Write-Host "Crie o zip antes: cd SIGEO; Compress-Archive -Path dist\* -DestinationPath dist-sigeo.zip -Force"
    exit 1
}

$deploy = aws amplify create-deployment --app-id $AppId --branch-name $BranchName --output json
$obj = $deploy | ConvertFrom-Json
$url = $obj.zipUploadUrl
$jobId = $obj.jobId

Write-Host "Enviando zip (job $jobId)..."
Invoke-WebRequest -Uri $url -Method Put -InFile $ZipPath -ContentType "application/zip" -UseBasicParsing | Out-Null

Write-Host "Iniciando deploy..."
aws amplify start-deployment --app-id $AppId --branch-name $BranchName --job-id $jobId

Write-Host "Deploy enviado. Acompanhe no Console Amplify: https://us-east-1.console.aws.amazon.com/amplify/home?region=us-east-1#/$AppId/main/1"
