<?php

namespace App\Http\Controllers\api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Response;

class TestController extends Controller
{
    public function health()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'API is working!',
            'timestamp' => now(),
        ]);
    }
}