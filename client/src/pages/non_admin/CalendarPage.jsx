import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../API/api.interceptors';
import TaskTitleCard from '../../components/TaskTitleCard';
import Button from '../../components/Button';
import TaskPage from './TaskPage';

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Helper function to check if two dates represent the same calendar day.
const isSameDay = (d1, d2) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

const CalendarPage = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all'); // Default to "All Tasks"
  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
  });

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCell, setModalCell] = useState(null);
  const [modalCellTasks, setModalCellTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projects.length > 0) {
      fetchAllTasks();
    }
  }, [projects]);

  useEffect(() => {
    if (tasks.length > 0) {
      initializeCalendar();
    }
  }, [tasks, currentMonth, currentYear]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects/user/assigned');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    }
  };

  const fetchAllTasks = async (priority = 'all', status = 'all') => {
    try {
      let allTasks = [];
      const endpoint =
      priority === 'all' && status === 'all'
        ? `/tasks/user/assigned` :
        priority !== 'all' && status === 'all' ?
        `/tasks/user/assigned?priority=${priority}` :
        status !== 'all' && priority === 'all' ?
        `/tasks/user/assigned?status=${status}` :
        `/tasks/user/assigned?priority=${priority}&status=${status}`;
      const response = await api.get(endpoint);
      allTasks = [...allTasks, ...response.data];
      setTasks(allTasks);
      setFilteredTasks(allTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const initializeCalendar = () => {
    const taskDates = tasks.map((task) => new Date(task.start_time));
    const firstTaskDate = new Date(Math.min(...taskDates));
    const lastTaskDate = new Date(Math.max(...taskDates));

    const firstMonth = firstTaskDate.getMonth();
    const firstYear = firstTaskDate.getFullYear();
    const lastMonth = lastTaskDate.getMonth();
    const lastYear = lastTaskDate.getFullYear();

    if (currentMonth === null || currentYear === null) {
      setCurrentMonth(firstMonth);
      setCurrentYear(firstYear);
    }

    const daysArray = [];
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    // Add days from the previous month to fill the first week
    const firstDayOfWeek = startDate.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(startDate);
      date.setDate(date.getDate() - i - 1);
      daysArray.push({ date, isCurrentMonth: false });
    }

    // Add days for the current month
    for (let day = 1; day <= endDate.getDate(); day++) {
      daysArray.push({ date: new Date(currentYear, currentMonth, day), isCurrentMonth: true });
    }

    // Add days from the next month to fill the last week
    const lastDayOfWeek = endDate.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(endDate);
      date.setDate(date.getDate() + i);
      daysArray.push({ date, isCurrentMonth: false });
    }

    setCalendarDays(daysArray);
  };

  const handleProjectFilter = (projectId) => {
    setSelectedProject(projectId);
  };

  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    const priority = name === 'priority' ? value : filters.priority;
    const status = name === 'status' ? value : filters.status;
  
    // Update the filters state
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  
    try {
      // Step 1: Fetch all tasks without filters to determine the scope
      let allTasks = [];
      for (const project of projects) {
        const response = await api.get(`/tasks/project/${project.id}`);
        allTasks = [...allTasks, ...response.data];
      }
  
      // Update the scope based on all tasks
      const taskDates = allTasks.map((task) => new Date(task.start_time));
      const firstTaskDate = new Date(Math.min(...taskDates));
      const lastTaskDate = new Date(Math.max(...taskDates));
      setCurrentMonth(firstTaskDate.getMonth());
      setCurrentYear(firstTaskDate.getFullYear());
  
      // Step 2: Fetch tasks with the applied filters
      let filteredTasks = [];
      const endpoint =
      priority === 'all' && status === 'all'
        ? `/tasks/user/assigned` :
        priority !== 'all' && status === 'all' ?
        `/tasks/user/assigned?priority=${priority}` :
        status !== 'all' && priority === 'all' ?
        `/tasks/user/assigned?status=${status}` :
        `/tasks/user/assigned?priority=${priority}&status=${status}`;
      const response = await api.get(endpoint);
      filteredTasks = [...filteredTasks, ...response.data];
  
      // Update the tasks and filtered tasks state
      setTasks(allTasks);
      setFilteredTasks(filteredTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear((prev) => prev - 1);
      } else {
        setCurrentMonth((prev) => prev - 1);
      }
    } else if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear((prev) => prev + 1);
      } else {
        setCurrentMonth((prev) => prev + 1);
      }
    }
  };

  //Modal related functions

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

  // Open the timeline modal for a specific day
  const openModal = (cell, cellTasks) => {
    setModalCell(cell);
    setModalCellTasks(cellTasks);
    setIsModalOpen(true);
  };

  // Close the timeline modal
  const closeModal = () => {
    setModalCell(null);
    setModalCellTasks([]);
    setIsModalOpen(false);
  };

  // Constants
  const firstTask = new Date(Math.min(...tasks.map((task) => new Date(task.start_time))));
  const lastTask = new Date(Math.max(...tasks.map((task) => new Date(task.end_time))));
  const leftDisabled = currentYear === firstTask.getFullYear() && currentMonth === firstTask.getMonth();
  const rightDisabled = currentYear === lastTask.getFullYear() && currentMonth === lastTask.getMonth();

  const Modal = (
    <div className="fixed inset-0 z-10 w-full flex items-center justify-center bg-transparent">
      <div className="absolute z-0 inset-0 bg-white dark:bg-black opacity-90 dark:opacity-70" />
      <div className="relative z-10 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-2/3 h-[80vh] flex flex-col items-start overflow-hidden">
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
                    className="truncate relative z-20 -translate-y-6 hover:-translate-y-7 transition-transform" 
                    style={{ 
                      top: `${topPosition}px`, 
                      height: `${height}px`, 
                      position: 'absolute',
                    }} 
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full flex justify-between items-center mt-12">
          <Button onClick={closeModal} width='fit' isCloseButton={true} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen w-full">
      {/* Modal for Task Page */}
      {selectedTask && <TaskPage taskId={selectedTask.id} setSelectedTask={setSelectedTask} fetchTasks={fetchAllTasks}/>}

      {/* Modal for Task Creation */}
      {isModalOpen && Modal}

      <div className="flex flex-col md:flex-row gap-4 px-4 sm:px-8 py-8 sm:py-16">
        {/* Sidebar */}
        <div className="w-1/4 bg-background border dark:bg-gray-800 p-6 rounded-lg">
          
          {/* Status & Priority Filters */}
          <h3 className="text-body text-surface-black dark:text-surface-white font-bold">Filters</h3>
          <div className="mt-2">
            <label className="text-surface-black dark:text-surface-white block mb-1">Priority</label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="bg-primary dark:bg-primary-dark text-surface-white w-full border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div className="mt-2">
            <label className="text-surface-black dark:text-surface-white block mb-1">Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="bg-primary dark:bg-primary-dark text-surface-white w-full border p-2 rounded"
            >
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Project Filter */}
          <h3 className="text-body font-bold mb-4 text-surface-black dark:text-surface-white mt-6">Projects</h3>
          <ul className='text-surface-black dark:text-surface-white'>
            <li
              className={`text-body p-2 rounded-lg whitespace-nowrap truncate ${
                selectedProject === 'all' ? 'bg-blue-500 dark:bg-primary-dark text-surface-white' : ''
              } cursor-pointer`}
              onClick={() => handleProjectFilter('all')}
            >
              All Tasks
            </li>
            {projects.map((project) => (
              <li
                key={project.id}
                className={`text-body p-2 rounded-lg whitespace-nowrap truncate ${
                  selectedProject === project.id ? 'bg-blue-500 dark:bg-primary-dark text-surface-white' : ''
                } cursor-pointer`}
                onClick={() => handleProjectFilter(project.id)}
              >
                {project.name}
              </li>
            ))}
          </ul>
        </div>

        {/* Calendar */}
        <div className="w-3/4">
          {/* Calendar Header */}
          <div className="flex flex-col gap-2 p-2 mb-4 rounded-lg border dark:bg-gray-800">
            {/* Project Scope Message */}
            <div className="text-left text-caption italic font-semibold text-surface-black dark:text-surface-white">
              You have Tasks from <strong>{monthNames[firstTask.getMonth()]} {firstTask.getFullYear()}</strong> to <strong>{monthNames[lastTask.getMonth()]} {lastTask.getFullYear()}</strong>
            </div>
            <div className="flex justify-between items-center">
              <h3 className="text-body text-surface-black dark:text-surface-white">
                {monthNames[currentMonth]} {currentYear}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMonthChange('prev')}
                  disabled={leftDisabled}
                  className={`p-2 rounded-full text-surface-black dark:text-surface-white ${
                    leftDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                  }`}
                >
                  <FaChevronLeft />
                </button>
                <button
                  onClick={() => handleMonthChange('next')}
                  disabled={rightDisabled}
                  className={`p-2 rounded-full text-surface-black dark:text-surface-white ${
                    rightDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'
                  }`}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {daysOfWeek.map((day) => (
              <div key={day} className="text-center font-bold text-surface-black dark:text-surface-white">
                {day}
              </div>
            ))}
            {calendarDays.map((cell, index) => {
              const cellTasks = filteredTasks.filter((task) => isSameDay(new Date(task.start_time), cell.date));
              const isToday = isSameDay(cell.date, new Date());
              return (
                <div
                  key={index}
                  className={`aspect-square border border-gray-300 dark:border-gray-600 p-1 text-body text-left overflow-auto rounded-lg m-[2px] ${
                    isToday ? 'bg-primary dark:bg-primary-dark text-surface-white cursor-pointer' :
                    cell.isCurrentMonth
                      ? 'bg-blue-300 dark:bg-blue-950 text-surface-white cursor-pointer'
                      : 'opacity-30 text-success-dark dark:text-surface-white'
                  }`}
                  onClick={() => openModal(cell, cellTasks)}
                >
                  {cell.date.getDate()}
                  <div className="flex flex-col gap-1 mt-2">
                    {cellTasks.map((task) => (
                      <TaskTitleCard
                        key={task.id}
                        task={task}
                        className={selectedProject !== 'all' && task.project_id !== selectedProject ? 'opacity-50 truncate' : 'truncate'}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;