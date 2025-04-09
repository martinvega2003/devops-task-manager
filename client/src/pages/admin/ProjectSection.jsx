import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../API/api.interceptors';
import { FaChevronLeft, FaChevronRight, FaPen } from 'react-icons/fa';
import TaskTitleCard from '../../components/TaskTitleCard';
import Button from '../../components/Button';
import AddTaskForm from '../../components/AddTaskForm';
import TaskPage from './TaskPage';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper function to check if two dates represent the same calendar day.
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const ProjectSection = () => {
  const { project_id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  //When hovering over Project data in heading
  const [isHoveringTasks, setIsHoveringTasks] = useState(false);
  const [isHoveringMembers, setIsHoveringMembers] = useState(false);

  // When Updating a Project
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [isDescriptionEditing, setIsDescriptionEditing] = useState(false)
  const [isDeadlineEditing, setIsDeadlineEditing] = useState(false)
  const [updatedProject, setUpdatedProject] = useState(null)

  const handleChange = e => {
    setUpdatedProject({
      ...updatedProject,
      [e.target.name]: e.target.value
    })
  }

  const handleDeadlineChange = (e) => {// Copy & Pate from Create project Form
    const selectedDate = e.target.value; // e.g., "2025-08-01"
    // Create a Date object at local midnight for the selected date
    const date = new Date(selectedDate + "T00:00:00");
    // Convert to an ISO string (this converts local time to UTC)
    // For example, if you're in UTC-4, local midnight "2025-08-01T00:00:00" becomes "2025-08-01T04:00:00Z"
    const isoDate = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
    setUpdatedProject({ ...updatedProject, deadline: isoDate });
  };  

  const handleSubmit = async e => {
    e.preventDefault()
    const payload = {
      name: updatedProject.name,
      description: updatedProject.description,
      deadline: updatedProject.deadline
    }

    try {
      await api.put('projects/' + project_id, payload)
      console.log("project updated")
      fetchProject()
      setIsTitleEditing(false)
      setIsDescriptionEditing(false)
      setIsDeadlineEditing(false)
    } catch (error) {
      alert(error)
    }
  }

  // Modal related states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null)
  const [modalCellTasks, setModalCellTasks] = useState([])
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)

  //Task Data Modal related states
  const [selectedTask, setSelectedTask] = useState(null)

  // currentMonth and currentYear determine which month is displayed.
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);

  // Fetch project information when component mounts
  useEffect(() => {
    fetchProject();
  }, [project_id]);

  // Function to fetch the project info
  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${project_id}`);
      setProject(res.data);
      setUpdatedProject(res.data)
      // Initialize currentMonth and currentYear only if they are null
      if (currentMonth === null && currentYear === null) {
        const createdDate = new Date(res.data.created_at);
        setCurrentMonth(createdDate.getMonth());
        setCurrentYear(createdDate.getFullYear());
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    }
  };

  // Fetch tasks for the project
  useEffect(() => {
    if (project) {
      fetchTasks();
    }
  }, [project]);

  // Function to fetch the tasks from a project
  const fetchTasks = async () => {
    try {
      const res = await api.get(`/tasks/project/${project.id}`);
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Compute the calendar days for the current month view
  useEffect(() => {
    if (project !== null && currentMonth !== null && currentYear !== null) {
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

      let daysArray = [];
      // Fill with days from previous month for the first row
      if (firstDayOfMonth > 0) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
        for (let i = firstDayOfMonth - 1; i >= 0; i--) {
          daysArray.push({
            date: new Date(prevYear, prevMonth, daysInPrevMonth - i),
            isCurrentMonth: false,
          });
        }
      }
      // Add days for the current month
      for (let day = 1; day <= daysInMonth; day++) {
        daysArray.push({
          date: new Date(currentYear, currentMonth, day),
          isCurrentMonth: true,
        });
      }
      setCalendarDays(daysArray);
    }
  }, [project, currentMonth, currentYear]);

  // Re-render daily timeline after a Task is added
  useEffect(() => {
    if (modalCell) {
      const newCellTasks = tasks.filter(task => {
        const taskStart = new Date(task.start_time);
        return isSameDay(taskStart, modalCell.date);
      });
      setModalCellTasks(newCellTasks);
    }
  }, [tasks, modalCell]);  

  // Navigation functions with boundary checks
  const goToPreviousMonth = () => {
    if (!project) return;
    const projectCreated = new Date(project.created_at);
    // Prevent navigating before the project's creation month/year
    if (currentYear === projectCreated.getFullYear() && currentMonth === projectCreated.getMonth()) {
      return;
    }
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (!project) return;
    const projectDeadline = new Date(project.deadline);
    // Prevent navigating after the project's deadline month/year
    if (currentYear === projectDeadline.getFullYear() && currentMonth === projectDeadline.getMonth()) {
      return;
    }
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  if (!project) return <p>Loading project information...</p>;

  // Format month/year for display (e.g., "August 2025")
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const displayMonth = monthNames[currentMonth];

  // Determine arrow disabled states
  const projectCreated = new Date(project.created_at);
  const projectDeadline = new Date(project.deadline);
  const leftDisabled = currentYear === projectCreated.getFullYear() && currentMonth === projectCreated.getMonth();
  const rightDisabled = currentYear === projectDeadline.getFullYear() && currentMonth === projectDeadline.getMonth();

  const Modal = (
    <div className="fixed inset-0 z-10 w-full flex items-center justify-center bg-transparent">
      <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-2/3 h-[80vh] flex flex-col items-start overflow-hidden">
        {isTaskFormOpen && <AddTaskForm project_id={project_id} setIsTaskFormOpen={setIsTaskFormOpen} modalCell={modalCell} fetchTasks={fetchTasks} />}
        <h3 className="text-body dark:text-surface-white font-bold mb-4">
          Task for {monthNames[currentMonth]} {modalCell && modalCell.date.getDate()}, {currentYear}:
        </h3>
        
        {/* Timeline and Tasks Container */}
        <div className="relative flex h-fit w-full overflow-auto">

          {/* Vertical Timeline */}
          <div className="sticky z-30 left-0 h-fit bg-white dark:bg-gray-800 text-caption text-surface-black dark:text-surface-white pr-2 border-r border-gray-300 dark:border-gray-600 flex flex-col items-end">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="py-4 text-right w-12 h-12">
                <span>{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Hours Separating lines */}
          <div className="absolute w-full z-10 inset-0 top-6 flex flex-col gap-12">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div 
                key={hour}
                className="w-[2000px] border-t border-dashed border-gray-300 dark:border-gray-600"
                style={{ position: 'absolute', top: `${hour * 48}px` }}
              />
            ))}
          </div>
          
          {/* Tasks Container */}
          <div className="relative flex justify-start gap-1">
            {modalCellTasks.map(task => {
              const taskStart = new Date(task.start_time);
              const taskEnd = new Date(task.end_time);
              const startHour = taskStart.getHours();
              const startMinutes = taskStart.getMinutes();
              const durationHours = (taskEnd - taskStart) / (1000 * 60 * 60);
              const topPosition = startHour * 48 + (startMinutes / 60) * 48; // 44px per hour
              const height = durationHours * 48; // Task height based on duration
  
              return (
                <div
                  key={task.id}
                >
                  <TaskTitleCard 
                    task={task} 
                    onClick={() => setSelectedTask(task)}
                    className="truncate relative z-20 -translate-y-6 hover:-translate-y-7" 
                    style={{ 
                      top: `${topPosition}px`, 
                      height: `${height}px`, 
                    }} 
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-12">
          <Button onClick={() => setIsModalOpen(false)} width='fit' isCloseButton={true} />

          <Button isAddButton={true} width='fit' onClick={() => setIsTaskFormOpen(true)} />
        </div>
      </div>
    </div>
  );

  const openModal = (cell, cellTasks) => {
    setModalCell(cell)
    setModalCellTasks(cellTasks)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen w-full">
      {/* Modal for Task Page */}
      <TaskPage selectedTask={selectedTask} setSelectedTask={setSelectedTask} fetchTasks={fetchTasks}/>
      {/* Modal for Task Creation */}
      {isModalOpen && Modal}

      {/* Project Header */}
      <div className="p-4">
        {!isTitleEditing ? (
          <div className="w-full flex justify-start items-center gap-2 mb-2">
            <h2 className="text-subheading text-surface-black dark:text-surface-white">
              {project.name}
            </h2>
            <button onClick={() => setIsTitleEditing(true)} className="aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-body cursor-pointer">
              <FaPen />
            </button>
          </div> 
        ) : (
          <div className="w-full flex justify-start items-center gap-2 mb-2">
            <input 
              name='name'
              className="w-fit text-subheading font-bold text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600" 
              placeholder='Title cannot be null...'
              onChange={handleChange}
              required
            />
            <Button onClick={handleSubmit} width='fit'>
              Save
            </Button>
          </div> 
        )}

        {!isDescriptionEditing ? (
          <div className="w-fit flex justify-start items-center gap-2 mb-4">
            <p className="text-body text-surface-black dark:text-surface-white">
              {project.description}
            </p>
            <button onClick={() => setIsDescriptionEditing(true)} className="aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-caption cursor-pointer">
              <FaPen />
            </button>
          </div> 
        ) : (
          <div className="w-full flex justify-start items-center gap-2 mb-4">
            <input 
              name='description'
              className="w-fit text-body font-bold text-surface-black dark:text-surface-white placeholder:text-gray-400 dark:placeholder:text-gray-600" 
              placeholder='Description cannot be null...'
              onChange={handleChange}
              required
            />
            <Button onClick={handleSubmit} width='fit'>
              Save
            </Button>
          </div> 
        )}

        <div className="relative flex justify-between items-center mb-4">
          <div 
            className="relative"
            onMouseEnter={() => setIsHoveringTasks(true)}
            onMouseLeave={() => setIsHoveringTasks(false)}
          >
            <span className="text-caption text-gray-700 dark:text-gray-300 cursor-pointer">
              Active Tasks: {project.task_counts.pending}
            </span>
            {isHoveringTasks && (
              <div className="absolute top-full left-0 mt-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg p-4 w-64 flex flex-wrap gap-2 z-50">
                {tasks.map(task => (
                  <TaskTitleCard key={task.id} task={task} className="truncate" />
                ))}
              </div>
            )}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setIsHoveringMembers(true)}
            onMouseLeave={() => setIsHoveringMembers(false)}
          >
            <span className="text-caption text-gray-700 dark:text-gray-300 cursor-pointer">
              Active Members: {project.active_members}
            </span>
            {isHoveringMembers && (
              <div className="absolute top-full left-0 mt-0 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 shadow-lg p-4 w-64 flex flex-wrap gap-2 z-50">
                {project.members.map(member => (
                  <div key={member.id} className="text-caption text-gray-700 px-2 py-1 border border-gray-700 rounded-sm dark:text-gray-300 dark:border-gray-300">
                    {member.username}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!isDeadlineEditing ? (
            <div className="flex justify-start items-center gap-2">
              <span className="text-caption text-gray-700 dark:text-gray-300">
                Deadline: {new Date(project.deadline).toISOString().split('T')[0]}
              </span>
              <button onClick={() => setIsDeadlineEditing(true)} className="aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-caption cursor-pointer">
                <FaPen />
              </button>
            </div>
          ) : (
            <div className="w-fit flex justify-start items-center gap-2">
              <input
                type="date"
                name="deadline"
                onChange={handleDeadlineChange}
                className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded"
                required
              />
              <Button onClick={handleSubmit} width='fit'>
                Save
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Calendar View */}
      <div className="bg-white dark:bg-gray-800 text-surface-black dark:text-surface-white shadow border-t">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <p className="text-body font-semibold">Calendar View:</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-body font-semibold">
              {displayMonth} {currentYear}
            </span>
            <button 
              onClick={goToPreviousMonth} 
              disabled={leftDisabled}
              className={`${leftDisabled ? 'opacity-50' : 'opacity-100 hover:scale-110 cursor-pointer'}`}
            >
              <FaChevronLeft />
            </button>
            <button 
              onClick={goToNextMonth} 
              disabled={rightDisabled}
              className={`${rightDisabled ? 'opacity-50' : 'opacity-100 hover:scale-110 cursor-pointer'}`}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Days of the Week Header */}
        <div className="grid grid-cols-7 gap-1 border-b border-gray-300 dark:border-gray-600 px-2 py-1">
          {daysOfWeek.map((day, index) => (
            <div key={index} className="text-center text-caption font-semibold text-gray-700 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days Grid with Tasks */}
        <div className="grid grid-cols-7">
          {calendarDays.map((cell, index) => {
            // Find tasks that start on this day
            const cellTasks = tasks.filter(task => {
              const taskStart = new Date(task.start_time);
              return isSameDay(taskStart, cell.date);
            });

            // Check if the cell represents the current day
            const isToday = isSameDay(cell.date, currentDate);

            return (
              <div
                {...(cell.isCurrentMonth &&
                  !(
                    (currentMonth === projectCreated.getMonth() && cell.date.getDate() < projectCreated.getDate()) ||
                    (currentMonth === projectDeadline.getMonth() && cell.date.getDate() > projectDeadline.getDate())
                  ) && { onClick: () => openModal(cell, cellTasks) 
                })}
                key={index}
                className={`aspect-square border border-gray-300 dark:border-gray-600 p-1 text-body text-left overflow-auto rounded-lg m-[2px] ${
                  isToday ? 'bg-primary dark:bg-primary-dark text-surface-white cursor-pointer' :
                  cell.isCurrentMonth
                    ? (
                        (currentMonth === projectCreated.getMonth() && cell.date.getDate() < projectCreated.getDate()) ||
                        (currentMonth === projectDeadline.getMonth() && cell.date.getDate() > projectDeadline.getDate())
                      ) ? 'opacity-30' : 'bg-blue-300 dark:bg-blue-950 text-surface-white cursor-pointer'
                    : 'opacity-30'
                }`}
              >
                {cell.date.getDate()}
                <div className="flex flex-col gap-1 mt-2">
                  {cellTasks.map(task => (
                    <TaskTitleCard key={task.id} task={task} className='truncate' />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectSection;