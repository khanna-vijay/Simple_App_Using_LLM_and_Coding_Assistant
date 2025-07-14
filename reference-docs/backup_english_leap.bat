@echo off
setlocal enabledelayedexpansion

:: English Leap Project Backup Script (Root Folder Version)
:: Creates a comprehensive backup of the english-leap project
:: Runs from parent folder and saves backup in parallel backup directory
:: Author: Augment Agent
:: Version: 2.0

echo ========================================
echo English Leap Project Backup Utility
echo ========================================
echo Version: 2.0 (Root Folder Edition)
echo.

:: Check if we're in the correct directory (should contain english-leap folder)
if not exist "english-leap" (
    echo [ERROR] english-leap folder not found!
    echo This script must be run from the parent directory containing the english-leap folder.
    echo.
    echo Current directory: %cd%
    echo Expected structure:
    echo   Parent Folder/
    echo   ├── english-leap/          ^(project folder^)
    echo   ├── backup_english_leap.bat ^(this script^)
    echo   └── english-leap-backups/   ^(will be created^)
    echo.
    pause
    exit /b 1
)

:: Get current date and time
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "MIN=%dt:~10,2%" & set "SS=%dt:~12,2%"
set "datestamp=%YYYY%-%MM%-%DD%"
set "timestamp=%YYYY%-%MM%-%DD%_%HH%-%MIN%-%SS%"

:: Set backup paths
set "project_folder=english-leap"
set "backup_root=english-leap-backups"
set "backup_name=backup_%datestamp%"
set "backup_path=%backup_root%\%backup_name%"

echo [INFO] Current Directory: %cd%
echo [INFO] Project Folder: %project_folder%
echo [INFO] Backup will be saved: %backup_path%
echo [INFO] Timestamp: %datestamp% %HH%:%MIN%:%SS%
echo [INFO] Backup Type: Folder (no compression)
echo.

:: Create backup directory if it doesn't exist
if not exist "%backup_root%" (
    echo [INFO] Creating backup directory: %backup_root%
    mkdir "%backup_root%"
    if !errorlevel! neq 0 (
        echo [ERROR] Failed to create backup directory!
        pause
        exit /b 1
    )
    echo [SUCCESS] ✓ Backup directory created
) else (
    echo [INFO] Using existing backup directory: %backup_root%
)

:: Pre-flight checks and file discovery
echo.
echo ========================================
echo PRE-FLIGHT CHECKS
echo ========================================
echo.

echo [CHECK] Scanning project structure in %project_folder%...
cd /d "%project_folder%"
set "total_size=0"
set "file_count=0"
set "folder_count=0"

:: Check what will be backed up
echo.
echo BACKUP PLAN - The following will be included:
echo ============================================
echo.

echo [FOLDERS]
if exist "src" (
    echo   ✓ src/                    - React source code
    set /a folder_count+=1
    for /f %%A in ('dir "src" /s /-c 2^>nul ^| find "File(s)" 2^>nul') do set "src_files=%%A"
    if defined src_files (
        echo     └─ Contains: !src_files! files
    ) else (
        echo     └─ Contains: Multiple files
    )
) else (
    echo   ✗ src/                    - NOT FOUND
)

if exist "public" (
    echo   ✓ public/                - Static assets ^& favicon
    set /a folder_count+=1
    for /f %%A in ('dir "public" /s /-c 2^>nul ^| find "File(s)" 2^>nul') do set "public_files=%%A"
    if defined public_files (
        echo     └─ Contains: !public_files! files
    ) else (
        echo     └─ Contains: Multiple files
    )
) else (
    echo   ✗ public/                - NOT FOUND
)

if exist "node_modules" (
    echo   ⚠ node_modules/          - WILL BE SKIPPED ^(large size^)
    echo     └─ Will be reinstalled during restore
) else (
    echo   ℹ node_modules/          - Not present
)

if exist ".git" (
    echo   ⚠ .git/                  - WILL BE SKIPPED ^(large size^)
    echo     └─ Git history excluded for size optimization
) else (
    echo   ℹ .git/                  - Not a git repository
)

echo.
echo [CONFIGURATION FILES]
if exist "package.json" (
    echo   ✓ package.json           - Project dependencies
    set /a file_count+=1
) else (
    echo   ✗ package.json           - NOT FOUND ^(Critical!^)
)

if exist "package-lock.json" (
    echo   ✓ package-lock.json      - Dependency lock file
    set /a file_count+=1
) else (
    echo   ℹ package-lock.json      - Not present
)

if exist "yarn.lock" (
    echo   ✓ yarn.lock              - Yarn lock file
    set /a file_count+=1
) else (
    echo   ℹ yarn.lock              - Not present
)

if exist ".gitignore" (
    echo   ✓ .gitignore             - Git ignore rules
    set /a file_count+=1
) else (
    echo   ℹ .gitignore             - Not present
)

if exist "README.md" (
    echo   ✓ README.md              - Project documentation
    set /a file_count+=1
) else (
    echo   ℹ README.md              - Not present
)

