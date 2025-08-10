import React, { createContext, useContext, useEffect, useState} from 'react'
import axios from 'axios';


const EventContext = createContext(undefined);

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error("useEventContext must be used within an EventProvider")
  }
  return context
}

const API_BASE = "https://api-venuo.mk0x.com";

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvents = async() => {
    setIsLoading(true)
    try{
      const response = await fetch(`${API_BASE}/events`, { credentials: "include" });
      const data = await response.json();
      setEvents(data.events || []);
      return data.events;
    } catch (error) {
      //console.log("Failed to fetch events: ", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvent = (eventId) => {
    setEvents(e => e.filter(event => event.id !== eventId))
  }

  const values = {
    events,
    isLoading,
    setEvents,
    fetchEvents,
    removeEvent
  }

  return (
    <EventContext.Provider value={ values }>
      {children}
    </EventContext.Provider>
  )
}


