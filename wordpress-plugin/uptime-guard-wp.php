<?php
/**
 * Plugin Name: UptimeGuard Plugin Monitor
 * Plugin URI: https://uptimeguard.dev
 * Description: Connects your WordPress site to UptimeGuard to monitor plugin updates.
 * Version: 1.0.1
 * Author: UptimeGuard
 * License: GPL v2 or later
 * Text Domain: uptime-guard
 */

if (!defined('ABSPATH')) {
    exit;
}

define('UPTIME_GUARD_VERSION', '1.0.1');
define('UPTIME_GUARD_OPTION_KEY', 'uptime_guard_settings');

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
        register_activation_hook(__FILE__, [$this, 'activate']);
        register_deactivation_hook(__FILE__, [$this, 'deactivate']);

        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'register_settings']);
        add_action('admin_enqueue_scripts', [$this, 'admin_enqueue_scripts']);
        add_action('uptime_guard_sync_cron', [$this, 'sync_plugins']);
        add_filter('plugin_action_links_' . plugin_basename(__FILE__), [$this, 'add_settings_link']);
        add_action('wp_ajax_uptime_guard_sync', [$this, 'ajax_sync']);

        // Handle server-side pairing on form save
        add_action('admin_init', [$this, 'handle_form_pairing']);
    }

    public function activate()
    {
        if (!wp_next_scheduled('uptime_guard_sync_cron')) {
            wp_schedule_event(time(), 'hourly', 'uptime_guard_sync_cron');
        }
        $settings = get_option(UPTIME_GUARD_OPTION_KEY, []);
        if (empty($settings)) {
            update_option(UPTIME_GUARD_OPTION_KEY, [
                'app_url' => '',
                'pairing_code' => '',
                'connected' => false,
                'last_sync' => '',
            ]);
        }
        wp_schedule_single_event(time() + 30, 'uptime_guard_sync_cron');
    }

    public function deactivate()
    {
        wp_clear_scheduled_hook('uptime_guard_sync_cron');
    }

    public function add_admin_menu()
    {
        add_options_page('UptimeGuard', 'UptimeGuard', 'manage_options', 'uptime-guard', [$this, 'settings_page']);
    }

    public function register_settings()
    {
        register_setting(UPTIME_GUARD_OPTION_KEY, UPTIME_GUARD_OPTION_KEY, [
            'sanitize_callback' => [$this, 'sanitize_settings'],
        ]);
    }

    public function sanitize_settings($input)
    {
        return [
            'app_url' => esc_url_raw(rtrim($input['app_url'] ?? '', '/')),
            'pairing_code' => sanitize_text_field($input['pairing_code'] ?? ''),
            'connected' => !empty($input['connected']) && $input['connected'] === '1',
            'last_sync' => $input['last_sync'] ?? '',
        ];
    }

    public function admin_enqueue_scripts($hook)
    {
        if ($hook !== 'settings_page_uptime-guard') {
            return;
        }
        wp_enqueue_style('uptime-guard-admin', plugin_dir_url(__FILE__) . 'admin.css', [], UPTIME_GUARD_VERSION);
    }

    public function add_settings_link($links)
    {
        $settings_link = '<a href="' . admin_url('options-general.php?page=uptime-guard') . '">Settings</a>';
        array_unshift($links, $settings_link);
        return $links;
    }

    /**
     * Handle pairing server-side when the form is submitted.
     * This runs after WordPress saves the settings via sanitize_settings().
     */
    public function handle_form_pairing()
    {
        // Only run when our settings form was submitted
        if (!isset($_POST['option_page']) || $_POST['option_page'] !== UPTIME_GUARD_OPTION_KEY) {
            return;
        }
        if (!isset($_POST['submit']) || $_POST['submit'] !== 'Save & Connect') {
            return;
        }

        $settings = get_option(UPTIME_GUARD_OPTION_KEY, []);

        if (empty($settings['app_url']) || empty($settings['pairing_code'])) {
            return;
        }

        // Try to pair
        $pair_result = $this->pair_site($settings);
        if ($pair_result === true) {
            // Also try initial sync
            $this->sync_plugins();

            // Add success admin notice
            add_action('admin_notices', function () {
                echo '<div class="notice notice-success is-dismissible"><p><strong>✅ Connected to UptimeGuard!</strong> Your plugin data is being synced.</p></div>';
            });
        } else {
            $error_msg = is_wp_error($pair_result) ? $pair_result->get_error_message() : 'Pairing failed.';
            add_action('admin_notices', function () use ($error_msg) {
                echo '<div class="notice notice-error is-dismissible"><p><strong>❌ Connection failed:</strong> ' . esc_html($error_msg) . '</p></div>';
            });
        }
    }

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
                        <th scope="row"><label for="app_url">App URL</label></th>
                        <td>
                            <input type="url" id="app_url"
                                name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[app_url]"
                                value="<?php echo esc_attr($settings['app_url']); ?>"
                                class="regular-text" placeholder="https://your-app.onrender.com" required />
                            <p class="description">The URL of your UptimeGuard application</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><label for="pairing_code">Pairing Code</label></th>
                        <td>
                            <input type="text" id="pairing_code"
                                name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[pairing_code]"
                                value="<?php echo esc_attr($settings['pairing_code']); ?>"
                                class="regular-text" placeholder="ABC-1234" required />
                            <p class="description">Enter the pairing code from your UptimeGuard dashboard.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Connection Status</th>
                        <td>
                            <?php if (!empty($settings['connected'])): ?>
                                <input type="hidden" name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[connected]" value="1" />
                                <span style="color: green; font-weight: bold;">✅ Connected</span>
                            <?php else: ?>
                                <input type="hidden" name="<?php echo esc_attr(UPTIME_GUARD_OPTION_KEY); ?>[connected]" value="0" />
                                <span style="color: red; font-weight: bold;">❌ Not Connected</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                </table>

                <?php submit_button('Save & Connect'); ?>
            </form>

            <?php if (!empty($settings['connected'])): ?>
            <hr />
            <h2>Manual Sync</h2>
            <p>Click to immediately sync your plugin data with UptimeGuard.</p>
            <button id="uptime-guard-sync-btn" class="button button-secondary">Sync Now</button>
            <span id="uptime-guard-sync-status"></span>
            <?php endif; ?>
        </div>

        <script>
        jQuery(document).ready(function($) {
            $('#uptime-guard-sync-btn').on('click', function() {
                var btn = $(this);
                var status = $('#uptime-guard-sync-status');
                btn.prop('disabled', true);
                status.text('Syncing...');
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: { action: 'uptime_guard_sync' },
                    success: function(response) {
                        if (response.success) {
                            status.html('<span style="color: green;">✅ ' + response.data.message + '</span>');
                        } else {
                            status.html('<span style="color: red;">❌ ' + response.data + '</span>');
                        }
                        btn.prop('disabled', false);
                    },
                    error: function() {
                        status.html('<span style="color: red;">❌ Sync failed.</span>');
                        btn.prop('disabled', false);
                    }
                });
            });
        });
        </script>
        <?php
    }

    public function ajax_sync()
    {
        $result = $this->sync_plugins();
        if (is_wp_error($result)) {
            wp_send_json_error($result->get_error_message());
        } else {
            wp_send_json_success(['message' => $result]);
        }
    }

    public function get_plugins_data()
    {
        if (!function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        $all_plugins = get_plugins();
        $active_plugins = get_option('active_plugins', []);
        $update_plugins = get_site_transient('update_plugins');
        $plugins_data = [];

        foreach ($all_plugins as $file => $plugin) {
            $is_active = in_array($file, $active_plugins);
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

    public function sync_plugins()
    {
        $settings = get_option(UPTIME_GUARD_OPTION_KEY, []);

        if (empty($settings['app_url']) || empty($settings['pairing_code'])) {
            return new WP_Error('not_configured', 'App URL and pairing code are required.');
        }

        if (empty($settings['connected'])) {
            $pair_result = $this->pair_site($settings);
            if (is_wp_error($pair_result)) {
                return $pair_result;
            }
        }

        $plugins = $this->get_plugins_data();

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
            'sslverify' => true,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code >= 200 && $code < 300) {
            $settings['last_sync'] = current_time('mysql');
            $settings['connected'] = true;
            update_option(UPTIME_GUARD_OPTION_KEY, $settings);
            return sprintf('Synced %d plugins (%d outdated)', $body['plugins_count'] ?? count($plugins), $body['outdated_count'] ?? 0);
        } else {
            if ($code === 404) {
                $settings['connected'] = false;
                update_option(UPTIME_GUARD_OPTION_KEY, $settings);
                return new WP_Error('pairing_failed', 'Pairing failed. Check your pairing code.');
            }
            return new WP_Error('sync_failed', 'Sync failed with status: ' . $code);
        }
    }

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
            'sslverify' => true,
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
            return new WP_Error('pairing_failed', $body['message'] ?? 'Pairing failed with status: ' . $code);
        }
    }
}

UptimeGuardWP::instance();
