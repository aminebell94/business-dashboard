import { NextResponse } from 'next/server';
export async function POST(req: Request) {
    const { identifier, password } = await req.json();
    const r = await fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/
local`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
    });
    if (!r.ok) return new NextResponse('Invalid credentials', { status: 401 });
    const { jwt, user } = await r.json();
    const res = NextResponse.json({
        user: {
            id: user.id, username:
                user.username
        }
    });
    res.cookies.set('strapi_jwt', jwt, {
        httpOnly: true, secure: true,
        sameSite: 'lax', path: '/'
    });
    return res;
}
