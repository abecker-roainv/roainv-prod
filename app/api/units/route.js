// app/api/units/route.js
import { NextResponse } from 'next/server';
import { getData } from './services';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const user = url.searchParams.get('user') || 'birent';
    
    if (!['birent', 'amplo', 'principal'].includes(user)) {
      return NextResponse.json({ error: 'Usuario no válido' }, { status: 400 });
    }

    const data = await getData(user);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}