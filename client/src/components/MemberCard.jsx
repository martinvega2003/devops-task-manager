import React from 'react';

const MemberCard = ({ onClick, className = "", member }) => {
  
  let bg = 'bg-white';
  switch(member.role) {
    case 'developer':
      bg = 'bg-blue-500'
      break;
    case 'designer':
      bg = 'bg-yellow-500'
      break;
    case 'administrative':
      bg = 'bg-green-500'
      break;
    case 'manager':
      bg = 'bg-red-500'
      break;
  }

  return (
    <div
      onClick={onClick}
      className={`${bg} cursor-pointer p-4 rounded shadow-md hover:scale-110 transition duration-300 dark:text-surface-white ${className}`}
    >
      <h3 className="text-body font-semibold whitespace-nowrap">{member.username}</h3>
    </div>
  );
};

export default MemberCard;