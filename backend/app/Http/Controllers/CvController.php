<?php

namespace App\Http\Controllers;

use App\Models\Cv;
use Illuminate\Http\Request;

class CvController extends Controller
{
    /**
     * List the authenticated user's CVs (most recent first).
     */
    public function index(Request $request)
    {
        return $request->user()->cvs()->latest()->get();
    }

    /**
     * Create a new CV for the authenticated user.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'template_id' => ['nullable', 'string', 'max:64'],
            'data' => ['nullable', 'array'],
        ]);

        $cv = $request->user()->cvs()->create([
            'title' => $data['title'] ?? 'Mon CV',
            'template_id' => $data['template_id'] ?? 'executive',
            'data' => $data['data'] ?? [],
        ]);

        return response()->json($cv, 201);
    }

    public function show(Request $request, Cv $cv)
    {
        $this->authorizeCv($request, $cv);

        return $cv;
    }

    public function update(Request $request, Cv $cv)
    {
        $this->authorizeCv($request, $cv);

        $data = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'template_id' => ['sometimes', 'string', 'max:64'],
            'data' => ['sometimes', 'array'],
        ]);

        $cv->update($data);

        return $cv;
    }

    public function destroy(Request $request, Cv $cv)
    {
        $this->authorizeCv($request, $cv);

        $cv->delete();

        return response()->json(['message' => 'CV supprimé.']);
    }

    /**
     * Only the owner may touch a CV.
     */
    private function authorizeCv(Request $request, Cv $cv): void
    {
        abort_unless($cv->user_id === $request->user()->id, 403, 'Accès refusé.');
    }
}
