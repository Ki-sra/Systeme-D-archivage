<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@pv-system.local'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
                'is_active' => true,
            ]
        );

        $this->command->info('✅ Admin user created: admin@pv-system.local / admin1234');
    }
}
