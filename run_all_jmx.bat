@echo on
setlocal enabledelayedexpansion

REM === SAFE VARIABLE SET ===
set "JMETER_HOME=C:\Users\Muhammad Azmi\Documents\apache-jmeter-5.6.3"
set "TEST_DIR=C:\Users\Muhammad Azmi\Documents\apache-jmeter-5.6.3\OneWorld"
set "RESULT_BASE=%TEST_DIR%\Result"

echo JMETER_HOME=%JMETER_HOME%
echo TEST_DIR=%TEST_DIR%
echo.

for %%f in ("%TEST_DIR%\*.jmx") do (
    set "TEST_NAME=%%~nf"
    set "RESULT_DIR=%RESULT_BASE%\!TEST_NAME!"

    echo Running !TEST_NAME!

    if exist "!RESULT_DIR!" rmdir /s /q "!RESULT_DIR!"
    mkdir "!RESULT_DIR!"

    call "%JMETER_HOME%\bin\jmeter.bat" -n -t "%%f" ^
    -l "!RESULT_DIR!\summary.csv" ^
    -e -o "!RESULT_DIR!"

    echo Exit code: !errorlevel!
    echo.
)

echo DONE
pause
