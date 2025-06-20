// src/components/Profile/TrainerProfile.jsx
import React from "react";

export default function TrainerProfile({ user }) {
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center mb-6">
        <img
          src={user.profilePictures?.[0]?.url || "https://ui-avatars.com/api/?name=" + user.name}
          alt="Profile"
          className="w-24 h-24 rounded-full border-4 border-green-200 object-cover"
        />
        <div className="ml-6">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
          <p className="text-green-600 font-semibold">Trainer</p>
        </div>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">About</h3>
        <p className="text-gray-700">{user.about || "No bio provided."}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Contact</h3>
        <p>{user.contactNumber || "No contact number provided."}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Languages</h3>
        <p>{user.languages?.join(", ") || "Not specified"}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Active Days</h3>
        <p>{user.daysActive?.join(", ") || "Not specified"}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Time Slots</h3>
        <p>{user.timeSlots?.join(", ") || "Not specified"}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Charges Per Student</h3>
        <p>{user.chargesPerStudent ? `₹${user.chargesPerStudent}` : "Not specified"}</p>
      </div>
      <div className="mb-4">
        <h3 className="font-semibold text-lg mb-2">Expertise</h3>
        <p>{user.expertise?.length ? user.expertise.join(", ") : "Not specified"}</p>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold text-lg mb-2">Addresses</h3>
        <ul>
          {(user.address || []).map((addr, idx) => (
            <li key={idx} className="mb-2 p-2 bg-gray-50 rounded">
              <span className="font-semibold">{addr.label}:</span> {addr.street}, {addr.locality}, {addr.city}, {addr.state}, {addr.pincode}, {addr.country}
            </li>
          ))}
        </ul>
      </div>
      <button className="btn w-full">Update Profile</button>
    </div>
  );
}