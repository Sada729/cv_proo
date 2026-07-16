<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use App\Models\Cv;
use App\Models\User;

class AdminController extends Controller
{
    /**
     * High-level stats for the admin dashboard.
     */
    public function dashboard()
    {
        return response()->json([
            'stats' => [
                'users' => User::count(),
                'admins' => Admin::count(),
                'cvs' => Cv::count(),
                'new_users_7d' => User::where('created_at', '>=', now()->subDays(7))->count(),
            ],
            'recent_users' => User::latest()->take(8)->get(),
        ]);
    }
}
