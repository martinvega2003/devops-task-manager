import { useState, useEffect } from "react";
import api from "../../API/api.interceptors";
import Button from "../../components/Button";
import MemberCard from "../../components/MemberCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaCheck } from "react-icons/fa"

const MyTeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberData, setMemberData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      const response = await api.get("/team/team-members");
      setTeamMembers(response.data.teamMembers);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to fetch team members");
    }
  };

  // Group members by role
  const groupedMembers = teamMembers.reduce((acc, member) => {
    const role = member.role.toLowerCase();
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {});
  
  // Define the order and display names for the roles
  const roleOrder = [
    { key: 'developer', label: 'Developers' },
    { key: 'designer', label: 'Designers' },
    { key: 'administrative', label: 'Administratives' },
    { key: 'manager', label: 'Managers' },
  ];

  const handleChange = (e) => {
    setMemberData({
      ...memberData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/team/invite', memberData)
      setMemberData({ name: '', email: '', password: '', role: '' });
      setIsModalOpen(false)
    } catch (error) {
      console.log(error)
    }
    fetchTeamMembers();
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const toggleMemberStatus = async (id) => {
    try {
      await api.put(`/team/deactivate/${id}`);
      fetchTeamMembers();
      toast.success("Member status updated");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update status");
    }
    fetchTeamMembers();
  };

  const deleteMember = async (id) => {
    try {
      await api.delete(`/team/delete/${id}`);
      fetchTeamMembers();
      toast.success("Member deleted");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to delete member");
    }
    fetchTeamMembers();
  };

  const Modal = (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-transparent">
      <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-subheading dark:text-surface-white font-bold mb-4">Add New Team Member</h3>
        <form className="text-body dark:text-surface-white">
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={memberData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your team member's name"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={memberData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your team member's email"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="passwrod"
              name="password"
              value={memberData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your team member's password"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-200 mb-1" htmlFor="role">
              Role
            </label>
            <div className="flex flex-wrap justfy-start items-center gap-2 p-2 pl-0">
              {
                [
                  {role: 'developer', bg: 'bg-gradient-to-r from-blue-700 to-blue-500'},
                  {role: 'designer', bg: 'bg-gradient-to-r from-yellow-700 to-yellow-500'},
                  {role: 'administrative', bg: 'bg-gradient-to-r from-green-700 to-green-500'},
                  {role: 'manager', bg: 'bg-gradient-to-r from-red-700 to-red-500'},
                ].map(card => (
                  <button 
                    type="button"
                    onClick={() => setMemberData({...memberData, role: card.role})}  
                    className={`text-caption py-2 px-4 rounded-sm ${card.bg} hover:scale-105 ${card.role === memberData.role ? "scale-105" : ""} cursor-pointer`}
                  >
                    <div className="flex flex-nowrap gap-2 items-center">
                      {card.role.toLocaleUpperCase()}
                      {card.role === memberData.role ? <FaCheck /> : <></>}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded bg-primary dark:bg-secondary text-white cursor-pointer"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen">
      {isModalOpen && Modal}
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex gap-3 justify-between items-center p-4">
        <h2 className="text-heading dark:text-surface-white font-bold">My Team</h2>
        <div className="w-fit sm:w-1/3 md:w-1/4">
          <Button onClick={() => setIsModalOpen(true)}>Add Team Member</Button>
        </div>
      </div>
      {teamMembers.length === 0 ? (
        <div className="w-full flex flex-col gap-6 justify-center items-center">
          <p className="text-body dark:text-surface-white">No team members yet.</p>
          <div className="w-full sm:w-1/3 md:w-1/4">
            <Button onClick={() => setIsModalOpen(true)}>Add Team Member</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {roleOrder.map(({ key, label }) => {
            const members = groupedMembers[key] || [];
            // Only render section if there are team members for that role
            return members.length > 0 ? (
              <div key={key} className={`min-w-full py-6 px-4 overflow-x-auto ${label === "Developers" ? "bg-blue-200 dark:bg-blue-900" : label === "Designers" ? "bg-yellow-200 dark:bg-yellow-900" : label === "Administratives" ? "bg-green-200 dark:bg-green-900" : "bg-red-200 dark:bg-red-900"}`}>
                <h3 className="text-subheading dark:text-surface-white font-bold mb-2">{label}</h3>
                <div className="flex flex-nowrap overflow-x-auto gap-8 p-2 pl-0">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      onClick={() => handleMemberClick(member)}
                      member={member}
                    />
                  ))}
                  {/* Add a Button to add new member at the end of each array of cards */}
                  <div className="ml-3 sm:ml-8 min-h-full flex justify-center items-center">
                    <button onClick={() => setIsModalOpen(true)} className={`h-2/3 w-auto aspect-square flex items-center justify-center rounded-full whitespace-nowrap cursor-pointer border-2 ${
                      label === 'Developers' ? 'hover:bg-gradient-to-r hover:from-blue-700 hover:to-blue-500 border-blue-600 text-blue-600' : 
                      label === 'Designers' ? 'hover:bg-gradient-to-r hover:from-yellow-700 hover:to-yellow-500 border-yellow-600 text-yellow-600' :
                      label === 'Administratives' ? 'hover:bg-gradient-to-r hover:from-green-700 hover:to-green-500 border-green-600 text-green-600' :
                      'bg-gradient-to-r hover:from-red-700 hover:to-red-500 border-red-600 text-red-600'
                    } from-transparent to-transparent text-heading hover:text-surface-white transition duration-300`}>
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {selectedMember && (
        <div className="fixed top-0 right-0 w-1/2 h-full bg-white p-4 shadow-lg">
          <h3>{selectedMember.name}</h3>
          <p>Role: {selectedMember.role}</p>
          <p>Email: {selectedMember.email}</p>
          <Button onClick={() => toggleMemberStatus(selectedMember.user_id)}>
            {selectedMember.active ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="destructive" onClick={() => deleteMember(selectedMember.user_id)}>
            Delete
          </Button>
          <Button onClick={() => setSelectedMember(null)}>Close</Button>
        </div>
      )}
    </div>
  );
};

export default MyTeamSection;
