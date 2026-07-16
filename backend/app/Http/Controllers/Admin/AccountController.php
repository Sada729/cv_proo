<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

/**
 * Lets admins manage the pool of administrators (admins table).
 */
class AccountController extends Controller
{
    public function index(Request $request)
    {
        $query = Admin::query()->latest();

        if ($search = $request->query('search')) {
            $query->where(function ($w) use ($search) {
                $w->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        return $query->paginate(15);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:admins,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ]);

        $data['password'] = Hash::make($data['password']);

        return response()->json(Admin::create($data), 201);
    }

    public function update(Request $request, Admin $admin)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:admins,email,'.$admin->id],
            'password' => ['sometimes', 'nullable', 'confirmed', Password::min(8)],
        ]);

        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $admin->update($data);

        return $admin;
    }

    public function destroy(Request $request, Admin $admin)
    {
        if ($admin->id === $request->user()->id) {
            return response()->json(['message' => 'Vous ne pouvez pas supprimer votre propre compte.'], 422);
        }

        if (Admin::count() <= 1) {
            return response()->json(['message' => 'Impossible de supprimer le dernier administrateur.'], 422);
        }

        $admin->delete();

        return response()->json(['message' => 'Administrateur supprimé.']);
    }
}
