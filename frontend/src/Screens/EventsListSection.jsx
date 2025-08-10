import React, { useContext, useEffect, useState, useMemo, useRef } from 'react'
import EventCard from '@/Components/EventCard'
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEventContext } from '@/Context';
import EventDeailsScreen from '@/Screens/EventDetailsScreen';
import { cn } from '@/lib/utils'
import { categories } from '@/lib/Constants'
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { useAuthContext } from '../AuthContext';


const EventsListSection = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedcategory, setSelectedCategory] = useState([]);
  const { events, fetchEvents } = useEventContext();
  // displayingEvents - By default diaplay 12 evelnts. (devides by 4, 3 and 2 which are the number of columns for different screen sizes)
  // After clicking on a 'Show More' button there next 12 events will be displayed etc...
  const numberOfEventsOnScreen = 12 // here 12
  const [displayingEvents, setDisplayingEvents] = useState(numberOfEventsOnScreen); 
  const currentLocation = useLocation();
  const location = currentLocation.pathname.includes("/event/"); // Here input the location of the screen that should contain this dialog
  const params = useParams();
  const eventId = parseInt(params.eventId);
  const dialogRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthContext()


  useEffect(() => {
    fetchEvents();
  }, [])

  useEffect(() => {
    setShowDialog(location);
    toggleDialog();
  }, [location])

  function toggleDialog() {
    if (location && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (dialogRef.current && dialogRef.current.open) {
      dialogRef.current.close();
    }
  }

  const handleCloseDialog = () => {
    if (dialogRef.current) {
      dialogRef.current.close();
    }
    navigate('/');
  }

  // This checks if user clicked outside the dialog (on the dialog backdrop)
  const handleDialogClick = (e) => {
    if (e.target === dialogRef.current) {
      handleCloseDialog();
    }
  };

  // Sets the current event to the based on which button is clicked in order to show appropriate event details dialog
  const currentEvent = useMemo(() => {
    if(eventId && events?.length) {
      return events.find(event => event.id === eventId) || null;
    }
    return null;
  }, [events, eventId])

  // this line checks if the currently logged in user is the owner/creator of the selected event in order to display the `edit` button
  const isOwner = user && currentEvent && currentEvent.createdBy === user.id;

  const selectCategory = (e) => {
    // if (selectedcategory.includes(e)) { 
    //   setSelectedCategory(selectedcategory.filter((s) => s != e)) // Remove // IN THIS APPRACH THE STATE WILL UPDATE AFTER THE FUNCTION COMPLETES!
    // } else {
    //   setSelectedCategory([...selectedcategory, e]); // Add
    // }
    setSelectedCategory(prevSelectedCategory => { // IN THIS APPROACH I WORK WITH MOST CURRENT STATE OF THE VALUE SO THE STATE UPDATES IMIDIATELY!
      if (prevSelectedCategory.includes(e)) {
        return prevSelectedCategory.filter((p => p != e));
      } else {
        return [...prevSelectedCategory, e]
      }
    })
  };

  // Filters events and displaes only those that belong to the selectedcategory categories
  const filteredEvents = useMemo(() => {
    if (selectedcategory.length === 0) { // if no category selectedcategory than display all (returned list will be used to display events) 
      return events || [];
    }

    return events.filter( (event) => selectedcategory.includes(event.eventCategory) ); // filter only events that category maches those in the `selectedcategory` list

  }, [selectedcategory, events]);

  const showMoreEvents = () => {
    //console.log("Show more button clicked");
    setDisplayingEvents((prev) => (prev + numberOfEventsOnScreen)); // this increases the number of displaying events
  };


  return (<>

    <div id="events" className="pt-24 min-h-screen px-5">

      {/* Category Selection Menu */}
      {/* slidesPerView and centerInsufficientSlides ensures snapping the last slide into view and prevent swiper from scrolling too far right*/}
      <Swiper className="flex max-w-screen-xl mb-10" slidesPerView="auto" 
            spaceBetween={8} slidesOffsetBefore={0} slidesOffsetAfter={0} centerInsufficientSlides={true}>
        {categories.map((category) =>
          <SwiperSlide key={category} onClick={() => selectCategory(category)}
                        className={cn("max-w-fit h-full px-2 pb-1 border border-white rounded-lg overflow-hidden shadow-2xl",
                        selectedcategory.includes(category)
                          ? "bg-gray-800/80 backdrop-brightness-200 border-gray-500"
                          : "bg-white/30 backdrop-blur-lg backdrop-brightness-150")}>
            {category}
          </SwiperSlide>)}
      </Swiper>

      {/* Event Cards */}
      {/* grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 mx-20 */}
      <div className="container mx-auto flex flex-wrap justify-center gap-6 px-6">
        {filteredEvents.slice(0, displayingEvents).map((event) => (
          <EventCard key={event.id} event={event} buttonText="More" />
        ))}
      </div>

      {filteredEvents.length === 0 && <div className="text-white leading-normal font-medium mt-10">Nothing to display</div>}

      {filteredEvents.length > displayingEvents && ( 
        <div className="flex justify-center relative z-10">
          <button onClick={() => showMoreEvents()} className="button-primary my-5">Show More</button>
        </div>
      )}
    </div>


    {/* Dialog showing details */}
    <dialog ref={dialogRef} className={cn("dialog items-center justify-center w-auto max-w-[80vw] md:max-w-3xl lg:max-w-5xl h-auto max-h-[80vh] md:h-[45vh] md:max-h-[45vh]",
      "rounded-lg shadow-xl backdrop:bg-black/50 z-50 overflow-hidden")} onClick={handleDialogClick} onClose={handleCloseDialog} >
      {currentEvent
        ? (<EventDeailsScreen event={currentEvent} onClose={handleCloseDialog} isOwner={isOwner} />)
        : (<div className='center-text'><p>Loading...</p></div>)
      }
    </dialog>


  </>)
}

export default EventsListSection
