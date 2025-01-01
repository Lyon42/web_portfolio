@echo off
setlocal
:PROMPT
SET /P AREYOUSURE=Are you sure (Y/[N])?
IF /I "%AREYOUSURE%" NEQ "Y" GOTO END

call py -3.12 -m venv ./.venv/
call .\.venv\Scripts\activate.bat
call py -m pip install -r .\requirements.txt
call git clone https://github.com/Lyon42/flask_material/ .\lib\flask_material\
call py -m flask --app web_portfolio.py init-db

:END
endlocal