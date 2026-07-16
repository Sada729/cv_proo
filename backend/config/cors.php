<?php

return [

    'paths' => ['api/*', 'auth/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'), // site utilisateur
        env('ADMIN_URL', 'http://localhost:5174'),     // site admin (séparé)
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Bearer-token auth (no cookies), so credentials are not required.
    'supports_credentials' => false,

];
