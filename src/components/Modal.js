import React, { useState } from 'react';

function Modal({ isOpen, onClose }) {
  const [selectedTeams, setSelectedTeams] = useState(['Design', 'Product', 'Marketing']);
  
  const handleTeamChange = (event) => {
    const value = event.target.value;
    setSelectedTeams((prev) =>
      prev.includes(value) ? prev.filter((team) => team !== value) : [...prev, value]
    );
  };

  return (
    isOpen && (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
          
          {/* Dummy Image and Options */}
          <div className="flex flex-col items-center mb-4">
            <img
              src="https://i.pravatar.cc/150?img=1"
              alt="Profile"
              className="w-24 h-24 rounded-full mb-2"
            />
            <button className="text-blue-600 hover:underline">Change Photo</button>
            <button className="text-red-600 hover:underline">Delete Photo</button>
          </div>
          
          {/* Form Inputs */}
          <div className="mb-4">
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full border rounded-lg px-4 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>
            <div className="flex gap-4 mb-4">
              <select className="w-full border rounded-lg px-4 py-2">
                <option>Role</option>
                <option>Product Designer</option>
                <option>Product Manager</option>
                <option>Frontend Developer</option>
              </select>
              <select className="w-full border rounded-lg px-4 py-2">
                <option>Status</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
            <div className="mb-4">
              <p className="font-medium mb-2">Teams</p>
              <div className="flex flex-wrap gap-2">
                {['Design', 'Product', 'Marketing', 'Sales'].map((team) => (
                  <label key={team} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      value={team}
                      checked={selectedTeams.includes(team)}
                      onChange={handleTeamChange}
                      className="form-checkbox"
                    />
                    <span className="ml-2">{team}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border"
            >
              Cancel
            </button>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">
              Save
            </button>
          </div>
        </div>
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      </div>
    )
  );
}

export default Modal;
