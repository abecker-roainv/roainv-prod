// app/api/properties/route.js
import { NextResponse } from 'next/server';
import { getData } from '../units/services';

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const user = url.searchParams.get('user') || 'birent';
    
    if (!['birent', 'amplo', 'principal'].includes(user)) {
      return NextResponse.json(
        { error: 'Usuario no válido' }, 
        { status: 400 }
      );
    }

    const result = await getData(user);
    return NextResponse.json({ properties: result.properties });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' },
      { status: 500 }
    );
  }
}