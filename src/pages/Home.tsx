import React from 'react';
import Footer from "../component/Layout/Footer";
// import Headers from '../component/Layout/Headers';
import Navbar from '../component/Layout/Navbar';  


const Home: React.FC = () => {
  return (
    <div className="mt-16">
          <Navbar />
          {/* <Headers /> */}
      <Footer />
          
    </div>
  );
};

export default Home;


