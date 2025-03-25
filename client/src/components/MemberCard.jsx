import React from 'react';
import profilePic from "../images/profile-pic.png"

const MemberCard = ({ onClick, member }) => {
  
  let bg = 'bg-white';
  switch(member.role) {
    case 'developer':
      bg = 'bg-gradient-to-r from-blue-700 to-blue-500'
      break;
    case 'designer':
      bg = 'bg-gradient-to-r from-yellow-700 to-yellow-500'
      break;
    case 'administrative':
      bg = 'bg-gradient-to-r from-green-700 to-green-500'
      break;
    case 'manager':
      bg = 'bg-gradient-to-r from-red-700 to-red-500'
      break;
  }

  return (
    <div
      onClick={onClick}
      className={`${bg} min-w-fit ${!member.active ? "opacity-50" : ""} cursor-pointer p-4 flex justify-center items-start gap-4 rounded shadow-md hover:scale-110 transition duration-300 text-surface-white`}
    >
      <img src={profilePic} alt="Profile picture" className='w-1/4 h-auto rounded-md' />
      <div className="w-3/4">
        <h3 className="text-body font-semibold whitespace-nowrap">{member.username}</h3>
        <p className="text-caption italic whitespace-nowrap text-zinc-100">
          Currently working on <strong>{member.tasks_count}</strong> tasks
        </p>
      </div>
    </div>
  );
};

export default MemberCard;