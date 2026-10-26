<?php
/**
 * WebShortcut — mail configuration template.
 * Copy to config.php and fill in. config.php is gitignored; never commit real credentials.
 */

define('SMTP_HOST', 'smtp.gmail.com');
define('SMTP_PORT', 587);
define('SMTP_USER', 'your-address@gmail.com');   // Gmail account used to send
define('SMTP_PASS', 'xxxx xxxx xxxx xxxx');      // Gmail App Password (not the account password)

// Who receives contact-form inquiries.
define('MAIL_RECIPIENTS', [
    'info@unodotnet.com',
]);
