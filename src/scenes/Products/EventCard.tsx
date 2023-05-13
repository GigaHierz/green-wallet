import React from 'react'
import { Link } from 'react-router-dom'
import './EventCard.css';
import { ProductCollection } from '../../models/Product'
import { TextUtils } from '../../utils/TextUtils'

function EventCard({event}: {event: ProductCollection}) {

  const slug = TextUtils.slugify(event.title);

  return (
    <div className="EventCard col">
          <div className="card shadow-sm">

          <div className='img-container'>

          <Link to={`/p/${slug}`}>
            <img src={event.image} width='100%' alt={event.title} />
          </Link>
            
          </div>

            <div className="card-body">
                <h4 className='card-title'>
                    <Link to={`/p/${slug}`}>
                        {event.title}
                    </Link>
                    
                </h4>
              <p className="card-text">
                {event.description}
              </p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">Available Tickets: 10</small>
              </div>
            </div>
          </div>
        </div>
  )
}

export default EventCard