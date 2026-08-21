<?php
/**
 * Plugin Name: UptimeGuard Plugin Monitor
 * Plugin URI: https://uptimeguard.dev
 * Description: Connects your WordPress site to UptimeGuard to monitor plugin updates. Reports installed plugins and available updates.
 * Version: 1.0.0
 * Author: UptimeGuard
 * License: GPL v2 or later
 * Text Domain: uptime-guard
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Constants
define('UPTIME_GUARD_VERSION', '1.0.0');
define('UPTIME_GUARD_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('UPTIME_GUARD_OPTION_KEY', 'uptime_guard_settings');

/**
 * Main Plugin Class
 */
class UptimeGuardWP
{
    private static $instance = null;

    public static function instance()
    {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function __construct()
    {
        // Activation/Deactivation hooks
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        // Admin menu
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);

        // Settings page
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);

        // Cron job for syncing
        add_action('uptime_guard_sync_cron', [$this, 'sync_plugins']);

        // Add settings link to plugins list
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_settings_link']);

        // AJAX endpoint for manual sync
        add_action('wp_ajax_uptime_guard_sync', [$this, 'ajax_sync']);
    }

    /**
     * Plugin activation
     */
    public function activate()
    {
        // Schedule cron job (every hour)
        if (!wp_next_scheduled('uptime_guard_sync_cron')) {
            wp_schedule_event(time(), 'hourly', 'uptime_guard_sync_cron');
        }

        // Save default settings
        $settings = get_option(UPTIME_GUARD_OPTION_KEY, []);
        if (empty($settings)) {
            update_option(UPTIME_GUARD_OPTION_KEY, [
                'app_url' => '',
                'pairing_code' => '',
                'connected' => false,
                'last_sync' => '',
            ]);
        }

        // Initial sync after activation (after 30 seconds to let activation finish)
        wp_schedule_single_event(time() + 30, 'uptime_guard_sync_cron');
    }

    /**
     * Plugin deactivation
     */
    public function deactivate()
    {
        wp_clear_scheduled_hook('uptime_guard_sync_cron');
    }

    /**
     * Add admin menu page
     */
    public function add_admin_menu()
    {
        add_options_page(
            'UptimeGuard',
            'UptimeGuard',
            'manage_options',
            'uptime-guard',
            [$this, 'settings_page']
        );
    }

    /**
     * Register plugin settings
     */
    public function register_settings()
    {
        register_setting(UPTIME_GUARD_OPTION_KEY, UPTIME_GUARD_OPTION_KEY, [
            'sanitize_callback' => [$this, 'sanitize_settings'],
        ]);
    }

    /**
     * Sanitize settings
     */
    public function sanitize_settings($input)
    {
        $sanitized = [];
        $sanitized['app_url'] = esc_url_raw(rtrim($input['app_url'] ?? '', '/'));
        $sanitized['pairing_code'] = sanitize_text_field($input['pairing_code'] ?? '');
        $sanitized['connected'] = !empty($input['connected']) && $input['connected'] === '1';
        $sanitized['last_sync'] = $input['last_sync'] ?? '';
        return $sanitized;
    }

    /**
     * Enqueue admin scripts
     */
    public function admin_enqueue_scripts($hook)
    {
        if ($hook !== 'settings_page_uptime-guard') {
            return;
        }

        wp_enqueue_style(
            'uptime-guard-admin',
            plugin_dir_url(__FILE__) . 'admin.css',
            [],
            UPTIME_GUARD_VERSION
        );
    }

    /**
     * Add settings link in plugins list
     */
    public function add_settings_link($links)
    {
        $settings_link = '<a href="' . admin_url('options-general.php?page=uptime-guard') . '">Settings</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Settings page HTML
     */
    public function settings_page()
    {
        $settings = get_option(UPTIME_GUARD_OPTION_KEY, [
            'app_url' => '',
            'pairing_code' => '',
            'connected' => false,
            'last_sync' => '',
        ]);
        ?>
        <div class="wrap">
            <h1>UptimeGuard Settings</h1>

            <?php if (!empty($settings['connected'])): ?>
                <div class="notice notice-success">
                    <p><strong>✅ Connected to UptimeGuard!</strong> Your plugin data is being synced automatically.</p>
                    <?php if (!empty($settings['last_sync'])): ?>
                        <p>Last synced: <?php echo esc_html($settings['last_sync']); ?></p>
                    <?php endif; ?>
                </div>
            <?php endif; ?>

            <form method="post" action="options.php">
                <?php settings_fields(UPTIME_GUARD_OPTION_KEY); ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="app_url">App URL</label>
                        </th>
                        <td>
                            <input
                                type="url"
                                id="app_url"
                                name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[app_url]"
                                value="<?php echo esc_attr($settings['app_url']); ?>"
                                class="regular-text"
                                placeholder="https://your-app.com"
                                required
                            />
                            <p class="description">The URL of your UptimeGuard application (e.g., https://uptimeguard.example.com)</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="pairing_code">Pairing Code</label>
                        </th>
                        <td>
                            <input
                                type="text"
                                id="pairing_code"
                                name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[pairing_code]"
                                value="<?php echo esc_attr($settings['pairing_code']); ?>"
                                class="regular-text"
                                placeholder="ABC-1234"
                                style="text-transform: uppercase; letter-spacing: 2px;"
                                required
                            />
                            <p class="description">Enter the pairing code from your UptimeGuard dashboard.</p>
                        </td>
                    </tr>
                    <?php if (!empty($settings['connected'])): ?>
                    <tr>
                        <th scope="row">Connection Status</th>
                        <td>
                            <input type="hidden" name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[connected]" value="1" />
                            <span class="uptime-guard-status connected">✅ Connected</span>
                        </td>
                    </tr>
                    <?php else: ?>
                    <tr>
                        <th scope="row">Connection Status</th>
                        <td>
                            <input type="hidden" name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[connected]" value="0" />
                            <span class="uptime-guard-status disconnected">❌ Not Connected</span>
                        </td>
                    </tr>
                    <?php endif; ?>
                </table>

                <?php submit_button('Save & Connect', 'primary', 'submit', true, [
                    'id' => 'uptime-guard-connect-btn',
                ]); ?>
            </form>

            <?php if (!empty($settings['connected'])): ?>
            <hr />
            <h2>Manual Sync</h2>
            <p>Click the button below to immediately sync your plugin data with UptimeGuard.</p>
            <button id="uptime-guard-sync-btn" class="button button-secondary">
                Sync Now
            </button>
            <span id="uptime-guard-sync-status"></span>
            <?php endif; ?>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // Handle manual sync
            $('#uptime-guard-sync-btn').on('click', function() {
                var btn = $(this);
                var status = $('#uptime-guard-sync-status');
                btn.prop('disabled', true);
                status.text('Syncing...');

                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'uptime_guard_sync'
                    },
                    success: function(response) {
                        if (response.success) {
                            status.html('<span style="color: green;">✅ ' + response.data.message + '</span>');
                        } else {
                            status.html('<span style="color: red;">❌ ' + response.data + '</span>');
                        }
                        btn.prop('disabled', false);
                    },
                    error: function() {
                        status.html('<span style="color: red;">❌ Sync failed. Check your settings.</span>');
                        btn.prop('disabled', false);
                    }
                });
            });
        });
        </script>
        <?php
    }

    /**
     * AJAX sync handler
     */
    public function ajax_sync()
    {
        $result = $this->sync_plugins();

        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success(['message' => $result]);
        }
    }

    /**
     * Get all installed plugins with their update status
     */
    public function get_plugins_data()
    {
        // Include WordPress plugin functions
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', []);
        $update_plugins = get_site_transient('update_plugins');

        $plugins_data = [];

        foreach ($all_plugins as $file => $plugin) {
            $is_active = in_array($file, $active_plugins);
            $plugin_dir = plugin_dir_url(__FILE__);

            // Check if update is available
            $has_update = false;
            $update_version = null;

            if (isset($update_plugins->response[$file])) {
                $has_update = true;
                $update_version = $update_plugins->response[$file]->new_version;
            }

            $plugins_data[] = [
                'plugin_file' => $file,
                'plugin_name' => $plugin['Name'] ?? basename($file, '.php'),
                'plugin_uri' => $plugin['PluginURI'] ?? '',
                'description' => wp_strip_all_tags($plugin['Description'] ?? ''),
                'version' => $plugin['Version'] ?? '0.0.0',
                'update_version' => $update_version,
                'status' => $is_active ? 'active' : 'inactive',
                'has_update' => $has_update,
            ];
        }

        return $plugins_data;
    }

    /**
     * Sync plugins data with UptimeGuard
     */
    public function sync_plugins()
    {
        $settings = get_option(UPTIME_GUARD_OPTION_KEY, []);

        if (empty($settings['app_url']) || empty($settings['pairing_code'])) {
            return new WP_Error('not_configured', 'App URL and pairing code are required.');
        }

        if (empty($settings['connected'])) {
            // Try to pair first
            $pair_result = $this->pair_site($settings);
            if (is_wp_error($pair_result)) {
                return $pair_result;
            }
        }

        // Get plugin data
        $plugins = $this->get_plugins_data();

        // Send to API
        $response = wp_remote_post($settings['app_url'] . '/api/wordpress/sync', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'body' => json_encode([
                'pairing_code' => $settings['pairing_code'],
                'plugins' => $plugins,
            ]),
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code >= 200 && $code < 300) {
            // Update last sync time
            $settings['last_sync'] = current_time('mysql');
            $settings['connected'] = true;
            update_option(UPTIME_GUARD_OPTION_KEY, $settings);

            return sprintf(
                'Synced %d plugins (%d outdated)',
                $body['plugins_count'] ?? count($plugins),
                $body['outdated_count'] ?? 0
            );
        } else {
            // If pairing code is invalid, mark as disconnected
            if ($code === 404) {
                $settings['connected'] = false;
                update_option(UPTIME_GUARD_OPTION_KEY, $settings);
                return new WP_Error('pairing_failed', 'Pairing failed. Please check your pairing code and try again.');
            }
            return new WP_Error('sync_failed', 'Sync failed with status: ' . $code);
        }
    }

    /**
     * Pair the site with UptimeGuard
     */
    private function pair_site($settings)
    {
        $response = wp_remote_post($settings['app_url'] . '/api/wordpress/pair', [
            'headers' => [
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ],
            'body' => json_encode([
                'pairing_code' => $settings['pairing_code'],
            ]),
            'timeout' => 30,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code >= 200 && $code < 300) {
            $settings['connected'] = true;
            update_option(UPTIME_GUARD_OPTION_KEY, $settings);
            return true;
        } else {
            return new WP_Error('pairing_failed', $body['message'] ?? 'Pairing failed.');
        }
    }
}

// Initialize plugin
UptimeGuardWP::instance();
