import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import Footer from '../components/Footer'
import AIReceptionist from '../components/GeminiAI';
import DemoBanner from "../components/DemoBanner";
// inside App or Home:

const Home = () => {
  return (
    <div>
      <Header/>
      <SpecialityMenu/>
      <TopDoctors/>
      <Banner/>
      {/* <Footer/> */}
      <AIReceptionist />
    </div>
  )
}

export default Home