echo.
echo [ENVIRONMENT FILES]
set "env_found=0"
for %%f in (.env .env.local .env.development .env.production) do (
    if exist "%%f" (
        echo   ✓ %%f                 - Environment variables
        set /a file_count+=1
        set /a env_found+=1
    )
)
if !env_found! equ 0 (
    echo   ℹ No .env files found
)

echo.
echo [DOCUMENTATION FILES]
set "doc_count=0"
for %%f in (*.md) do (
    if exist "%%f" (
        echo   ✓ %%f
        set /a file_count+=1
        set /a doc_count+=1
    )
)
if !doc_count! equ 0 (
    echo   ℹ No additional .md files found
)

echo.
echo [BUILD CONFIGURATION]
set "build_files=webpack.config.js craco.config.js jsconfig.json tsconfig.json"
for %%f in (!build_files!) do (
    if exist "%%f" (
        echo   ✓ %%f
        set /a file_count+=1
    )
)

echo.
echo [DEPLOYMENT FILES]
set "deploy_files=Dockerfile docker-compose.yml netlify.toml vercel.json"
for %%f in (!deploy_files!) do (
    if exist "%%f" (
        echo   ✓ %%f
        set /a file_count+=1
    )
)

:: Go back to parent directory
cd /d ".."

echo.
echo ========================================
echo BACKUP SUMMARY
echo ========================================
echo Project folder: %project_folder%
echo Total folders to backup: !folder_count!
echo Total files to backup: !file_count!
echo Backup will be saved: %backup_path%
echo Backup directory: %backup_root%
echo Backup type: Folder (no compression)
echo.

echo.
echo ========================================
echo READY TO BACKUP
echo ========================================
echo.
set /p confirm="Do you want to proceed with the backup? (Y/N): "
if /i not "!confirm!"=="Y" (
    echo [INFO] Backup cancelled by user.
    pause
    exit /b 0
)

echo.
echo [INFO] Starting backup process...
echo ========================================

:: Create backup directory
echo [STEP 1] Creating backup directory...
if exist "%backup_path%" (
    echo [INFO] Removing existing backup folder: %backup_path%
    rmdir /s /q "%backup_path%"
)
echo [INFO] Creating backup folder: %backup_path%
mkdir "%backup_path%"
if %errorlevel% neq 0 (
    echo [ERROR] Failed to create backup directory!
    pause
    exit /b 1
)
echo [SUCCESS] ✓ Backup directory created

echo.
echo [STEP 2] Copying project files from %project_folder%...
echo ========================================

:: Change to project directory for copying
cd /d "%project_folder%"

:: Copy main project structure
echo [1/10] Copying source code...
if exist "src" (
    echo [INFO] Copying src/ folder...
    xcopy "src" "..\%backup_path%\src" /E /I /H /Y
    if !errorlevel! equ 0 (
        echo [SUCCESS] ✓ Source code copied successfully
    ) else (
        echo [WARNING] ⚠ Some src files may not have been copied (Error: !errorlevel!)
    )
) else (
    echo [WARNING] ⚠ src/ folder not found - skipping
)

echo.
echo [2/10] Copying public assets...
if exist "public" (
    echo [INFO] Copying public/ folder...
    xcopy "public" "..\%backup_path%\public" /E /I /H /Y
    if !errorlevel! equ 0 (
        echo [SUCCESS] ✓ Public assets copied successfully
    ) else (
        echo [WARNING] ⚠ Some public files may not have been copied (Error: !errorlevel!)
    )
) else (
    echo [WARNING] ⚠ public/ folder not found - skipping
)

echo.
echo [3/10] Copying configuration files...
set "config_files=package.json package-lock.json yarn.lock .gitignore README.md"
for %%f in (!config_files!) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    ) else (
        echo [INFO] %%f not found - skipping
    )
)

echo.
echo [4/10] Copying documentation files...
set "doc_found=0"
for %%f in (*.md) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
            set /a doc_found+=1
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    )
)
if !doc_found! equ 0 (
    echo [INFO] No additional .md files found
)

echo.
echo [5/10] Copying environment files...
set "env_files=.env .env.local .env.development .env.production"
set "env_copied=0"
for %%f in (!env_files!) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
            set /a env_copied+=1
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    )
)
if !env_copied! equ 0 (
    echo [INFO] No environment files found
)

echo.
echo [6/10] Copying build configuration...
set "build_files=webpack.config.js craco.config.js jsconfig.json tsconfig.json"
set "build_copied=0"
for %%f in (!build_files!) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
            set /a build_copied+=1
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    )
)
if !build_copied! equ 0 (
    echo [INFO] No build configuration files found
)

echo.
echo [7/10] Copying testing files...
set "test_files=jest.config.js setupTests.js"
set "test_copied=0"
for %%f in (!test_files!) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
            set /a test_copied+=1
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    )
)
if !test_copied! equ 0 (
    echo [INFO] No testing files found
)

