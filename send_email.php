<?php
/**
 * WebShortcut — Contact Form Email Handler
 * Same pattern as DocMind / brandMind send_email.php.
 *
 * SETUP:
 * 1. Copy config.example.php to config.php and fill in the SMTP credentials
 *    (config.php is gitignored — never commit real credentials).
 * 2. PHPMailer lives in vendor/ (composer require phpmailer/phpmailer).
 * 3. Confirm the recipient addresses in config.php before going live.
 */

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

define('ERROR_LOG_FILE', __DIR__ . '/logs/email_errors.log');

if (!is_dir(__DIR__ . '/logs')) {
    mkdir(__DIR__ . '/logs', 0755, true);
}

function logEvent($type, $message, $context = []) {
    $timestamp = date('Y-m-d H:i:s');
    $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $entry = "[{$timestamp}] [{$type}] [IP: {$ip}] {$message}";
    if (!empty($context)) {
        $entry .= ' | Context: ' . json_encode($context, JSON_UNESCAPED_UNICODE);
    }
    $entry .= PHP_EOL;
    file_put_contents(ERROR_LOG_FILE, $entry, FILE_APPEND | LOCK_EX);
}

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Same-origin check (CSRF defence for a static page): a browser sends Origin on every
// cross-site POST, so a mismatched Origin or Referer is rejected. Absent headers
// (non-browser clients) fall through to the rate limiter.
$selfHost = strtolower(preg_replace('/:\d+$/', '', $_SERVER['HTTP_HOST'] ?? ''));
foreach (['HTTP_ORIGIN', 'HTTP_REFERER'] as $hdr) {
    if (!empty($_SERVER[$hdr])) {
        $srcHost = strtolower((string) parse_url($_SERVER[$hdr], PHP_URL_HOST));
        if ($srcHost !== $selfHost) {
            logEvent('ORIGIN', "Rejected cross-site POST from {$srcHost}", ['header' => $hdr]);
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Request rejected.']);
            exit;
        }
    }
}

// Rate limit: RATE_LIMIT_MAX submissions per IP per RATE_LIMIT_WINDOW seconds (file-based, no DB).
define('RATE_LIMIT_MAX', 3);
define('RATE_LIMIT_WINDOW', 600);
$rlFile = __DIR__ . '/logs/rl_' . md5($_SERVER['REMOTE_ADDR'] ?? 'unknown') . '.txt';
$now = time();
$hits = [];
if (is_file($rlFile)) {
    $hits = array_filter(array_map('intval', file($rlFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES)),
        function ($t) use ($now) { return $t > $now - RATE_LIMIT_WINDOW; });
}
if (count($hits) >= RATE_LIMIT_MAX) {
    logEvent('RATE_LIMIT', 'Too many submissions', ['hits_in_window' => count($hits)]);
    http_response_code(429);
    echo json_encode(['success' => false, 'message' => 'Too many messages in a short time. Please try again in a few minutes or call +961 1 648 440.']);
    exit;
}
$hits[] = $now;
file_put_contents($rlFile, implode(PHP_EOL, $hits) . PHP_EOL, LOCK_EX);

// Honeypot: real users never fill the hidden "website" field.
if (!empty($_POST['website'])) {
    logEvent('SPAM', 'Honeypot field filled');
    echo json_encode(['success' => true, 'message' => 'Thank you.']);
    exit;
}

$name         = htmlspecialchars(trim($_POST['name']         ?? ''));
$organization = htmlspecialchars(trim($_POST['organization'] ?? ''));
$email        = filter_var(trim($_POST['email']              ?? ''), FILTER_VALIDATE_EMAIL);
$phone        = htmlspecialchars(trim($_POST['phone']        ?? ''));
$interest     = htmlspecialchars(trim($_POST['interest']     ?? ''));
$message      = htmlspecialchars(trim($_POST['message']      ?? ''));

if (!$name || !$organization || !$email || !$interest) {
    logEvent('VALIDATION', 'Missing required fields', [
        'name'         => $name ?: '(empty)',
        'organization' => $organization ?: '(empty)',
        'email'        => $_POST['email'] ?? '(empty)',
        'interest'     => $interest ?: '(empty)',
    ]);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
    exit;
}

if (!file_exists(__DIR__ . '/config.php')) {
    logEvent('CONFIG', 'config.php missing — copy config.example.php');
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail is not configured yet. Please email us directly at info@unodotnet.com']);
    exit;
}
require __DIR__ . '/config.php';
require __DIR__ . '/vendor/autoload.php';

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = SMTP_USER;
    $mail->Password   = SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(SMTP_USER, 'WebShortcut Website');
    foreach (MAIL_RECIPIENTS as $to) {
        $mail->addAddress($to, 'WebShortcut Team');
    }
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "New inquiry from {$name} — {$organization} ({$interest})";
    $mail->Body = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
            <div style='background: #0b1120; color: #e8eaf0; padding: 30px; border-radius: 12px 12px 0 0;'>
                <h2 style='margin: 0; color: #14d6b4;'>New WebShortcut Inquiry</h2>
                <p style='margin: 8px 0 0; color: #8494b2;'>From the webshortcut.net contact form</p>
            </div>
            <div style='background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px;'>
                <table style='width: 100%; border-collapse: collapse;'>
                    <tr><td style='padding: 10px 0; color: #666; width: 130px;'><strong>Name:</strong></td><td style='padding: 10px 0; color: #333;'>{$name}</td></tr>
                    <tr><td style='padding: 10px 0; color: #666;'><strong>Company:</strong></td><td style='padding: 10px 0; color: #333;'>{$organization}</td></tr>
                    <tr><td style='padding: 10px 0; color: #666;'><strong>Email:</strong></td><td style='padding: 10px 0; color: #333;'><a href='mailto:{$email}'>{$email}</a></td></tr>
                    <tr><td style='padding: 10px 0; color: #666;'><strong>Phone:</strong></td><td style='padding: 10px 0; color: #333;'>" . ($phone ?: 'Not provided') . "</td></tr>
                    <tr><td style='padding: 10px 0; color: #666;'><strong>Interest:</strong></td><td style='padding: 10px 0; color: #333;'>{$interest}</td></tr>
                    <tr><td style='padding: 10px 0; color: #666; vertical-align: top;'><strong>Message:</strong></td><td style='padding: 10px 0; color: #333;'>" . nl2br($message ?: 'Not specified') . "</td></tr>
                </table>
            </div>
        </div>
    ";
    $mail->AltBody = "New WebShortcut Inquiry\n\nName: {$name}\nCompany: {$organization}\nEmail: {$email}\nPhone: {$phone}\nInterest: {$interest}\nMessage: {$message}";

    $mail->send();

    logEvent('SUCCESS', 'Email sent successfully', [
        'name' => $name, 'organization' => $organization, 'email' => $email, 'interest' => $interest,
    ]);
    echo json_encode(['success' => true, 'message' => 'Thank you! We will contact you within 24 hours.']);

} catch (Exception $e) {
    logEvent('SMTP_ERROR', $mail->ErrorInfo, [
        'name' => $name, 'organization' => $organization, 'email' => $email, 'exception' => $e->getMessage(),
    ]);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Something went wrong. Please email us directly at info@unodotnet.com']);
}
