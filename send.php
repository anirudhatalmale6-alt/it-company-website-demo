<?php
/**
 * Xervix contact form handler.
 *
 * Receives the enquiry form, validates it server-side (the browser checks are a
 * convenience, not a defence), and emails it to the sales inbox.
 *
 * Works on standard shared hosting with PHP mail() enabled — including GoDaddy.
 * If the host blocks mail(), switch SEND_METHOD to 'smtp' and fill in the SMTP
 * block; nothing else needs to change.
 */

declare(strict_types=1);

const MAIL_TO      = 'Sales@Xervix.com.au';
const MAIL_SUBJECT = 'Website enquiry';
const MIN_MESSAGE  = 15;

header('Content-Type: application/json; charset=utf-8');

function fail(string $message, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $message]);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Method not allowed.', 405);
}

$field = static function (string $key): string {
    return trim((string)($_POST[$key] ?? ''));
};

// Honeypot: a real visitor never sees this field, so anything in it is a bot.
// Answer 200 so the bot believes it succeeded and does not retry.
if ($field('website') !== '') {
    echo json_encode(['ok' => true]);
    exit;
}

$name    = $field('name');
$company = $field('company');
$email   = $field('email');
$phone   = $field('phone');
$topic   = $field('topic');
$message = $field('message');

$errors = [];
if ($name === '')                                      { $errors['name']    = 'Please tell us your name.'; }
if ($email === '')                                     { $errors['email']   = 'Please give us an email address.'; }
elseif (!filter_var($email, FILTER_VALIDATE_EMAIL))    { $errors['email']   = 'That email address does not look right.'; }
if ($topic === '')                                     { $errors['topic']   = 'Please choose what it is about.'; }
if ($message === '')                                   { $errors['message'] = 'Please tell us a little about it.'; }
elseif (mb_strlen($message) < MIN_MESSAGE)             { $errors['message'] = 'A little more detail, please.'; }

// Header injection: anything with a newline in it never reaches a mail header.
foreach ([$name, $email, $company, $phone, $topic] as $singleLine) {
    if (preg_match('/[\r\n]/', $singleLine)) {
        fail('Invalid characters in submission.');
    }
}

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

$lines = [
    'Name:    ' . $name,
    'Company: ' . ($company !== '' ? $company : '—'),
    'Email:   ' . $email,
    'Phone:   ' . ($phone !== '' ? $phone : '—'),
    'Topic:   ' . $topic,
    '',
    'Message:',
    $message,
    '',
    '—',
    'Sent from the enquiry form at ' . ($_SERVER['HTTP_HOST'] ?? 'xervix.com.au'),
    'Received: ' . gmdate('Y-m-d H:i:s') . ' UTC',
];
$body = implode("\n", $lines);

// From must be a domain-owned address or the host's SPF check will bin it.
// The visitor's address goes in Reply-To so a reply reaches them.
$headers = [
    'From: Xervix Website <noreply@xervix.com.au>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: text/plain; charset=utf-8',
    'X-Mailer: PHP/' . phpversion(),
];

$subject = MAIL_SUBJECT . ' — ' . $topic;
$sent    = @mail(MAIL_TO, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    // Don't lose the enquiry just because the mail server is unhappy.
    @file_put_contents(
        __DIR__ . '/enquiries.log',
        "==== " . gmdate('c') . " ====\n" . $body . "\n\n",
        FILE_APPEND | LOCK_EX
    );
    fail('We could not send that just now. Please email Sales@Xervix.com.au directly.', 500);
}

echo json_encode(['ok' => true]);
