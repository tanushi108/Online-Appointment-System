import React from 'react'
import { assets } from '../assets/assets'

const Footer = () => {
  return (
    <div className='md:mx-10'>
<div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>

    {/* ...........Left  section.......... */}
    <div>
     
     {/* <h4 class="wow fadeInUp animated" data-wow-delay="0.4s" style="visibility: visible; animation-delay: 0.4s; animation-name: fadeInUp;">Opening Hours</h4> */}
     {/* <h4>Opening Hours</h4> */}
     <p className='text-x1 font-medium mb-6'>OPENING HOURS</p>
     {/* <p>Monday - Friday <span>06:00 AM - 10:00 PM</span></p>
     <p>Saturday <span>09:00 AM - 08:00 PM</span></p>
     <p>Sunday <span>Closed</span></p> */}
     <ul className='flex flex-col gap-2 text-gray-600'>
        <li>Monday - Friday <span>09:00 AM - 08:00 PM</span></li>
        {/* <li>Saturday <span>09:00 AM - 08:00 PM</span></li>
        <li>Sunday <span>Closed</span></li> */}
     </ul>
     </div>
    {/* .............Center section .............. */}
    <div>
        <p className='text-x1 font-medium mb-6'>COMPANY</p>
        <ul className='flex flex-col gap-2 text-gray-600'>
        <li>Home</li>
        <li>About us</li>
        <li>Contact us</li>
        <li>Privacy policy</li>
             
        </ul>
     </div>

    {/* .............Right section ................. */}
    <div>
        <p className='text-x1 font-medium mb-6'>GET IN TOUCH</p>
        <ul className='flex flex-col gap-2 text-gray-600'>
          <li>+91 9350738673</li>
          <li>tanushirana875@gmail.com</li>
        </ul>
     </div>
</div>
<div>
  {/* ..........Copyright text............... */}

</div>
{/*  'py-5 text-sm text-center'>Copyright © 2017 Swastik care</p> */}
    </div>
  )
}
export default Footer