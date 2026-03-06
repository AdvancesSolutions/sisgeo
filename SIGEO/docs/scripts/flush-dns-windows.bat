@echo off
REM SIGEO v2 - Limpa cache DNS no Windows (corrige ERR_NAME_NOT_RESOLVED após criar registro)
echo Limpando cache DNS...
ipconfig /flushdns
echo.
echo Concluido. Feche e abra o navegador e tente de novo:
echo   https://api.sigeo.advances.com.br/status
echo.
echo Se ainda falhar, use DNS do Google: Configuracoes ^> Rede ^> Alterar opcoes do adaptador ^> IPv4 ^> DNS: 8.8.8.8
pause
