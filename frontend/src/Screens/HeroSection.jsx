import React from 'react'
import { NavLink } from 'react-router-dom'
import { ArrowDown } from 'lucide-react'

const HeroSection = () => {
  return (
    <section id="/" className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <div className="container max-w-4xl mx-auto text-center z-10">

            {/* Main Text - Title */}
            <div className="space-y-6">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight flex flex-wrap justify-center">
                    <span className="opacity-0 animate-fade-in-delay-1 transition-colors duration-300">Your Events,</span>
                    <span className="opacity-0 animate-fade-in-delay-4 transition-colors duration-300 text-primary md:ml-3">Your Way</span> {/* md:ml-3 simulates 'space' chatacter on desktop version cuz if I insert space between those spans "Your Way" section on mobile looks off */}
                </h1>
                <p className="text-md md:text:xl text-muted-foreground transition-colors duration-300 opacity-0 animate-fade-in-delay-4 max-2-2xl mx-auto">
                    Start hosting, join the fun, and make every moment unforgettable.
                </p>

                {/* Two Buttons */}
                <div className="text-md md:text-lg mt-5 opacity-0 animate-fade-in-delay-5 flex justify-center space-x-4">
                    <NavLink className="button-primary" to="/register">Join</NavLink>
                    <a className="button-secondary" href="#events">
                        <span className="hidden md:inline">Browse {" "}</span> Events {/* Here if not View Events then maybe 'Discover'? or 'Browse'? */}
                    </a>
                </div>
            </div>
        </div>

        {/* Scroll Arrow */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center animate-bounce">
            <a href="#events"><ArrowDown className="h-5 w-5 text-primary" /></a>
        </div>
    </section>
  )
}

export default HeroSection
