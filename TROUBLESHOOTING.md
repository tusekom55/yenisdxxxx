# 🔧 Troubleshooting Guide - Connection Error

## Problem
You're getting the error: **"Bağlantı hatası. Lütfen sayfayı yenileyin."** (Connection error. Please refresh the page.)

## Quick Solutions

### 1. **Check Backend Server Status**
First, verify if your PHP backend is running:

```bash
# If using XAMPP/WAMP
# Make sure Apache and MySQL services are running

# If using built-in PHP server
# Check if the server is started in the backend directory
```

### 2. **Test Backend Connection**
Use the debug tool I created:

1. Open `debug_auth.html` in your browser
2. Click "Test Backend" button
3. Check the results

### 3. **Verify File Paths**
Make sure these files exist and are accessible:
- `backend/public/login.php`
- `backend/public/profile.php`
- `backend/public/logout.php`

### 4. **Check Browser Console**
Open Developer Tools (F12) and look for:
- Network errors
- CORS errors
- JavaScript errors

## Detailed Troubleshooting Steps

### Step 1: Backend Server Check
1. **XAMPP/WAMP Users:**
   - Open XAMPP Control Panel
   - Ensure Apache and MySQL are running (green status)
   - Check if there are any error messages

2. **Built-in PHP Server Users:**
   - Open terminal/command prompt
   - Navigate to your project directory
   - Run: `php -S localhost:8000`
   - Access your site at `http://localhost:8000`

### Step 2: File Permissions
Ensure your backend files have proper permissions:
- PHP files should be readable by the web server
- Check if `.htaccess` files are blocking access

### Step 3: Database Connection
Verify database connectivity:
1. Check `backend/config.php` for correct database settings
2. Ensure MySQL service is running
3. Test database connection manually

### Step 4: CORS Issues
If you see CORS errors in console:
1. Check if `Access-Control-Allow-Origin` headers are set correctly
2. Verify `Access-Control-Allow-Credentials: true` is present
3. Ensure your domain matches the allowed origin

## Common Issues and Solutions

### Issue 1: "Backend sunucusuna bağlanılamıyor"
**Cause:** PHP server not running or wrong port
**Solution:** Start your web server (Apache/XAMPP/PHP built-in server)

### Issue 2: "404 Not Found" errors
**Cause:** Incorrect file paths
**Solution:** Verify file structure and paths in your project

### Issue 3: "500 Internal Server Error"
**Cause:** PHP syntax errors or database connection issues
**Solution:** Check PHP error logs and database configuration

### Issue 4: CORS errors
**Cause:** Missing or incorrect CORS headers
**Solution:** Verify CORS headers in backend PHP files

## Testing Your Setup

### 1. **Use the Debug Tool**
Open `debug_auth.html` and run all tests:
- Current State Check
- Backend Connection Test
- Profile API Test
- Component Loading Test
- Full Authentication Flow Test

### 2. **Manual API Testing**
Test backend endpoints directly:

```bash
# Test login endpoint
curl -X POST http://localhost/your-project/backend/public/login.php \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=test&password=test"

# Test profile endpoint
curl -X GET http://localhost/your-project/backend/public/profile.php \
  -H "Cookie: PHPSESSID=your-session-id"
```

### 3. **Check Network Tab**
In browser Developer Tools:
1. Go to Network tab
2. Refresh the page
3. Look for failed requests
4. Check response status codes

## Quick Fixes

### Fix 1: Restart Web Server
```bash
# XAMPP
# Stop and start Apache service

# Built-in PHP server
# Stop current server (Ctrl+C) and restart
php -S localhost:8000
```

### Fix 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Fix 3: Check File Paths
Ensure your project structure matches:
```
your-project/
├── backend/
│   └── public/
│       ├── login.php
│       ├── profile.php
│       └── logout.php
├── assets/
│   ├── js/
│   └── css/
└── user-panel-new.html
```

### Fix 4: Database Connection
Check `backend/config.php`:
```php
<?php
// Ensure these settings are correct
define('DB_HOST', 'localhost');
define('DB_NAME', 'your_database_name');
define('DB_USER', 'your_username');
define('DB_PASS', 'your_password');
?>
```

## Still Having Issues?

If the problem persists:

1. **Check the debug log** in `debug_auth.html`
2. **Look at browser console** for specific error messages
3. **Verify server logs** (Apache/PHP error logs)
4. **Test with a simple PHP file** to isolate the issue

## Emergency Fallback

If you need immediate access while fixing the backend:

1. **Use the retry button** in the user panel
2. **Check localStorage** for cached user data
3. **Try accessing** `login.html` directly
4. **Use the debug tool** to identify the exact issue

## Need More Help?

1. **Check the debug output** from `debug_auth.html`
2. **Look at browser console** for error details
3. **Verify your server configuration**
4. **Test with the provided debug tools**

The debug tool I created (`debug_auth.html`) should give you detailed information about what's failing and why.
