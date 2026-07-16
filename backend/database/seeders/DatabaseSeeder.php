<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with a default admin and a test user.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@cvpro.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'role' => 'admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@cvpro.test'],
            [
                'name' => 'Awa Diallo',
                'password' => Hash::make('password123'),
                'role' => 'user',
            ]
        );
    }
}
