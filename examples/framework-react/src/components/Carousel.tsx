

import React, { useState, type ReactNode, Children } from 'react';

interface CarouselProps {
  children: ReactNode[];
}

export default function Carousel({ children}: CarouselProps) {
    const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((activeIndex + 1) % children.length);
  };

  const handlePrev = () => {
    setActiveIndex((activeIndex - 1 + children.length) % children.length);
  };

  return (
    <div>
      <button onClick={handlePrev}>Prev</button>
      <button onClick={handleNext}>Next</button>
      <div>
        {Children.map(children, (child, index) => {
          return <div>{child}</div>;
        })}
        
      </div>
    </div>
  );
};