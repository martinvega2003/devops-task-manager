import React from 'react';

const MemberCard = ({ children, onClick, className = "" }) => {
  return (
    <div
      onClick={onClick}
      className={`member-card cursor-pointer p-4 rounded shadow-md border border-gray-200 hover:shadow-lg transition duration-300 ${className}`}
    >
      {children}
    </div>
  );
};

export default MemberCard;