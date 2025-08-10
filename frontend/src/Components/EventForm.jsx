import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import flatpickr from "flatpickr";
import { English } from "flatpickr/dist/l10n/default.js";
import "flatpickr/dist/flatpickr.min.css";
import { customFlatpickrStyles } from '@/Components/FlatpickrStyles';
import { categories } from '@/lib/Constants';
import { useAuthContext } from "@/AuthContext";


const EventForm = ({ isUpdating = false }) => {
    const location = useLocation();
    const params = useParams();
    const { existingEvent = {} } = location.state || {};
    const { user } = useAuthContext();

    const eventId = params.eventId || existingEvent.id;

    const [eventTitle, setEventTitle] = useState(existingEvent?.eventTitle || "");
    const [eventDescription, setEventDescription] = useState(existingEvent?.eventDescription || "");
    const [eventDate, setEventDate] = useState(existingEvent?.eventDate || "");
    const [eventLocation, setEventLocation] = useState(existingEvent?.eventLocation || "");
    const [eventCategory, setEventCategory] = useState(existingEvent?.eventCategory || "");
    // const [isFinished, setIsFinished] = useState(existingEvent?.isFinished || false);
    const [createdBy, setCreatedBy] = useState(existingEvent?.createdBy || 0);
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState({});

    const navigate = useNavigate();
    const datePickerRef = useRef(null);

    const API_BASE = "https://api-venuo.mk0x.com"
    // const API_BASE = "http://localhost:5000"

    // this fetches events if updating is true
    useEffect(() => {
        if (isUpdating && eventId && !existingEvent.id) {
            fetchEventData();
        }
    }, [isUpdating, eventId, existingEvent.id]);


    const fetchEventData = async () => {
        try {
            const response = await fetch(`${API_BASE}/event/${eventId}`, {
                credentials: 'include'
            });
            
            if (response.ok) {
                const eventData = await response.json();
                setEventTitle(eventData.eventTitle || "");
                setEventDescription(eventData.eventDescription || "");
                setEventDate(eventData.eventDate || "");
                setEventLocation(eventData.eventLocation || "");
                setEventCategory(eventData.eventCategory || "");
                setCreatedBy(eventData.createdBy || 0);
                
                // Set image preview if event has an image
                if (eventData.imagePath) {
                    setImagePreview(eventData.imagePath);
                }
            } else {
                console.error('Failed to fetch event data');
                navigate('/'); // Redirect if event not found
            }
        } catch (error) {
            console.error('Error fetching event data:', error);
            navigate('/');
        }
    };

    // Add the custom styles to the document
    useEffect(() => {
        const styleElement = document.createElement('style');
        styleElement.type = 'text/css';
        styleElement.innerHTML = customFlatpickrStyles;
        document.head.appendChild(styleElement);
        
        return () => {
            document.head.removeChild(styleElement);
        };
    }, []);
    
    useEffect(() => {
        if (datePickerRef.current) {
            const fp = flatpickr(datePickerRef.current, {
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                time_24hr: true, // Use 24-hour format
                defaultDate: eventDate || undefined,
                minuteIncrement: 15,
                locale: {
                    ...English,
                    firstDayOfWeek: 1, // Monday as first day, dunno why this is not the default
                },
                onChange: (selectedDates) => {
                    setEventDate(selectedDates[0].toISOString());
                },
                animate: true,
                closeOnSelect: false,
                position: "auto"
            });
            
            return () => {
                fp.destroy();
            };
        }
    }, []);

    // This sets the created by to the id of the currently logged in user
    useEffect(() => {
        if (user && user.id && !isUpdating) {
            setCreatedBy(user.id);
        }
    }, [user, isUpdating]);


//    const validateForm = () => {
//        const newErrors = {};
//
//        if (!eventTitle.trim()) newErrors.eventTitle = "Title is required";
//        if (!eventDescription.trim()) newErrors.eventDescription = "Description is required";
//        if (!eventLocation.trim()) newErrors.eventLocation = "Location is required";
//        if (!eventCategory) newErrors.eventCategory = "Category is required";
//        if (!eventDate) newErrors.eventDate = "Date is required";
//
//        if (!image) {
//            newErrors.image = "Image is required";
//        } else {
//            const allowedTypes = ["image/jpeg", "image/png"];
//            if (!allowedTypes.includes(image.type)) {
//                newErrors.image = "Only JPG or PNG files are allowed";
//            }
//        }
//
//        return newErrors;
//    };


    const validateForm = () => {
        const errors = {};

        if (!eventTitle.trim()) errors.eventTitle = "Event title is required";
        if (!eventDescription.trim()) errors.eventDescription = "Event description is required";
        if (!eventDate) errors.eventDate = "Event date is required";
        if (!eventLocation.trim()) errors.eventLocation = "Event location is required";
        if (!eventCategory) errors.eventCategory = "Event category is required";
    
        // Fix image validation - only require image for new events OR if no existing image
        if (!isUpdating) {
            // For new events, image is required
            if (!image) errors.image = "Event image is required";
        } else {
            // For updates, image is only required if there's no existing image AND no new image
            if (!image && !imagePreview) {
                errors.image = "Event image is required";
            }
        }
        return errors;
    };


    const onSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        setError(validationErrors);

        if (Object.keys(validationErrors).length > 0) return;

        const formData = new FormData();
        formData.append("eventTitle", eventTitle);
        formData.append("eventDescription", eventDescription);
        formData.append("eventDate", eventDate);
        formData.append("eventLocation", eventLocation);
        formData.append("eventCategory", eventCategory);
        formData.append("createdBy", createdBy);
        if (image) formData.append("image", image);

        // Use eventId from params or existingEvent
        const updateId = eventId || existingEvent.id;
        const url = `${API_BASE}/${isUpdating ? `update_event/${updateId}` : "create_event"}`;
        
        const options = {
            method: isUpdating ? "PATCH" : "POST",
            body: formData,
            credentials: "include"
        };

        try {
            const response = await fetch(url, options);
            const data = await response.json();

            if (response.ok) {
                navigate('/');
            } else {
                // alert(data.message || "An error occurred");
                console.error("An error occurred", data.message)
            }
        } catch (error) {
            console.error("Error submitting event:", error);
            // alert("Failed to submit event. Please try again.");
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
    };

    return (<>
        <div className="w-full min-h-[calc(100vh-80px)] flex items-start justify-center pt-12">
        <section className="form">
            <h1 className="text-3xl font-extrabold text-gray-200 mb-6 text-left capitalize">{isUpdating ? "Update Event" : "Create Event"}</h1>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-6" onSubmit={onSubmit} autoComplete="off">
                {/* Title and Location */}
                <div>
                    <label htmlFor="eventTitle" className="font-bold text-lg text-gray-200 text-left w-full block ml-2">Event Title</label>
                    <input id="eventTitle" type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)}
                    maxLength={50} placeholder="Enter event title" className="input-field"/>
                    {error.eventTitle && (<p className="text-left text-red-500 text-sm mt-1">{error.eventTitle}</p>)}
                </div>

                <div>
                    <label htmlFor="eventLocation" className="font-bold text-lg text-gray-200 text-left w-full block ml-2"> Event Location </label>
                    <input id="eventLocation" type="text" value={eventLocation} onChange={(e) => setEventLocation(e.target.value)}
                    maxLength={30} placeholder="Enter event location" className="input-field"/>
                    {error.eventLocation && (<p className="text-left text-red-500 text-sm mt-1">{error.eventLocation}</p>)}
                </div>

                {/* Category and Date */}
                <div>
                    <label htmlFor="eventCategory" className="font-bold text-lg text-gray-200 text-left w-full block ml-2">Event Category</label>
                    <select id="eventCategory" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}
                        className="input-field">
                        <option value="" disabled>Select Category</option>
                        {categories.map((category) => <option key={category} value={category} className="text-black">{category}</option>)}
                    </select>
                    {error.eventCategory && (
                        <p className="text-left text-red-500 text-sm mt-1">{error.eventCategory}</p>
                    )}
                </div>

                <div>
                    <label htmlFor="eventDate" className="font-bold text-lg text-gray-200 text-left w-full block ml-2">Event Date</label>
                    <input type="text" ref={datePickerRef} placeholder="Select date and time"
                        className="input-field"/>
                    {error.eventDate && (
                        <p className="text-left text-red-500 text-sm mt-1">{error.eventDate}</p>
                    )}
                </div>
            </form>
            
            {/* Desciption and Image */}
            <form className="grid grid-cols-1 gap-4 mt-8">
                <div>
                    <label htmlFor="eventDescription" className="font-bold text-lg text-gray-200 text-left w-full block ml-2">Event Description</label>
                    <textarea id="eventDescription" value={eventDescription} onChange={(e) => setEventDescription(e.target.value)} 
                        maxLength={400} placeholder="Describe what your event is about..." style={{ resize: 'none', height: '100px' }} // Fixed height, no resize
                        className="input-field"/>
                    <div className="flex justify-between mt-1">
                        {error.eventDescription && (
                            <p className="text-left text-red-500 text-sm mt-1">{error.eventDescription}</p>
                        )}
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {eventDescription.length}/400
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="image" className="font-bold text-lg text-gray-200 text-left w-full block ml-2">Event Image</label>
                    
                    {/* Image preview area */}
                    {imagePreview && (
                        <div className="mt-2 mb-3 border border-gray-300 p-2 rounded-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-gray-600">Uploaded Image</span>
                                <button type="button" onClick={removeImage} className="text-red-500 text-sm hover:text-red-700">
                                    Remove
                                </button>
                            </div>
                            <img src={imagePreview} alt="Preview" className="max-h-40 mx-auto"/>
                        </div>
                    )}
                    
                    {/* Image upload button */}
                    <label className="input-field">
                        <span className="flex items-center space-x-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span className="font-medium">
                                {imagePreview ? "Change image" : "Drop files or Browse"}
                            </span>
                        </span>
                        <input type="file" accept="image/*" name="image" className="hidden" onChange={handleImageChange} />
                    </label>
                    {error.image && (
                            <p className="text-left text-red-500 text-sm mt-1">{error.image}</p>
                        )}
                </div>
            </form>

            {/* Submit and Cancel buttons */}
            <div className="flex items-center justify-end mt-8">
                <button type="button" onClick={() => navigate('/')}
                    className="mr-4 py-2 px-4 border border-gray-300 rounded-md text-sm font-medium text-white
                    hover:bg-gray-50/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                </button>
                <button type="submit" className={`py-2 px-6 border border-transparent rounded-md shadow-sm text-sm
                    font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none transition-all`}
                    onClick={onSubmit}> {/* ${Object.keys(error).length > 0 ? 'opacity-50 cursor-not-allowed' : ''} */}
                    {isUpdating ? "Update Event" : "Create Event"}
                </button>
            </div>
        </section>
        </div>
    </>);
};

export default EventForm;
