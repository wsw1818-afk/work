import { NextRequest, NextResponse } from 'next/server';
import { getTodos } from '@/lib/todos';

export async function GET(request: NextRequest) {
    const search = request.nextUrl.searchParams.get('search') ?? '';
    const todos = await getTodos(search);

    return NextResponse.json({ data: todos });
}
