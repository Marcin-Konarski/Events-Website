import React, { useState } from 'react'
import { MapPin, Calendar, Tag, Users, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/AuthContext'
import { useEventContext } from '../Context';

const EventDetailsScreen = ({ event, onClose, isOwner = false }) => {
    if (!event) return <div>Event not found</div>;

    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuthContext();
    const { removeEvent } = useEventContext();
    const [currentEvent, setCurrentEvent] = useState(event);
    const [isLoading, setIsLoading] = useState(false);
    const isUserParticipant = user && currentEvent.participants?.some(p => p.id === user.id);
    const API_BASE = "https://api-venuo.mk0x.com"

    const onJoinEvent = async () => {
        if (!isAuthenticated) {
            // alert("You must first log in.");
            console.error('You must first log in');
            return;
        }

        setIsLoading(true);
        const operation = isUserParticipant ? 'remove' : 'add';

        try {
            const response = await fetch(`${API_BASE}/update_participants/${currentEvent.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    operation,
                    participant_ids: [user.id]
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update the event locally instead of reloading
                setCurrentEvent(prevEvent => {
                    const newParticipants = operation === 'add' 
                        ? [...prevEvent.participants, { id: user.id, name: `${user.userName} ${user.userSurname}` }]
                        : prevEvent.participants.filter(p => p.id !== user.id);

                    return {
                        ...prevEvent,
                        participants: newParticipants,
                        participantCount: newParticipants.length
                    };
                });

                //console.log(operation === 'remove' ? 'Successfully left the event!' : 'Successfully joined the event!');
            } else {
                // alert(data.message || 'Failed to update participation');
                console.error("Failed to update participation", data.message)
            }
        } catch (error) {
            console.error('Error updating participation:', error);
            // alert('Failed to update participation');
        } finally {
            setIsLoading(false);
        }
    };

    const onDeleteEvent = async () => {
        try {
            const response = await fetch(
                `${API_BASE}/delete_event/${event.id}`,
                {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include'
                }
            )
            if (response.ok) {
                removeEvent(event.id);
                onClose();
                navigate(`/#events`);
            }
        }
        catch {
            console.log('Error deleting event:', error)
        }
    }


    // TODO: This is extremely badly made into 2 parts - one for mobile and one for deskop however I have cannot be bothered to improved this and avoid code duplication
    return (<>

        {/* DESKTOP VERSION. Only visible from md and up */}
        <div className="hidden md:flex md:flex-row text-left w-full h-full p-4 gap-4 overflow-hidden">
            {/* Image Section - Top on mobile, Left on desktop */}
            {currentEvent.imagePath && (
                <div className="flex-shrink-0 w-full md:w-auto aspect-square md:h-full overflow-hidden rounded-lg md:min-w-0">
                    <img src={currentEvent.imagePath} alt={currentEvent.eventTitle} className="w-full h-full object-cover"/>
                </div>
            )}

            {/* Close button */}
            <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-all shadow-md"
                onClick={onClose}> <X size={20} className="text-gray-600"/>
            </button>

            {/* Content Section - Bottom on mobile, Right on desktop */}
            <div className="flex-1 flex flex-col justify-start overflow-hidden min-w-0">
                {/* Scrollable content area */}
                <div className="flex-1 overflow-y-auto">
                    {/* Title */}
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{currentEvent.eventTitle}</h2>

                    <div className="flex flex-col gap-3">
                        {/* Event Tags: Location, Date, Category */}
                        <div className="flex flex-col md:flex-row md:items-center gap-2 text-gray-600 text-sm">
                            <div className="flex items-center gap-1">
                                <MapPin size={16} className="font-bold text-red-500"/> <span className="text-slate-950">{currentEvent.eventLocation}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Calendar size={16} className="font-bold text-green-600"/> <span className="text-slate-950">{currentEvent.eventDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Tag size={16} className="font-bold text-blue-600"/> <span className="text-slate-950">{currentEvent.eventCategory}</span>
                            </div>
                        </div>

                        {/* Event description */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold mb-2">Description</h3>
                            <p className="text-gray-700 text-sm leading-relaxed">{currentEvent.eventDescription}</p>
                        </div>

                        {/* Participants Section */}
                        <div className="mb-4">
                            <div className="flex items-center space-x-2 mb-2">
                                <Users size={18} className="text-indigo-500"/>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Participants ({currentEvent.participantCount || currentEvent.participants?.length || 0})
                                </h3>
                            </div>

                            {currentEvent.participants && currentEvent.participants.length > 0
                            ? (<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {currentEvent.participants.map((participant) => (
                                            <div key={participant.id} className="flex items-center space-x-2 bg-white:50 rounded-md p-2 shadow-sm backdrop-blur-md">
                                                <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                                    {participant.name?.charAt(0)?.toUpperCase() || 'U'}
                                                </div>
                                                <span className="text-sm text-gray-700 truncate">
                                                    {participant.name}
                                                </span>
                                                {participant.id === user?.id && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">You</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>)
                            : (<div className="bg-gray-50/40 rounded-lg p-4 text-center">
                                    <Users size={20} className="text-gray-400 mx-auto mb-1"/>
                                    <p className="text-gray-500 text-sm">No participants yet. Be the first to join!</p>
                                </div>)
                            }
                        </div>

                    </div>
                </div>

                {/* Action Buttons - Always at bottom */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-3 border-t border-gray-200 gap-3 mt-auto flex-shrink-0">
                    <div className="flex flex-wrap gap-2">
                        {isOwner && (
                            <>
                                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                                    onClick={() => onDeleteEvent(event)}>
                                    Delete
                                </button>
                                <button className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium text-sm"
                                    onClick={() => navigate(`/edit_event/${currentEvent.id}`)}>
                                    Edit Event
                                </button>
                            </>
                        )}
                    </div>

                    <button className={`px-4 py-2 rounded-lg font-medium transition-all text-sm
                            ${isUserParticipant 
                                ? 'bg-red-500 hover:bg-red-600 text-white' 
                                : 'bg-indigo-500 hover:bg-indigo-600 text-white'}
                            ${isLoading && 'opacity-75 cursor-not-allowed'}`
                        } onClick={onJoinEvent} disabled={isLoading}>
                        {isLoading ? 'Loading...' : (isUserParticipant ? 'Leave Event' : 'Join Event')}
                    </button>
                </div>
            </div>
        </div>














        {/* MOBILE VERSION. Only visible below md */}
        <div className="block md:hidden w-full h-full overflow-y-auto">
            {/* Close button */}
            <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/60 backdrop-blur-sm hover:bg-white/70 transition-all shadow-md"
                onClick={onClose}> <X size={20} className="text-gray-600"/>
            </button>

            {/* Event Image */}
            {currentEvent.imagePath && (
                <div className="relative h-64 overflow-hidden rounded-t-lg p-4">
                    <img src={currentEvent.imagePath} alt={currentEvent.eventTitle} className="w-full h-full object-cover rounded-md"/>
                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div> */}
                </div>
            )}

            <div className="px-6 pt-6 pb-0">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentEvent.eventTitle}</h2>

                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">{currentEvent.eventDescription}</p>

                {/* Event Details Grid */}
                {currentEvent.eventLocation && (<div className="flex items-center text-center mb-6 space-x-2 text-gray-600">
                        <MapPin size={18} className="text-blue-500"/> <span className="text-sm">{currentEvent.eventLocation}</span>
                        <Calendar size={18} className="text-green-500"/> <span className="text-sm">{currentEvent.eventDate}</span>
                        <Tag size={18} className="text-purple-500"/> <span className="text-sm">{currentEvent.eventCategory}</span>
                    </div>
                )}

                {/* Participants Section */}
                <div className="mb-6">
                    <div className="flex items-center flex-col-2 space-x-2 mb-3">
                        <Users size={20} className="text-indigo-500"/>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Participants ({currentEvent.participantCount || currentEvent.participants?.length || 0})
                        </h3>
                    </div>

                    {currentEvent.participants && currentEvent.participants.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                            {currentEvent.participants.map((participant) => (
                            <div key={participant.id} className="flex items-center space-x-2 bg-white rounded-md p-2 shadow-sm">
                                <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {participant.name?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <span className="text-sm text-gray-700 truncate">{participant.name}</span>
                                {participant.id === user?.id && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>
                                )}
                            </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-gray-50/40 rounded-lg p-6 text-center">
                        <Users size={24} className="text-gray-400 mx-auto mb-2"/>
                        <p className="text-gray-500 text-sm">No participants yet. Be the first to join!</p>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200 pb-0">
                    <div className="flex space-x-3">
                        {isOwner && (<>
                            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            onClick={() => onDeleteEvent(event)}>
                                Delete
                            </button>
                            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            onClick={() => navigate(`/edit_event/${currentEvent.id}`)}>
                                Edit Event
                            </button>
                        </>)}
                    </div>

                    <button className={`px-6 py-2 rounded-lg font-medium transition-all
                        ${isUserParticipant ? 'bg-red-500 hover:bg-red-600 text-white'
                                            : 'bg-indigo-500 hover:bg-indigo-600 text-white'}
                        ${isLoading && 'opacity-75 cursor-not-allowed'}`}
                        onClick={onJoinEvent} disabled={isLoading}>
                            {isLoading ? 'Loading...' : (isUserParticipant ? 'Leave Event' : 'Join Event')}
                    </button>
                </div>
            </div>
        </div>

    </>)

}

export default EventDetailsScreen
