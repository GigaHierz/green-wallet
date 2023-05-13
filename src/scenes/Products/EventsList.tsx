import React from 'react'
import { SAMPLE_EVENTS } from '../../models/Product'
import EventCard from './EventCard'


function EventsList() {
  return (
    <div className='EventsList container card shadow my-5 p-5'>
        <h1 className='text-center mb-3'>Events</h1>
        <div className="container">

          <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 g-3">
            {SAMPLE_EVENTS.map(event => <EventCard key={event.title} event={event} />)}
          </div>
        </div>
    </div>
  )
}

export default EventsList