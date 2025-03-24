import { useState, useEffect } from "react";
import api from "../../API/api.interceptors";
import Button from "../../components/Button";
import MemberCard from "../../components/MemberCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const handleChange = (e) => {
    setMemberData({
      ...memberData,
      [e.target.name]: e.target.value,
    });
  };
  
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
    { key: 'developer', label: 'Developer' },
    { key: 'designer', label: 'Designer' },
    { key: 'administrative', label: 'Administrative' },
    { key: 'manager', label: 'Manager' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/team/invite', memberData)
      setMemberData({ name: '', email: '', password: '', role: '' });
      setIsModalOpen(false)
    } catch (error) {
      
    }
    fetchTeamMembers();
  };

  const handleMemberClick = (member) => {
    setSelectedMember(member);
  };

  const toggleMemberStatus = async (id) => {
    try {
      await api.patch(`/team-members/${id}/toggle-status`);
      fetchTeamMembers();
      toast.success("Member status updated");
    } catch (error) {
      toast.error(error.response?.data?.msg || "Failed to update status");
    }
    fetchTeamMembers();
  };

  const deleteMember = async (id) => {
    try {
      await api.delete(`/team-members/${id}`);
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
        <form onSubmit={handleSubmit} className="text-body dark:text-surface-white">
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
            <input
              type="text"
              id="role"
              name="role"
              value={memberData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
              placeholder="Your team member's role"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-primary dark:bg-secondary text-white"
            >
              Add Member
            </button>
          </div>
        </form>
      </div>
    </div>
  )

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen p-4">
      {isModalOpen && Modal}
      <ToastContainer position="top-right" autoClose={5000} />
      <div className="flex gap-3 justify-start items-center mb-8">
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
        <div className="flex flex-col overflow-x-auto gap-4 p-2">
          {roleOrder.map(({ key, label }) => {
            const members = groupedMembers[key] || [];
            // Only render section if there are team members for that role
            return members.length > 0 ? (
              <div key={key} className="min-w-full mb-8">
                <h3 className="text-subheading dark:text-surface-white font-bold mb-2">{label}</h3>
                <div className="flex overflow-x-auto gap-4 p-2">
                  {members.map((member) => (
                    <MemberCard
                      key={member.id}
                      className={`cursor-pointer p-4 ${!member.active ? "opacity-50" : ""}`}
                      onClick={() => handleMemberClick(member)}
                      member={member}
                    />
                  ))}
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
          <Button onClick={() => toggleMemberStatus(selectedMember.id)}>
            {selectedMember.active ? "Deactivate" : "Activate"}
          </Button>
          <Button variant="destructive" onClick={() => deleteMember(selectedMember.id)}>
            Delete
          </Button>
          <Button onClick={() => setSelectedMember(null)}>Close</Button>
        </div>
      )}
    </div>
  );
};

export default MyTeamSection;
