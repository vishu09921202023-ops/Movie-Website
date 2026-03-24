@echo off
cd /d "c:\Users\nawar\Downloads\Movie-Website\frontend"
if exist .next (
  for /d %%i in (.next\*) do rd /s /q "%%i" 2>nul
  del /q .next\* 2>nul
)
npx next dev --port 3001
pause
