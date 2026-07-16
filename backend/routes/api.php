<?php

use App\Http\Controllers\Admin\AccountController;
use App\Http\Controllers\Admin\AdminController;
use App\Http\Controllers\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\CvController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| USER SITE  — authentification indépendante (table users)
|--------------------------------------------------------------------------
*/
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// 'user' middleware => rejette un token admin sur les routes utilisateur.
Route::middleware(['auth:sanctum', 'user'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::apiResource('cvs', CvController::class);
});

/*
|--------------------------------------------------------------------------
| ADMIN SITE  — authentification indépendante (table admins)
|--------------------------------------------------------------------------
*/
Route::post('/admin/login', [AdminAuthController::class, 'login']);

// 'admin' middleware => rejette un token utilisateur sur les routes admin.
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::post('/logout', [AdminAuthController::class, 'logout']);
    Route::get('/me', [AdminAuthController::class, 'me']);
    Route::get('/dashboard', [AdminController::class, 'dashboard']);
    Route::apiResource('users', UserController::class);       // gérer les utilisateurs
    Route::apiResource('admins', AccountController::class)->except(['show']); // gérer les admins
});
