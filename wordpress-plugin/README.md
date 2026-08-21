# UptimeGuard WordPress Plugin

A WordPress plugin that connects your site to [UptimeGuard](https://uptimeguard.dev) to monitor plugin updates.

## Features

- 🔌 **Auto-pairing** — Connect to UptimeGuard with a simple pairing code
- 📊 **Plugin monitoring** — Reports all installed plugins and their versions
- 🔄 **Update detection** — Detects available plugin updates automatically
- ⏰ **Auto-sync** — Syncs data every hour automatically
- 🛠️ **Manual sync** — Sync immediately from the settings page

## Installation

### Method 1: Upload ZIP

1. Download the `uptime-guard-wp.zip` file
2. Go to **WordPress Admin → Plugins → Add New → Upload Plugin**
3. Choose the ZIP file and click **Install Now**
4. Click **Activate**

### Method 2: Manual

1. Create a folder `uptime-guard-wp` in `wp-content/plugins/`
2. Copy `uptime-guard-wp.php` and `admin.css` into that folder
3. Go to **WordPress Admin → Plugins** and activate **UptimeGuard Plugin Monitor**

## Setup

1. Go to **WordPress Admin → Settings → UptimeGuard**
2. Enter your **App URL** (e.g., `https://your-app.com`)
3. Enter your **Pairing Code** (found in your UptimeGuard dashboard)
4. Click **Save & Connect**

## How It Works

1. The plugin registers your WordPress site with UptimeGuard using the pairing code
2. On activation and every hour, it collects all installed plugin data:
   - Plugin name and file
   - Current version
   - Whether an update is available
   - Update version (if available)
   - Active/inactive status
3. This data is sent to the UptimeGuard API
4. You can view everything in your UptimeGuard dashboard

## Development

### Building the Plugin ZIP

```bash
cd wordpress-plugin
zip -r ../public/uptime-guard-wp.zip uptime-guard-wp.php admin.css README.md
```

### File Structure

```
uptime-guard-wp/
├── uptime-guard-wp.php   # Main plugin file
├── admin.css              # Admin styles
└── README.md              # This file
```

## Troubleshooting

### "Pairing failed" error

- Make sure the pairing code matches what's shown in your UptimeGuard dashboard
- Make sure the App URL is correct (include `https://`)
- Check that the UptimeGuard server is accessible from your WordPress site

### Data not syncing

- Go to Settings → UptimeGuard and click **Sync Now**
- Check if there are any errors in the sync status
- Verify the App URL is correct and accessible

### Cron not running

Some hosting providers disable WordPress cron. If automatic sync isn't working:

1. Add to `wp-config.php`:
   ```php
   define('DISABLE_WP_CRON', true);
   ```
2. Set up a server cron job:
   ```bash
   */5 * * * * wget -q -O - https://your-site.com/wp-cron.php?doing_cron
   ```
