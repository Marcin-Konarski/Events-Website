import React, { useState } from 'react'
import { X, MapPin, Calendar, Tag, Users } from 'lucide-react'
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

    return (

        <div className="relative bg-white/90 backdrop-blur-md rounded-lg shadow-xl max-w-2xl mx-auto max-h-[50vh] overflow-y-auto">
            {/* Close button */}
            <button className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white/95 transition-all shadow-md" 
                onClick={onClose}>
                <X size={20} className="text-gray-600"/>
            </button>

            {/* Event Image */}
            {currentEvent.imagePath && (
                <div className="relative h-64 overflow-hidden rounded-t-lg">
                    <img src={currentEvent.imagePath} alt={currentEvent.eventTitle} className="w-full h-full object-cover"/>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}

            <div className="p-6">
                {/* Title */}
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{currentEvent.eventTitle}</h2>

                {/* Description */}
                <p className="text-gray-700 mb-6 leading-relaxed">{currentEvent.eventDescription}</p>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {currentEvent.eventLocation && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <MapPin size={18} className="text-blue-500"/>
                            <span className="text-sm">{currentEvent.eventLocation}</span>
                        </div>
                    )}

                    {currentEvent.eventDate && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Calendar size={18} className="text-green-500"/>
                            <span className="text-sm">{new Date(currentEvent.eventDate).toLocaleDateString()}</span>
                        </div>
                    )}

                    {currentEvent.eventCategory && (
                        <div className="flex items-center space-x-2 text-gray-600">
                            <Tag size={18} className="text-purple-500"/>
                            <span className="text-sm">{currentEvent.eventCategory}</span>
                        </div>
                    )}
                </div>

                {/* Participants Section */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-3">
                        <Users size={20} className="text-indigo-500"/>
                        <h3 className="text-lg font-semibold text-gray-900">
                            Participants ({currentEvent.participantCount || currentEvent.participants?.length || 0})
                        </h3>
                    </div>

                    {currentEvent.participants && currentEvent.participants.length > 0
                    
                    ? (<div className="bg-gray-50/80 rounded-lg p-4 max-h-40 overflow-y-auto">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {currentEvent.participants.map((participant) => (
                                    <div key={participant.id} className="flex items-center space-x-2 bg-white rounded-md p-2 shadow-sm">
                                        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                            {participant.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                        <span className="text-sm text-gray-700 truncate">
                                            {participant.name}
                                        </span>
                                        {participant.id === user?.id && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">You</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>)
                    : (<div className="bg-gray-50/40 rounded-lg p-6 text-center">
                            <Users size={24} className="text-gray-400 mx-auto mb-2"/>
                            <p className="text-gray-500 text-sm">No participants yet. Be the first to join!</p>
                        </div>)
                    }
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div className="flex space-x-3">
                        {isOwner && (
                            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                onClick={() => onDeleteEvent(event)}>
                                Delete
                            </button>
                        )}

                        {isOwner && (
                            <button className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                onClick={() => navigate(`/edit_event/${currentEvent.id}`)}>
                                Edit Event
                            </button>
                        )}
                    </div>

                    <button className={`px-6 py-2 rounded-lg font-medium transition-all
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
    )
}

export default EventDetailsScreen
