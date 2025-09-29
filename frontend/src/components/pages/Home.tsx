import React from 'react';
import Hero from '../sections/Hero';
import FeaturedProperties from '../sections/FeaturedProperties';
import HotelProperties from '../sections/HotelProperties';
import AboutSection from '../sections/AboutSection';
import Testimonials from '../sections/Testimonials';
import PartnersSection from '../sections/PartnersSection';


const Home = () => {
  return (
    <div className="space-y-16">
      <Hero />
      <FeaturedProperties />
      <PartnersSection />
      <HotelProperties />
      <AboutSection />
      <Testimonials />
    </div>
  );
};

export default Home;