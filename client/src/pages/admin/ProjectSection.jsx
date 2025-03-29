import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../API/api.interceptors';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

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
  // currentMonth and currentYear determine which month is displayed.
  const [currentMonth, setCurrentMonth] = useState(null);
  const [currentYear, setCurrentYear] = useState(null);
  const [calendarDays, setCalendarDays] = useState([]);

  // Fetch project information when component mounts
  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await api.get(`/projects/${project_id}`);
        setProject(res.data);
        // Initialize currentMonth/currentYear to project's created_at month/year
        const createdDate = new Date(res.data.created_at);
        setCurrentMonth(createdDate.getMonth());
        setCurrentYear(createdDate.getFullYear());
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [project_id]);

  // Fetch tasks for the project
  useEffect(() => {
    if (project) {
      const fetchTasks = async () => {
        try {
          const res = await api.get(`/tasks/project/${project.id}`);
          setTasks(res.data);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };

      fetchTasks();
    }
  }, [project]);

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

  // Check if a given date falls within the project timeline.
  const isWithinTimeline = (date) => {
    if (!project) return false;
    const created = new Date(project.created_at);
    const deadline = new Date(project.deadline);
    // In creation month, days before created day get reduced opacity
    if (currentMonth === created.getMonth() && currentYear === created.getFullYear()) {
      if (date.getDate() < created.getDate()) return false;
    }
    // In deadline month, days after deadline day get reduced opacity
    if (currentMonth === deadline.getMonth() && currentYear === deadline.getFullYear()) {
      if (date.getDate() > deadline.getDate()) return false;
    }
    return date >= created && date <= deadline;
  };

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

  return (
    <div className="bg-background dark:bg-background-dark min-h-screen">
      {/* Project Header */}
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-2 text-surface-black dark:text-surface-white">
          {project.name}
        </h2>
        <p className="text-body text-gray-700 dark:text-gray-300 mb-4">
          {project.description}
        </p>
        <div className="flex justify-between items-center mb-4">
          <span className="text-caption text-gray-700 dark:text-gray-300">
            Active Tasks: {project.task_counts.pending}
          </span>
          <span className="text-caption text-gray-700 dark:text-gray-300">
            Active Members: {project.active_members}
          </span>
          <span className="text-caption text-gray-700 dark:text-gray-300">
            Deadline: {new Date(project.deadline).toISOString().split('T')[0]}
          </span>
        </div>
      </div>

      {/* Timeline Calendar View */}
      <div className="bg-white dark:bg-gray-800 text-surface-black dark:text-surface-white shadow border-t">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <p className="text-body font-semibold">Calendar View:</p>
          </div>
          <div className="flex items-center gap-2">
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
            <span className="text-body font-semibold">
              {displayMonth} {currentYear}
            </span>
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

            return (
              <div
                key={index}
                className={`h-32 border border-gray-300 dark:border-gray-600 p-1 text-body text-left overflow-auto ${
                  cell.isCurrentMonth
                    ? (
                        (currentMonth === projectCreated.getMonth() && cell.date.getDate() < projectCreated.getDate()) ||
                        (currentMonth === projectDeadline.getMonth() && cell.date.getDate() > projectDeadline.getDate())
                      ) ? 'opacity-30' : 'bg-primary dark:bg-primary-dark text-surface-white cursor-pointer'
                    : 'opacity-30'
                }`}
              >
                <div>{cell.date.getDate()}</div>
                {cellTasks.map(task => (
                  <div key={task.id} className={
                    `w-full text-center text-body text-surface-white py-1 px-3 my-1 rounded-md
                    ${task.priority === 'High' ? 'bg-gradient-to-r from-red-700 to-red-500' :
                      task.priority === 'Medium' ? 'bg-gradient-to-r from-yellow-700 to-yellow-500' :
                      'bg-gradient-to-r from-blue-700 to-blue-500'
                    } hover:-translate-y-1 whitespace-nowrap truncate transition duration-200 cursor-pointer`
                  }>
                    {task.title}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectSection;