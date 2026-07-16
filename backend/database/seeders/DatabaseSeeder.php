<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed one administrator (admins table) and one end user (users table).
     * The two live in separate tables with separate authentication.
     */
    public function run(): void
    {
        Admin::updateOrCreate(
            ['email' => 'admin@cvpro.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
            ]
        );

        User::updateOrCreate(
            ['email' => 'user@cvpro.test'],
            [
                'name' => 'Awa Diallo',
                'password' => Hash::make('password123'),
            ]
        );
    }
}