echo.
echo [8/10] Copying deployment files...
set "deploy_files=Dockerfile docker-compose.yml netlify.toml vercel.json"
set "deploy_copied=0"
for %%f in (!deploy_files!) do (
    if exist "%%f" (
        echo [INFO] Copying %%f...
        copy "%%f" "..\%backup_path%\" >nul
        if !errorlevel! equ 0 (
            echo [SUCCESS] ✓ %%f copied
            set /a deploy_copied+=1
        ) else (
            echo [WARNING] ⚠ Failed to copy %%f
        )
    )
)
if !deploy_copied! equ 0 (
    echo [INFO] No deployment files found
)

echo.
echo [9/10] Checking Git configuration...
if exist ".git" (
    echo [INFO] Git repository detected - excluding for size optimization
    echo [INFO] Git history will NOT be included in backup
    echo [INFO] Use PowerShell script with -IncludeGitHistory for full backup
) else (
    echo [INFO] No Git repository found
)

:: Go back to parent directory
cd /d ".."

echo.
echo [10/10] Creating backup manifest...
echo [INFO] Generating backup information file...
echo English Leap Project Backup > "%backup_path%\BACKUP_INFO.txt"
echo ================================ >> "%backup_path%\BACKUP_INFO.txt"
echo Backup Date: %date% %time% >> "%backup_path%\BACKUP_INFO.txt"
echo Backup Created By: English Leap Backup Script v2.0 (Folder Edition) >> "%backup_path%\BACKUP_INFO.txt"
echo Computer: %COMPUTERNAME% >> "%backup_path%\BACKUP_INFO.txt"
echo User: %USERNAME% >> "%backup_path%\BACKUP_INFO.txt"
echo Project Path: %cd%\%project_folder% >> "%backup_path%\BACKUP_INFO.txt"
echo Backup Location: %cd%\%backup_path% >> "%backup_path%\BACKUP_INFO.txt"
echo Backup Type: Folder (no compression) >> "%backup_path%\BACKUP_INFO.txt"
echo. >> "%backup_path%\BACKUP_INFO.txt"
echo Project Structure: >> "%backup_path%\BACKUP_INFO.txt"
echo - Source Code (src/) >> "%backup_path%\BACKUP_INFO.txt"
echo - Public Assets (public/) >> "%backup_path%\BACKUP_INFO.txt"
echo - Configuration Files >> "%backup_path%\BACKUP_INFO.txt"
echo - Documentation >> "%backup_path%\BACKUP_INFO.txt"
echo - Environment Settings >> "%backup_path%\BACKUP_INFO.txt"
echo - Build Configuration >> "%backup_path%\BACKUP_INFO.txt"
echo. >> "%backup_path%\BACKUP_INFO.txt"
echo Excluded Items: >> "%backup_path%\BACKUP_INFO.txt"
echo - node_modules/ (will be reinstalled) >> "%backup_path%\BACKUP_INFO.txt"
echo - .git/ (excluded for size optimization) >> "%backup_path%\BACKUP_INFO.txt"
echo - build/ (generated files) >> "%backup_path%\BACKUP_INFO.txt"
echo. >> "%backup_path%\BACKUP_INFO.txt"
echo Restore Instructions: >> "%backup_path%\BACKUP_INFO.txt"
echo 1. Copy this backup folder to desired location >> "%backup_path%\BACKUP_INFO.txt"
echo 2. Run: npm install >> "%backup_path%\BACKUP_INFO.txt"
echo 3. Run: npm start >> "%backup_path%\BACKUP_INFO.txt"
echo. >> "%backup_path%\BACKUP_INFO.txt"

:: Get folder size
echo [INFO] Calculating backup size...
for /f "tokens=3" %%a in ('dir "%backup_path%" /s /-c ^| find "File(s)"') do set "folder_size=%%a"
echo Backup Size: %folder_size% bytes >> "%backup_path%\BACKUP_INFO.txt"
set /a "folder_mb=!folder_size!/1048576"
echo Backup Size: !folder_mb! MB >> "%backup_path%\BACKUP_INFO.txt"
echo [SUCCESS] ✓ Backup manifest created (!folder_mb! MB)

echo.
echo ========================================
echo BACKUP COMPLETED SUCCESSFULLY! ✓
echo ========================================
echo.
echo [RESULT] Backup Details:
echo ────────────────────────────────────────
echo Folder: %backup_name%
echo Size: !folder_mb! MB
echo Location: %cd%\%backup_path%
echo Created: %date% %time%
echo Type: Folder (no compression)
echo.
echo [CONTENTS] What's included:
echo ────────────────────────────────────────
echo ✓ Complete React source code ^(src/^)
echo ✓ All public assets and favicon ^(public/^)
echo ✓ Configuration files ^(package.json, etc.^)
echo ✓ Documentation files ^(*.md^)
echo ✓ Environment settings ^(.env*^)
echo ✓ Build and deployment configs
echo ✓ Backup manifest with restore instructions
echo.
echo [RESTORE] To restore this backup:
echo ────────────────────────────────────────
echo 1. Copy the backup folder to desired location
echo 2. Run: npm install
echo 3. Run: npm start
echo.
echo [SUCCESS] Backup saved in: %backup_root%\ directory 🎉
echo [INFO] No compression used - backup is ready to use immediately!

echo.
echo Press any key to exit...
pause >nul
