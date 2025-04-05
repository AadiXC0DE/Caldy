import { NextResponse } from 'next/server';

interface Holiday {
  date: string;
  name: string;
  localName: string;
  countryCode: string;
  types?: string[];
  global: boolean;
}

interface Country {
  countryCode: string;
  name: string;
}
    
const BASE_URL = 'https://date.nager.at/api/v3';

const ADDITIONAL_COUNTRIES: Country[] = [
  { countryCode: 'IN', name: 'India' },
  { countryCode: 'SG', name: 'Singapore' },
  { countryCode: 'AE', name: 'United Arab Emirates' }
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year') || new Date().getFullYear();
    const countryCode = searchParams.get('countryCode') || 'US';
    
    const response = await fetch(`${BASE_URL}/PublicHolidays/${year}/${countryCode}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `No holiday data available for country: ${countryCode}`, festivals: [] },
          { status: 404 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to fetch holiday data' }, 
        { status: response.status }
      );
    }
    
    const holidayData = await response.json() as Holiday[];
    
    // Transform the API data to match our event format
    const festivals = holidayData.map((holiday: Holiday) => ({
      id: `festival-${holiday.date}-${holiday.name.replace(/\s+/g, '-')}`,
      title: holiday.name,
      start: new Date(holiday.date),
      end: new Date(holiday.date),
      allDay: true,
      description: `${holiday.localName}${holiday.types?.length ? ` - ${holiday.types.join(', ')}` : ''}`,
      isFestival: true,
      color: '#FF5722',  // Distinct color for festivals
      countries: [countryCode],
      types: holiday.types || [],
      global: holiday.global,
    }));
    
    const countriesResponse = await fetch(`${BASE_URL}/AvailableCountries`);
    
    let countries: Country[] = [];
    
    if (countriesResponse.ok) {
      countries = await countriesResponse.json() as Country[];
      
      for (const additionalCountry of ADDITIONAL_COUNTRIES) {
        if (!countries.some((c: Country) => c.countryCode === additionalCountry.countryCode)) {
          countries.push(additionalCountry);
        }
      }
      
      countries.sort((a: Country, b: Country) => a.name.localeCompare(b.name));
    } else {
      countries = [...ADDITIONAL_COUNTRIES];
      if (!countries.some((c: Country) => c.countryCode === countryCode)) {
        countries.push({ countryCode, name: countryCode });
      }
    }
    
    return NextResponse.json({ 
      festivals,
      countries 
    });
  } catch (error) {
    console.error('Error fetching holiday data:', error);
    return NextResponse.json(
      { error: 'Failed to process holiday data' }, 
      { status: 500 }
    );
  }
} 