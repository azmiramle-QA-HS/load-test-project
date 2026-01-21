@echo off
REM Change directory to your JMeter folder
cd /d "C:\Users\Muhammad Azmi\Documents\apache-jmeter-5.6.3\EPR_OneWorld"

REM Run the JMeter test in non-GUI mode
jmeter -n -t "EPR_10CCU.jmx" -l "summary.csv" -e -o "Result"

REM Pause to see output/errors
pause
