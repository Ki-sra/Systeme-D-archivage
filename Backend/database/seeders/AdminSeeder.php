<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        User::updateOrCreate(
            ['email' => 'admin@ofppt.ma'],
            [
                'name'     => 'Super Admin',
                'password' => Hash::make('admin1234'),
                'role'     => 'admin',
                'is_active' => true,
            ]
        );

        // Create example users
        $users = [
            [
                'email'    => 'archiviste@ofppt.ma',
                'name'     => 'Archiviste OFPPT',
                'role'     => 'archiviste',
            ],
            [
                'email'    => 'gestionnaire@ofppt.ma',
                'name'     => 'Gestionnaire OFPPT',
                'role'     => 'gestionnaire',
            ],
            [
                'email'    => 'consultant@ofppt.ma',
                'name'     => 'Consultant OFPPT',
                'role'     => 'consultant',
            ],
        ];

        foreach ($users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name'     => $userData['name'],
                    'password' => Hash::make('password123'),
                    'role'     => $userData['role'],
                    'is_active' => true,
                ]
            );
        }

        $this->command->info('✅ Admin user created: admin@ofppt.ma / admin1234');
        $this->command->info('✅ Example users created with password: password123');
    }
}
