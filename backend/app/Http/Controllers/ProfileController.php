<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Update the authenticated user's profile fields.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'avatar_url' => ['sometimes', 'nullable', 'url'],
        ]);

        $user->update($data);

        return $user;
    }

    /**
     * Upload a profile picture to the public disk and store its URL.
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:4096'],
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store("avatars/{$user->id}", 'public');
        $url = asset('storage/'.$path);

        $user->update(['avatar_url' => $url]);

        return response()->json(['avatar_url' => $url]);
    }
}
