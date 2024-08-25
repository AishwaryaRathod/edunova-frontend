import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import icon1 from '../userIcon/icon1.png'



function Header() {
    return (
        <div className=' flex justify-between p-3 border-b border-gray-200'>
            <div className=' w-52 ml-4'>
                <h1 className=' text-4xl font-bold text-customPurple '>PEOPLE.CO</h1></div>
            <div className=' flex w-44 justify-between items-center  '>
                <i class="fa-regular fa-bell text-lg text-slate-500"></i>
                <img src={icon1} alt="Description of the image" className=' h-11 w-11' />
                <p className=' text-lg pr-4'>Jane Doe</p>

            </div>


        </div>
    )
}

export default Header