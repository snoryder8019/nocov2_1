@echo off
setlocal

rem Define variables
set SOURCE_DIR=C:\nocov2
set DEST_USER=root
set DEST_IP=50.116.11.147
set DEST_PATH=/srv
set EXCLUDE_DIR=node_modules

rem Call rsync to transfer files
"C:\Program Files\Git\usr\bin\rsync.exe" -avz --exclude="%EXCLUDE_DIR%" "%SOURCE_DIR%" "%DEST_USER%@%DEST_IP%:%DEST_PATH%"
rem Keep the window open to see the output
pause
endlocal
