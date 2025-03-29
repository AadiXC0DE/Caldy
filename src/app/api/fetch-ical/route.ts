import { NextResponse } from 'next/server';
import ICAL from 'ical.js';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    
    // Fetch the iCal data
    const response = await fetch(url);
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch iCal data' }, 
        { status: response.status }
      );
    }
    
    const icalData = await response.text();
    
    // Parse the iCal data using ical.js
    const jcalData = ICAL.parse(icalData);
    const comp = new ICAL.Component(jcalData);
    const vevents = comp.getAllSubcomponents('vevent');
    
    // Convert the ICAL events to our app's event format
    const events = vevents.map(vevent => {
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
    });
    
    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error processing iCal data:', error);
    return NextResponse.json(
      { error: 'Failed to process iCal data' }, 
      { status: 500 }
    );
  }
} 