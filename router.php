<?php
/**
 * Development server router for PHP built-in server.
 *
 * Usage: php -S localhost:8000 router.php
 *
 * Routes /api/* requests to api/index.php (with ?route= query param)
 * and serves all other files statically from the document root.
 */

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if (preg_match('#^/api(/.*)?$#', $uri, $m)) {
    $_GET['route'] = $uri;
    require __DIR__ . '/api/index.php';
    return true;
}

$file = __DIR__ . $uri;
if ($uri !== '/' && is_file($file)) {
    return false;
}

$file = __DIR__ . '/index.html';
if (is_file($file)) {
    $mime = 'text/html';
    header("Content-Type: $mime");
    readfile($file);
    return true;
}

http_response_code(404);
echo 'Not Found';
return true;
