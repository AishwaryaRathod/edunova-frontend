import React, { useState } from 'react';
import Overview from './Overview';
import PeopleDirectory from './PeopleDirectory';

function Screen1() {
  const [activeComponent, setActiveComponent] = useState('PeopleDirectory');

  // Function to determine the button text color based on the active component
  const getButtonClass = (componentName) => {
    return componentName === activeComponent 
      ? 'text-customPurple' 
      : 'text-black'; // default color
  };

  return (
    <div className='flex h-[700px]'>
      <div className='w-64 p-3'>
        <button
          className={`flex mt-3 cursor-pointer pl-3 ${getButtonClass('Overview')}`}
          onClick={() => setActiveComponent('Overview')}
        >
          <i className="fa fa-th-large text-xl" aria-hidden="true"></i>
          <p className=' text-base font-bold ml-2'>Overview</p>
        </button>
        <button
          className={`flex mt-3 cursor-pointer pl-3 ${getButtonClass('PeopleDirectory')}`}
          onClick={() => setActiveComponent('PeopleDirectory')}
        >
          <i className="fa fa-th-large text-xl" aria-hidden="true"></i>
          <p className='text-base font-bold ml-2'>People Directory</p>
        </button>
      </div>
      
      <div className=' w-full'>
        {activeComponent === 'Overview' && <Overview />}
        {activeComponent === 'PeopleDirectory' && <PeopleDirectory />}
      </div>
    </div>
  );
}

export default Screen1;
