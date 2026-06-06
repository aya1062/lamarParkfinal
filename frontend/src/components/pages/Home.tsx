import Hero from '../sections/Hero';
import FeaturedProperties from '../sections/FeaturedProperties';
import HotelProperties from '../sections/HotelProperties';
import BranchesMapSection from '../sections/BranchesMapSection';
import HotelManagementSection from '../sections/HotelManagementSection';
import AboutSection from '../sections/AboutSection';
// import Testimonials from '../sections/Testimonials';
import PartnersSection from '../sections/PartnersSection';


const Home = () => {
  return (
    <div className="space-y-0 md:space-y-0">
      <Hero />
      {/* <FeaturedProperties /> */}
      <HotelProperties />
      <BranchesMapSection />
      <HotelManagementSection />
      <PartnersSection />
      <AboutSection />
      {/* <Testimonials /> */}
    </div>
  );
};

export default Home;