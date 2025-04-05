import { NextResponse } from 'next/server';

interface Country {
  countryCode: string;
  name: string;
}

const BASE_URL = 'https://date.nager.at/api/v3';

export async function GET() {
  try {
    const response = await fetch(`${BASE_URL}/AvailableCountries`);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch available countries' }, 
        { status: response.status }
      );
    }
    
    const countries = await response.json() as Country[];
    
    countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    
    const usIndex = countries.findIndex((c: Country) => c.countryCode === 'US');
    if (usIndex !== -1) {
      const us = countries.splice(usIndex, 1)[0];
      countries.unshift(us);
    }
    
    return NextResponse.json({ countries });
  } catch (error) {
    console.error('Error fetching available countries:', error);
    return NextResponse.json(
      { error: 'Failed to process country data' }, 
      { status: 500 }
    );
  }
} 