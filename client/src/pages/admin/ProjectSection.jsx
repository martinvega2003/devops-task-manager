import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../API/api.interceptors';
import TaskTitleCard from '../../components/TaskTitleCard';
import Button from '../../components/Button';
import TaskPage from './TaskPage';
import AddTaskForm from '../../components/AddTaskForm'
import { FaChevronLeft, FaChevronRight, FaPen } from 'react-icons/fa';
import { toast } from 'react-toastify';

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

    // To avoid timezone convertion conflicts in the deadline
    const selectedDate = updatedProject.deadline.split('T')[0]; // e.g., "2025-08-01"
    const date = new Date(selectedDate + "T00:00:00");
    const isoDate = date.toISOString().replace(/\.\d{3}Z$/, 'Z');

    setUpdatedProject({
      ...updatedProject,
      [e.target.name]: e.target.value,
      deadline: isoDate
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

    if (updatedProject === project) {
      setIsDeadlineEditing(false); 
      setIsDescriptionEditing(false); 
      setIsTitleEditing(false);
      return
    }
    
    const payload = {
      name: updatedProject.name,
      description: updatedProject.description,
      deadline: updatedProject.deadline
    }

    try {
      await api.put('projects/' + project_id, payload)
      toast.success("project updated", {
        toastId: 'project-update-success'
      })
      fetchProject()
      setIsTitleEditing(false)
      setIsDescriptionEditing(false)
      setIsDeadlineEditing(false)
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Could not Update Project', {
        toastId: 'project-update-error'
      })
    }
  }

  // Description editing ref and useEffect to handle auto-focus
  // Ref for the description textarea
  const descriptionRef = useRef(null);

  useEffect(() => {
    if (isDescriptionEditing && descriptionRef.current) {
      const textarea = descriptionRef.current;
      textarea.focus();
      // Move cursor to the end
      textarea.selectionStart = textarea.selectionEnd = textarea.value.length;

      // Scroll to the end so the last part is visible
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, [isDescriptionEditing]);

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
      const loadingToastID = toast.loading("Loading Project's information");
      const res = await api.get(`/projects/${project_id}`);
      setProject(res.data);
      setUpdatedProject(res.data)
      toast.dismiss(loadingToastID)

      // Initialize currentMonth and currentYear only if they are null
      if (currentMonth === null && currentYear === null) {
        const createdDate = new Date(res.data.created_at);
        setCurrentMonth(createdDate.getMonth());
        setCurrentYear(createdDate.getFullYear());
      }
    } catch (error) {
      // Update the loading toast to show an error message
      toast.update(loadingToastId, {
        render: error.response?.data?.msg || 'Error fetching project',
        type: 'error',
        isLoading: false,
        autoClose: 5000,
      });
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
      toast.error(error.response?.data?.msg || 'Error fetching tasks:', {
        toastId: 'tasks-fetch-error'
      });
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
      // Only update state if the tasks have changed
      if (JSON.stringify(newCellTasks) !== JSON.stringify(modalCellTasks)) {
        setModalCellTasks(newCellTasks);
      }
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

  if (!project) return null;

  // Days of the week
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

  // Helper function to check if two dates represent the same calendar day.
  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const Modal = (
      <div className="relative z-10 bg-white dark:bg-gray-800 p-2 sm:p-6 pb-12 sm:pb-6 rounded-lg shadow-lg w-full sm:w-2/3 h-full sm:h-[80vh] flex flex-col items-start overflow-y-auto">
        {isTaskFormOpen && <AddTaskForm project_id={project_id} setIsTaskFormOpen={setIsTaskFormOpen} modalCell={modalCell} fetchTasks={fetchTasks} />}
        <h3 className="text-body dark:text-surface-white font-bold sm:mb-4">
          Task for {monthNames[currentMonth]} {modalCell && modalCell.date.getDate()}, {currentYear}:
        </h3>
        
        {/* Timeline and Tasks Container */}
        <div 
          className="relative flex h-4/5 w-full overflow-auto"
          onClick={() => setIsTaskFormOpen(true)}
        >
          {/* Vertical Timeline */}
          <div className="sticky z-30 left-0 h-fit bg-white dark:bg-gray-800 text-caption text-surface-black dark:text-surface-white pr-2 border-r border-gray-300 dark:border-gray-600 flex flex-col items-end">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="pb-8 text-right w-fit sm:w-12 h-12 flex items-start">
                <span>{hour}:00</span>
              </div>
            ))}
          </div>

          {/* Timeline + Tasks */}
          <div className="relative flex-1 pr-12"> {/* flex-1 fills the remaining horizontal space */}

            {/* Hour lines */}
            <div className="absolute inset-0 z-10 w-full h-full pointer-events-none"> {/* Match scrollable area with w-full (And on each line) */}
              {Array.from({ length: 24 }).map((_, hour) => (
                <div
                  key={hour}
                  className="w-full border-t border-dashed border-gray-300 dark:border-gray-600" 
                  style={{ position: 'absolute', top: `${hour * 48}px` }}
                /> 
              ))} 
            </div>

            {/* Tasks container */}
            <div className="relative flex justify-start gap-1 min-w-full w-max"> {/* w-max allows the container to grow horizontally if content exceeds width & min-w-full to always match scrollable area width */}
              {modalCellTasks.map(task => {
                const taskStart = new Date(task.start_time);
                const taskEnd = new Date(task.end_time);
                const startHour = taskStart.getHours();
                const startMinutes = taskStart.getMinutes();
                const durationHours = (taskEnd - taskStart) / (1000 * 60 * 60);
                const topPosition = startHour * 48 + (startMinutes / 60) * 48;
                const height = durationHours * 48;

                return (
                  <div key={task.id}>
                    <TaskTitleCard
                      task={task}
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedTask(task);
                      }}
                      className="truncate relative z-20 hover:-translate-y-1 transition-transform"
                      style={{
                        top: `${topPosition}px`,
                        height: `${height}px`,
                        position: 'relative',
                      }}
                      timeBlockView={true}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full h-1/5 flex justify-between items-start sm:items-center mt-3 sm:mt-12">
          <Button onClick={() => setIsModalOpen(false)} width='fit' isCloseButton={true} />

          <Button isAddButton={true} width='fit' onClick={() => setIsTaskFormOpen(true)} />
        </div>
      </div>
  );

  const openModal = (cell, cellTasks) => {
    setModalCell(cell)
    setModalCellTasks(cellTasks)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-background dark:bg-background-dark h-full w-full">
      {/* Modal for Task Page */}
      <TaskPage selectedTask={selectedTask} setSelectedTask={setSelectedTask} fetchTasks={fetchTasks}/>

      {/* Modal for Task And Daily Timeline */}
      {isModalOpen && (
        <>
          {/* Tablets, Notebooks, etc. */}
          <div className="hidden fixed inset-0 z-40 w-full sm:flex items-center justify-center bg-transparent">
            <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
            {Modal}
          </div>

          {/* Mobile Devices */}
          <div className="sm:hidden fixed inset-0 top-16 z-40 w-full h-full items-center justify-center bg-transparent">
            {Modal}
          </div>
        </>
      )}

      {/* Project Header */}
      <div className="p-4">
        {!isTitleEditing ? (
          <div className="w-full flex justify-start items-center gap-2 mb-2">
            <h2 className="text-subheading text-surface-black dark:text-surface-white">
              {project.name}
            </h2>
            <button onClick={() => setIsTitleEditing(true)} className={isDescriptionEditing || isDeadlineEditing ? "hidden" : "aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-body cursor-pointer"}>
              <FaPen />
            </button>
          </div> 
        ) : (
          <div className="w-full flex justify-start items-center gap-2 mb-2 overflow-y-auto">
            <input 
              name='name'
              value={updatedProject.name}
              type="text"
              autoFocus
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
            <button onClick={() => setIsDescriptionEditing(true)} className={isDeadlineEditing || isTitleEditing ? "hidden" : "aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-caption cursor-pointer"}>
              <FaPen />
            </button>
          </div> 
        ) : (
          <div className="w-full flex justify-start items-end gap-2 mb-4">
            <textarea
              ref={descriptionRef}
              value={updatedProject.description} 
              name='description'
              autoFocus
              rows={4}
              cols={50}
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

        <div className="relative flex flex-col-reverse justify-start items-start sm:flex-row sm:justify-between sm:items-center mb-4">
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
              <button onClick={() => setIsDeadlineEditing(true)} className={isDescriptionEditing || isTitleEditing ? "hidden" : "aspect-square p-2 rounded-full border border-gray-400 dark:border-gray-600 text-gray-400 dark:text-gray-600 text-caption cursor-pointer"}>
                <FaPen />
              </button>
            </div>
          ) : (
            <div className="w-fit flex justify-start items-center gap-2">
              <input
                type="date"
                name="deadline"
                value={updatedProject.deadline.split('T')[0]} // Extract date part from ISO string
                autoFocus
                min={new Date(project.created_at).toISOString().split('T')[0]} // Prevent setting a deadline before project creation
                onChange={handleDeadlineChange}
                className="w-full text-surface-black dark:text-surface-white border border-gray-300 dark:border-gray-600 p-2 rounded"
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
      <div className="bg-white dark:bg-background-dark text-surface-black dark:text-surface-white border-t pb-16">
        <div className="flex items-center justify-end sm:justify-between p-4">
          <div className="hidden sm:flex items-center gap-2">
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
                    (
                      currentMonth === projectCreated.getMonth() &&
                      currentYear === projectCreated.getFullYear() && 
                      cell.date.getDate() < projectCreated.getDate()
                    ) || (
                      currentMonth === projectDeadline.getMonth() &&
                      currentYear === projectDeadline.getFullYear() && 
                      cell.date.getDate() > projectDeadline.getDate())
                  ) && { onClick: () => openModal(cell, cellTasks) 
                })}
                key={index}
                className={`relative aspect-square border border-gray-300 dark:border-gray-600 p-1 text-[10px] sm:text-body text-left overflow-hidden sm:overflow-auto rounded-lg m-[2px] ${
                  isToday ? 'bg-primary dark:bg-primary-dark text-surface-white cursor-pointer' :
                  cell.isCurrentMonth
                    ? (
                        (
                          currentMonth === projectCreated.getMonth() && 
                          currentYear === projectCreated.getFullYear() &&
                          cell.date.getDate() < projectCreated.getDate()
                        ) || (
                          currentMonth === projectDeadline.getMonth() && 
                          currentYear === projectDeadline.getFullYear() &&
                          cell.date.getDate() > projectDeadline.getDate()
                        )
                      ) ? 'opacity-30' : 'bg-blue-300 dark:bg-blue-950 text-surface-white cursor-pointer'
                    : 'opacity-30'
                }`}
              >
                {cell.date.getDate()}

                {/* Dots for tasks on mobile */}
                <div className="flex flex-col gap-0.5 mt-0.5 sm:hidden">
                  {cellTasks.map(task => {
                    const bgColor = task.status === 'Completed' ? 'bg-green-500' :
                      task.priority === 'High' ? 'bg-red-500' :
                      task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'

                    return (
                      <div className={"w-full h-1 rounded-sm " + bgColor} />
                    )
                  })}
                </div>
                
                {/* TaskTitleCards for tasks on larger screens */}
                <div className="hidden sm:flex flex-col gap-1 mt-2">
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