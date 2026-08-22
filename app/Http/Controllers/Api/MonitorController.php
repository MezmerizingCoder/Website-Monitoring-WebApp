<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Monitor;
use App\Models\Check;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class MonitorController extends Controller
{
    public function index(Request $request)
    {
        $query = $request->user()->monitors()->with(['latestCheck', 'activeIncident']);

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                  ->orWhere('url', 'LIKE', "%{$search}%");
            });
        }

        $monitors = $query->orderByDesc('created_at')->paginate(15);

        return response()->json($monitors);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'url' => 'required|url|max:2048',
            'type' => 'in:http,https,ping,keyword',
            'interval_seconds' => 'integer|min:30|max:86400',
            'keyword' => 'nullable|string|max:255',
            'expected_status_code' => 'string|max:3',
            'headers' => 'nullable|array',
        ]);

        if (!$request->user()->canCreateMonitor()) {
            return response()->json([
                'message' => 'Monitor limit reached. Please upgrade your plan.',
            ], 403);
        }

        // Use plan's interval if available
        $interval = $validated['interval_seconds'] ?? 300;
        if ($request->user()->plan) {
            $interval = max($interval, $request->user()->plan->check_interval_seconds);
        }

        $monitor = $request->user()->monitors()->create([
            ...$validated,
            'interval_seconds' => $interval,
            'status' => 'pending',
        ]);

        // Perform initial check
        $this->performCheck($monitor);

        return response()->json($monitor->load('latestCheck'), 201);
    }

    public function show(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        return response()->json(
            $monitor->load(['latestCheck', 'activeIncident'])
        );
    }

    public function update(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'url' => 'sometimes|url|max:2048',
            'type' => 'sometimes|in:http,https,ping,keyword',
            'interval_seconds' => 'sometimes|integer|min:30|max:86400',
            'keyword' => 'nullable|string|max:255',
            'expected_status_code' => 'sometimes|string|max:3',
            'headers' => 'nullable|array',
            'is_active' => 'sometimes|boolean',
        ]);

        $monitor->update($validated);

        return response()->json($monitor->fresh()->load('latestCheck'));
    }

    public function destroy(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->delete();

        return response()->json(['message' => 'Monitor deleted']);
    }

    public function pause(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->update(['status' => 'paused', 'is_active' => false]);

        return response()->json($monitor->fresh());
    }

    public function resume(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $monitor->update(['status' => 'pending', 'is_active' => true]);

        return response()->json($monitor->fresh());
    }

    public function checks(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $checks = $monitor->checks()
            ->orderByDesc('checked_at')
            ->paginate(50);

        return response()->json($checks);
    }

    public function checkStats(Request $request, Monitor $monitor)
    {
        if ($monitor->user_id !== $request->user()->id) {
            abort(403);
        }

        $days = (int) $request->get('days', 30);
        $since = now()->subDays($days);

        $total = $monitor->checks()->where('checked_at', '>=', $since)->count();
        $up = $monitor->checks()->where('checked_at', '>=', $since)->where('status', 'up')->count();
        $uptime = $total > 0 ? round(($up / $total) * 100, 2) : 100;

        $avgResponse = $monitor->checks()
            ->where('checked_at', '>=', $since)
            ->where('status', 'up')
            ->avg('response_time');

        $responseTimes = $monitor->checks()
            ->where('checked_at', '>=', $since)
            ->where('status', 'up')
            ->selectRaw('DATE(checked_at) as date, AVG(response_time) as avg_response')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $incidents = $monitor->incidents()
            ->where('started_at', '>=', $since)
            ->orderByDesc('started_at')
            ->get();

        return response()->json([
            'uptime_percentage' => $uptime,
            'avg_response_time' => round($avgResponse, 2),
            'total_checks' => $total,
            'up_checks' => $up,
            'down_checks' => $total - $up,
            'response_times' => $responseTimes,
            'incidents' => $incidents,
            'days' => $days,
        ]);
    }

    /**
     * Enhanced check that gathers HTTP status, SSL, IP, hosting, timing, and more.
     */
    protected function performCheck(Monitor $monitor): void
    {
        $startTime = microtime(true);
        $status = 'up';
        $responseCode = null;
        $errorMessage = null;
        $bodyPreview = null;

        // Detail fields
        $httpStatusText = null;
        $ipAddress = null;
        $serverSoftware = null;
        $hostingProvider = null;
        $cdnProvider = null;
        $contentType = null;
        $contentLength = null;
        $redirectUrl = null;
        $redirectCount = 0;
        $sslStatus = 'unknown';
        $sslExpiry = null;
        $sslIssuer = null;
        $sslDaysRemaining = null;
        $dnsTime = null;
        $connectTime = null;
        $tlsTime = null;
        $ttfb = null;
        $allHeaders = [];

        $url = $monitor->url;
        $parsedUrl = parse_url($url);
        $host = $parsedUrl['host'] ?? '';

        // ── DNS Resolution ──
        $dnsStart = microtime(true);
        $ipAddress = @gethostbyname($host);
        if ($ipAddress === $host) {
            $ipAddress = null; // gethostbyname returns input on failure
        }
        $dnsTime = round((microtime(true) - $dnsStart) * 1000, 2);

        // ── SSL Certificate Check ──
        if (($parsedUrl['scheme'] ?? '') === 'https' && $ipAddress) {
            $sslInfo = $this->checkSslCertificate($host, $parsedUrl['port'] ?? 443);
            $sslStatus = $sslInfo['status'];
            $sslExpiry = $sslInfo['expiry'];
            $sslIssuer = $sslInfo['issuer'];
            $sslDaysRemaining = $sslInfo['days_remaining'];
        }

        // ── HTTP Request with detailed timing ──
        try {
            // Use curl for detailed timing info
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_MAXREDIRS => 5,
                CURLOPT_TIMEOUT => 30,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_SSL_VERIFYPEER => false,
                CURLOPT_SSL_VERIFYHOST => false,
                CURLOPT_HEADER => true,
                CURLOPT_NOBODY => false,
                CURLOPT_USERAGENT => 'UptimeGuard/1.0 (https://uptimeguard.dev)',
                CURLOPT_ENCODING => '',
            ]);

            $responseBody = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $responseInfo = curl_getinfo($ch);
            $appconnectTime = curl_getinfo($ch, CURLINFO_APPCONNECT_TIME);
            $curlError = curl_error($ch);
            $curlErrno = curl_errno($ch);
            curl_close($ch);

            // Timing from curl
            $connectTime = round($responseInfo['connect_time'] * 1000, 2);
            $tlsTime = ($appconnectTime && $appconnectTime > 0)
                ? round(($appconnectTime - $responseInfo['connect_time']) * 1000, 2)
                : null;
            $ttfb = round($responseInfo['starttransfer_time'] * 1000, 2);

            // Redirect info
            $redirectCount = $responseInfo['redirect_count'];
            if ($redirectCount > 0) {
                $redirectUrl = $responseInfo['redirect_url'] ?: null;
            }

            // Content info
            $contentType = $responseInfo['content_type'] ?? null;
            if ($contentType) {
                // Clean content type (remove charset etc)
                $contentType = explode(';', $contentType)[0];
                $contentType = trim($contentType);
            }
            $contentLength = $responseInfo['download_content_length'] > 0
                ? (int) $responseInfo['download_content_length']
                : null;

            // Server software from headers
            $rawHeaders = substr($responseBody, 0, $responseInfo['header_size']);
            $headerLines = array_filter(explode("\r\n", $rawHeaders));
            foreach ($headerLines as $line) {
                if (strpos($line, ':') !== false) {
                    [$key, $value] = explode(':', $line, 2);
                    $allHeaders[trim($key)] = trim($value);
                }
            }

            $serverSoftware = $allHeaders['server'] ?? null;
            $httpStatusText = $this->getHttpStatusText($httpCode);

            // Extract body (after headers)
            $bodyPreview = substr($responseBody, $responseInfo['header_size'], 500);

            // Detect CDN
            $cdnProvider = $this->detectCdn($allHeaders);

            // Detect hosting provider via IP
            if ($ipAddress) {
                $hostingProvider = $this->detectHostingProvider($ipAddress, $host);
            }

            // ── Determine status ──
            $responseCode = $httpCode;

            if ($curlError && $curlErrno !== 0) {
                $status = 'down';
                $errorMessage = $curlError;
            } elseif ($httpCode === 0) {
                $status = 'down';
                $errorMessage = 'No response received';
            } elseif ($httpCode >= 400) {
                $status = 'down';
                $errorMessage = 'HTTP ' . $httpCode . ' ' . $httpStatusText;
            }

            // Keyword check
            if ($status === 'up' && $monitor->keyword && !str_contains($responseBody, $monitor->keyword)) {
                $status = 'down';
                $errorMessage = 'Keyword "' . $monitor->keyword . '" not found';
            }

            // SSL warning for expiring soon
            if ($status === 'up' && $sslStatus === 'expiring_soon') {
                // Keep status up but add warning to error_message
                $errorMessage = ($errorMessage ? $errorMessage . '; ' : '') . 'SSL certificate expiring soon (' . $sslDaysRemaining . ' days)';
            }

            // SSL expired/invalid = down
            if ($status === 'up' && in_array($sslStatus, ['expired', 'invalid'])) {
                $status = 'down';
                $errorMessage = 'SSL certificate ' . $sslStatus;
            }

        } catch (\Exception $e) {
            $status = 'down';
            $errorMessage = $e->getMessage();
        }

        $responseTime = round((microtime(true) - $startTime) * 1000, 2);

        // ── Save check record ──
        $check = $monitor->checks()->create([
            'status' => $status,
            'response_code' => $responseCode,
            'response_time' => $responseTime,
            'error_message' => $errorMessage,
            'body_preview' => $bodyPreview,
            'ip_address' => $ipAddress,
            'checked_at' => now(),
        ]);

        // ── Update monitor with all details ──
        $monitor->update([
            'status' => $status,
            'last_checked_at' => now(),
            'last_response_time' => $responseTime,
            'error_message' => $errorMessage,
            'last_up_at' => $status === 'up' ? now() : $monitor->last_up_at,
            'last_down_at' => $status === 'down' ? now() : $monitor->last_down_at,
            // HTTP
            'http_status_code' => $responseCode,
            'http_status_text' => $httpStatusText,
            // SSL
            'ssl_status' => $sslStatus,
            'ssl_expiry' => $sslExpiry,
            'ssl_issuer' => $sslIssuer,
            'ssl_days_remaining' => $sslDaysRemaining,
            // Network
            'ip_address' => $ipAddress,
            'server_software' => $serverSoftware,
            'hosting_provider' => $hostingProvider,
            'cdn_provider' => $cdnProvider,
            'content_type' => $contentType,
            'content_length' => $contentLength,
            // Redirects
            'redirect_url' => $redirectUrl,
            'redirect_count' => $redirectCount,
            // Timing
            'dns_time' => $dnsTime,
            'connect_time' => $connectTime,
            'tls_time' => $tlsTime,
            'ttfb' => $ttfb,
            // Headers
            'headers' => $allHeaders ?: null,
        ]);

        // Update uptime percentage
        $total = $monitor->checks()->count();
        $up = $monitor->checks()->where('status', 'up')->count();
        $monitor->update(['uptime_percentage' => $total > 0 ? round(($up / $total) * 100, 2) : 100]);

        // Update avg response time
        $avgResponse = $monitor->checks()->where('status', 'up')->avg('response_time');
        $monitor->update(['avg_response_time' => round($avgResponse, 2)]);
    }

    /**
     * Check SSL certificate details for a host.
     */
    private function checkSslCertificate(string $host, int $port = 443): array
    {
        $result = [
            'status' => 'unknown',
            'expiry' => null,
            'issuer' => null,
            'days_remaining' => null,
        ];

        try {
            $context = stream_context_create([
                'ssl' => [
                    'capture_peer_cert' => true,
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $stream = @stream_socket_client(
                "ssl://{$host}:{$port}",
                $errno,
                $errstr,
                10,
                STREAM_CLIENT_CONNECT,
                $context
            );

            if (!$stream) {
                $result['status'] = 'invalid';
                return $result;
            }

            $cert = stream_context_get_params($stream);
            $peerCert = $cert['options']['ssl']['peer_certificate'] ?? null;

            if (!$peerCert) {
                $result['status'] = 'missing';
                fclose($stream);
                return $result;
            }

            $certInfo = openssl_x509_parse($peerCert);
            fclose($stream);

            if (!$certInfo) {
                $result['status'] = 'invalid';
                return $result;
            }

            // Expiry
            $expiryTimestamp = $certInfo['validTo_time_t'] ?? null;
            if ($expiryTimestamp) {
                $result['expiry'] = date('Y-m-d H:i:s', $expiryTimestamp);
                $daysRemaining = (int) floor(($expiryTimestamp - time()) / 86400);
                $result['days_remaining'] = $daysRemaining;

                if ($daysRemaining < 0) {
                    $result['status'] = 'expired';
                } elseif ($daysRemaining <= 14) {
                    $result['status'] = 'expiring_soon';
                } else {
                    $result['status'] = 'valid';
                }
            }

            // Issuer
            $issuer = $certInfo['issuer'] ?? [];
            $issuerParts = [];
            foreach (['O', 'CN', 'C'] as $field) {
                if (isset($issuer[$field])) {
                    $issuerParts[] = $issuer[$field];
                }
            }
            $result['issuer'] = implode(', ', $issuerParts) ?: null;

        } catch (\Exception $e) {
            $result['status'] = 'invalid';
        }

        return $result;
    }

    /**
     * Detect CDN provider from response headers.
     */
    private function detectCdn(array $headers): ?string
    {
        $server = strtolower($headers['server'] ?? '');
        $cfRay = $headers['cf-ray'] ?? '';
        $xAmzCfId = $headers['x-amz-cf-id'] ?? '';
        $xFastly = $headers['x-fastly-request-id'] ?? '';
        $xServedBy = $headers['x-served-by'] ?? '';
        $xShopify = $headers['x-shopify-stage'] ?? '';

        if ($cfRay) return 'Cloudflare';
        if ($xAmzCfId) return 'Amazon CloudFront';
        if ($xFastly) return 'Fastly';
        if (strpos($xServedBy, 'cache') !== false) return 'Varnish';
        if ($xShopify) return 'Shopify CDN';
        if (strpos($server, 'cloudflare') !== false) return 'Cloudflare';
        if (strpos($server, 'akamaighost') !== false) return 'Akamai';
        if (strpos($server, 'cloudfront') !== false) return 'Amazon CloudFront';
        if (strpos($server, 'varnish') !== false) return 'Varnish';
        if (strpos($server, 'cdn') !== false) return 'CDN';

        return null;
    }

    /**
     * Detect hosting provider from IP address using reverse DNS and IP range checks.
     */
    private function detectHostingProvider(string $ip, string $host): ?string
    {
        // 1) Check PTR record (reverse DNS)
        $ptr = @gethostbyaddr($ip);
        if ($ptr && $ptr !== $ip) {
            $ptrLower = strtolower($ptr);

            $ptrMap = [
                'cloudflare'    => 'Cloudflare',
                'amazonaws'     => 'Amazon AWS',
                'amazon'        => 'Amazon AWS',
                'aws'           => 'Amazon AWS',
                'google'        => 'Google Cloud',
                'azure'         => 'Microsoft Azure',
                'digitalocean'  => 'DigitalOcean',
                'linode'        => 'Akamai (Linode)',
                'vultr'         => 'Vultr',
                'heroku'        => 'Heroku',
                'vercel'        => 'Vercel',
                'netlify'       => 'Netlify',
                'fly.io'        => 'Fly.io',
                'fly-app'       => 'Fly.io',
                'render'        => 'Render',
                'wpengine'      => 'WP Engine',
                'kinsta'        => 'Kinsta',
                'siteground'    => 'SiteGround',
                'godaddy'       => 'GoDaddy',
                'namecheap'     => 'Namecheap',
                'cpanel'        => 'cPanel Hosting',
                'plesk'         => 'Plesk Hosting',
                'nginx'         => 'Nginx',
                'apache'        => 'Apache Hosting',
                'hetzner'       => 'Hetzner',
                'ovh'           => 'OVH',
                'ionos'         => 'IONOS',
                'dreamhost'     => 'DreamHost',
                'bluehost'      => 'Bluehost',
                'hostgator'     => 'HostGator',
                'a2hosting'     => 'A2 Hosting',
                'inmotion'      => 'InMotion Hosting',
                'hstgr'         => 'Hostinger',
                'hostinger'     => 'Hostinger',
            ];

            foreach ($ptrMap as $keyword => $provider) {
                if (strpos($ptrLower, $keyword) !== false) {
                    return $provider;
                }
            }

            // Return PTR hostname as a hint if it differs from the IP
            return $ptr;
        }

        // 2) Check known IP ranges (first octet patterns)
        $ipParts = explode('.', $ip);
        if (count($ipParts) === 4) {
            // Hetzner: 5.9.x.x, 162.55.x.x, 188.40.x.x
            if ($ipParts[0] === '5' && $ipParts[1] === '9') return 'Hetzner';
            if ($ipParts[0] === '162' && $ipParts[1] === '55') return 'Hetzner';
            if ($ipParts[0] === '188' && $ipParts[1] === '40') return 'Hetzner';

            // OVH: 51.38.x.x, 87.98.x.x, 148.113.x.x, 194.163.x.x, 2604: (IPv6)
            if ($ipParts[0] === '51' && $ipParts[1] === '38') return 'OVH';
            if ($ipParts[0] === '87' && $ipParts[1] === '98') return 'OVH';
            if ($ipParts[0] === '148' && $ipParts[1] === '113') return 'OVH';
            if ($ipParts[0] === '194' && $ipParts[1] === '163') return 'OVH';

            // DigitalOcean: 157.230.x.x, 167.71.x.x, 206.189.x.x
            if ($ipParts[0] === '157' && $ipParts[1] === '230') return 'DigitalOcean';
            if ($ipParts[0] === '167' && $ipParts[1] === '71') return 'DigitalOcean';
            if ($ipParts[0] === '206' && $ipParts[1] === '189') return 'DigitalOcean';

            // Vultr: 45.77.x.x, 149.28.x.x
            if ($ipParts[0] === '45' && $ipParts[1] === '77') return 'Vultr';
            if ($ipParts[0] === '149' && $ipParts[1] === '28') return 'Vultr';
        }

        return null;
    }

    /**
     * Get human-readable HTTP status text.
     */
    private function getHttpStatusText(int $code): string
    {
        $statuses = [
            200 => 'OK',
            201 => 'Created',
            204 => 'No Content',
            301 => 'Moved Permanently',
            302 => 'Found',
            304 => 'Not Modified',
            307 => 'Temporary Redirect',
            308 => 'Permanent Redirect',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            405 => 'Method Not Allowed',
            408 => 'Request Timeout',
            429 => 'Too Many Requests',
            500 => 'Internal Server Error',
            502 => 'Bad Gateway',
            503 => 'Service Unavailable',
            504 => 'Gateway Timeout',
        ];

        return $statuses[$code] ?? 'Unknown';
    }
}
