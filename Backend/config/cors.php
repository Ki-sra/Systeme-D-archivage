<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Configuration — PV Archiving System
    |--------------------------------------------------------------------------
    | Allows the React frontend (localhost:5173 / 5174) to communicate
    | with this Laravel API without browser CORS errors.
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:5173'),
        'http://localhost:5174', // Vite fallback port
    ]),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    // Must be true for Sanctum cookie-based auth (SPA)
    // We use token-based auth, so false is fine here
    'supports_credentials' => false,

];
