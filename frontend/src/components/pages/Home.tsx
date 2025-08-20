import React from 'react';
import Hero from '../sections/Hero';
import FeaturedProperties from '../sections/FeaturedProperties';
import HotelProperties from '../sections/HotelProperties';
import AboutSection from '../sections/AboutSection';
import Testimonials from '../sections/Testimonials';

const Home = () => {
  return (
    <div className="space-y-16">
      <Hero />
      <FeaturedProperties />
      <HotelProperties />
      <AboutSection />
      <Testimonials />
    </div>
  );
};

export default Home;