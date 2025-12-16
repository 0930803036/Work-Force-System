import { useState, useEffect } from 'react';

export function WelcomePage() {
    const slides = [
        "Users can manage briefin and leave time.",
        "Admins can manage user accounts.",
        "Manager can enforce user time managment."
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
        }, 3000); // change slide every 3 seconds

        return () => clearInterval(interval); // cleanup on unmount
    }, []);

    return (
        <>
            <div className="container fw-bold mt-5 text-success text-center">
                <h3>Please seclect from the sidebar menu to proceed</h3>

                {/* Slideshow */}
                <div className="mt-4">
                    <h4 className="text-primary">{slides[currentSlide]}</h4>
                </div>
            </div>
        </>
    );
}
