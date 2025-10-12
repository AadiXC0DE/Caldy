import { NextResponse } from 'next/server';
import ICAL from 'ical.js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'iCal URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the iCal data
    let response;
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'Caldy/1.0',
        },
      });
    } catch (fetchError) {
      console.error('Network error fetching iCal:', fetchError);
      return NextResponse.json(
        { error: 'Unable to connect to the calendar URL. Please check if the URL is accessible.' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error(`iCal fetch failed: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to access calendar (${response.status}): ${response.statusText}` },
        { status: response.status }
      );
    }

    let icalData;
    try {
      icalData = await response.text();
    } catch (error) {
      console.error('Error reading iCal data:', error);
      return NextResponse.json(
        { error: 'Error reading calendar data' },
        { status: 502 }
      );
    }

    if (!icalData || icalData.trim().length === 0) {
      return NextResponse.json(
        { error: 'Calendar file is empty or not accessible' },
        { status: 404 }
      );
    }

    // Parse the iCal data using ical.js
    let jcalData, comp, vevents;
    try {
      jcalData = ICAL.parse(icalData);
      comp = new ICAL.Component(jcalData);
      vevents = comp.getAllSubcomponents('vevent');
    } catch (parseError) {
      console.error('Error parsing iCal data:', parseError);
      return NextResponse.json(
        { error: 'Invalid calendar format. Please ensure the URL points to a valid iCal (.ics) file.' },
        { status: 422 }
      );
    }

    if (!vevents || vevents.length === 0) {
      return NextResponse.json(
        { error: 'No events found in the calendar' },
        { status: 404 }
      );
    }

    // Convert the ICAL events to our app's event format
    const events = vevents.map(vevent => {
      try {
        const event = new ICAL.Event(vevent);

        const title = event.summary || 'Untitled Event';
        const description = event.description || '';
        const location = event.location || '';

        let start, end;

        if (event.startDate) {
          start = event.startDate.toJSDate();
        } else {
          start = new Date();
        }

        if (event.endDate) {
          end = event.endDate.toJSDate();
        } else {
          // Default to 1 hour if no end date
          end = new Date(start.getTime() + 60 * 60 * 1000);
        }

        // Check if all day by looking at the time component
        const allDay = event.startDate &&
          event.startDate.hour === 0 &&
          event.startDate.minute === 0 &&
          event.endDate &&
          event.endDate.hour === 0 &&
          event.endDate.minute === 0;

        return {
          id: `ical-${uuidv4()}`,
          title,
          start,
          end,
          allDay,
          description,
          location,
          color: '#3788d8', // Default color for imported events
          isIcalEvent: true,
        };
      } catch (eventError) {
        console.warn('Error processing individual iCal event:', eventError);
        // Skip malformed events but continue processing others
        return null;
      }
    }).filter(Boolean); // Remove null entries from malformed events

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Unexpected error processing iCal data:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing the calendar' },
      { status: 500 }
    );
  }
} 