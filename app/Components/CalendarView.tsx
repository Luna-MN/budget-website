import React, { useState, useEffect } from 'react';
import styles from './CalendarView.module.css';
import TripCreationModal from './TripCreationModal';
import ContextMenu from './ContextMenu';
import DayDetailPanel from './DayDetailPanel';

// Trip interface
interface Activity {
    id: string;
    time: string;
    description: string;
    price: number;
}

interface TripDay {
    date: Date;
    activities: Activity[];
    dailyBudget: number;
    name?: string;
}

interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
    dailyBudget: number;
    days?: TripDay[]; // Add this to store day-specific data
    currency?: string; // Add currency property
}

interface CalendarViewProps {
    onDayClick?: (date: Date) => void;
    onDatesSelected?: (dates: Date[]) => void;
    onCreateTrip?: (trip: Trip) => void;
    trips?: Trip[];
    selectedTripId?: string | null;
    onUpdateTripDay?: (tripId: string, day: TripDay) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    onDayClick,
    onDatesSelected,
    onCreateTrip,
    trips = [],
    selectedTripId = null,
    onUpdateTripDay,
}) => {
    // Calendar navigation state
    const [currentDate, setCurrentDate] = useState(new Date());

    // Date selection state
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDate, setDragStartDate] = useState<Date | null>(null);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    // UI state
    const [contextMenu, setContextMenu] = useState({
        show: false,
        x: 0,
        y: 0,
    });
    const [showModal, setShowModal] = useState(false);
    const [selectedDay, setSelectedDay] = useState<Date | null>(null);
    const [showDayDetail, setShowDayDetail] = useState(false);

    // Helper values
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const monthName = new Intl.DateTimeFormat('en-US', {
        month: 'long',
    }).format(currentDate);
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Month navigation
    const prevMonth = () =>
        setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    const nextMonth = () =>
        setCurrentDate(new Date(currentYear, currentMonth + 1, 1));

    // Generate days for calendar grid
    const generateDays = (): Date[] => {
        const days: Date[] = [];

        // First day of the month
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        // Last day of the month
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        // First day of the week (0 = Sunday, 6 = Saturday)
        const firstDayWeekday = firstDayOfMonth.getDay();

        // Add days from previous month
        for (let i = 0; i < firstDayWeekday; i++) {
            const prevMonthDate = new Date(currentYear, currentMonth, 1);
            prevMonthDate.setDate(
                prevMonthDate.getDate() - (firstDayWeekday - i)
            );
            days.push(prevMonthDate);
        }

        // Add days of current month
        for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
            days.push(new Date(currentYear, currentMonth, day));
        }

        // Add days from next month
        const totalCurrentDays = days.length;
        const rowsNeeded = Math.ceil(totalCurrentDays / 7);
        const neededRows =
            rowsNeeded === 5 || rowsNeeded === 6 ? rowsNeeded : 6;
        const totalDaysNeeded = neededRows * 7;
        const remainingSlots = totalDaysNeeded - days.length;

        for (let i = 1; i <= remainingSlots; i++) {
            const nextMonthDate = new Date(
                currentYear,
                currentMonth,
                lastDayOfMonth.getDate() + i
            );
            days.push(nextMonthDate);
        }

        return days;
    };

    // Date comparison helper
    const isSameDay = (date1: Date, date2: Date): boolean => {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        );
    };

    // Date status helpers
    const isToday = (date: Date): boolean => isSameDay(date, new Date());
    const isCurrentMonth = (date: Date): boolean =>
        date.getMonth() === currentMonth;
    const isSelected = (date: Date): boolean =>
        selectedDates.some((selectedDate) => isSameDay(date, selectedDate));
    const isDayInSelectedTrip = (date: Date): boolean => {
        if (!selectedTripId) return false;
        const selectedTrip = trips.find((trip) => trip.id === selectedTripId);
        return selectedTrip
            ? selectedTrip.dates.some((tripDate) => isSameDay(tripDate, date))
            : false;
    };
    const getTripsForDate = (date: Date): Trip[] => {
        return trips.filter((trip) =>
            trip.dates.some((tripDate) => isSameDay(tripDate, date))
        );
    };

    // Mouse event handlers
    const handleMouseDown = (date: Date, e: React.MouseEvent) => {
        if (e.button === 0) {
            // Left click
            setIsDragging(true);
            setDragStartDate(date);
            setSelectedDates([date]);
            setSelectedDate(date);
            setContextMenu({ show: false, x: 0, y: 0 });

            // If it's a trip day, also handle day selection
            const isInTrip = trips.some((trip) =>
                trip.dates.some((tripDate) => isSameDay(tripDate, date))
            );

            if (isInTrip) {
                handleDayClick(date);
            }
        }
    };

    const handleMouseEnter = (date: Date) => {
        if (isDragging && dragStartDate) {
            const startDate = new Date(dragStartDate);
            const currentDate = new Date(date);
            const newSelectedDates: Date[] = [];

            // Determine date range boundaries
            const start = startDate < currentDate ? startDate : currentDate;
            const end = startDate < currentDate ? currentDate : startDate;

            // Fill array with all dates in range
            const tempDate = new Date(start);
            while (tempDate <= end) {
                newSelectedDates.push(new Date(tempDate));
                tempDate.setDate(tempDate.getDate() + 1);
            }

            setSelectedDates(newSelectedDates);
        }
    };

    const handleMouseUp = () => {
        if (isDragging && selectedDates.length > 0) {
            if (onDatesSelected) {
                onDatesSelected(selectedDates);
            }
            setIsDragging(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        if (selectedDates.length > 0) {
            e.preventDefault();
            setContextMenu({
                show: true,
                x: e.clientX,
                y: e.clientY,
            });
        }
    };

    // Trip creation handlers
    const handleCreateTrip = () => {
        setContextMenu({ show: false, x: 0, y: 0 });
        setShowModal(true);
    };

    // Adapter function to handle different Trip interfaces
    const handleNewTrip = (modalTrip: any) => {
        // Ensure the trip has the dailyBudget property required by this component
        const completeTrip: Trip = {
            ...modalTrip,
            dailyBudget: modalTrip.dailyBudget || 0, // Default to 0 if not provided
        };

        if (onCreateTrip) {
            onCreateTrip(completeTrip);
        }
    };

    // Day click handler
    const handleDayClick = (date: Date) => {
        // Check if the clicked day is part of any trip
        const tripsForThisDay = trips.filter((trip) =>
            trip.dates.some((tripDate) => isSameDay(tripDate, date))
        );

        if (tripsForThisDay.length > 0) {
            setSelectedDay(date);
            setShowDayDetail(true);

            if (onDayClick) {
                onDayClick(date);
            }
        }
    };

    // Get the trip for the selected day
    const getSelectedDayTrip = (): Trip | undefined => {
        if (!selectedDay) return undefined;

        // If there's a selectedTripId, use that trip if it contains the day
        if (selectedTripId) {
            const trip = trips.find((t) => t.id === selectedTripId);
            if (trip && trip.dates.some((d) => isSameDay(d, selectedDay))) {
                return trip;
            }
        }

        // Otherwise return the first trip that contains this day
        return trips.find((trip) =>
            trip.dates.some((d) => isSameDay(d, selectedDay))
        );
    };

    // Functions to handle activities
    const handleAddActivity = (activity: Activity) => {
        const trip = getSelectedDayTrip();
        if (!trip || !selectedDay || !onUpdateTripDay) return;

        // Create or update the day's activities
        const existingDayIndex =
            trip.days?.findIndex((day) => isSameDay(day.date, selectedDay)) ??
            -1;

        if (existingDayIndex >= 0 && trip.days) {
            // Update existing day
            const updatedDays = [...trip.days];
            updatedDays[existingDayIndex] = {
                ...updatedDays[existingDayIndex],
                activities: [
                    ...updatedDays[existingDayIndex].activities,
                    activity,
                ],
            };

            onUpdateTripDay(trip.id, updatedDays[existingDayIndex]);
        } else {
            // Create new day
            const newDay: TripDay = {
                date: new Date(selectedDay),
                activities: [activity],
                dailyBudget: trip.dailyBudget,
            };

            onUpdateTripDay(trip.id, newDay);
        }
    };

    const handleDeleteActivity = (activityId: string) => {
        const trip = getSelectedDayTrip();
        if (!trip || !selectedDay || !onUpdateTripDay) return;

        const existingDayIndex =
            trip.days?.findIndex((day) => isSameDay(day.date, selectedDay)) ??
            -1;

        if (existingDayIndex >= 0 && trip.days) {
            // Update existing day
            const updatedDays = [...trip.days];
            updatedDays[existingDayIndex] = {
                ...updatedDays[existingDayIndex],
                activities: updatedDays[existingDayIndex].activities.filter(
                    (a) => a.id !== activityId
                ),
            };

            onUpdateTripDay(trip.id, updatedDays[existingDayIndex]);
        }
    };

    // Get the activities for the selected day
    const getSelectedDayActivities = (): Activity[] => {
        const trip = getSelectedDayTrip();
        if (!trip || !selectedDay) return [];

        const dayData = trip.days?.find((day) =>
            isSameDay(day.date, selectedDay)
        );
        return dayData?.activities || [];
    };

    // Global event listeners
    useEffect(() => {
        const handleGlobalMouseUp = () => {
            if (isDragging) {
                handleMouseUp();
            }
        };

        const handleGlobalClick = () => {
            if (contextMenu.show) {
                setContextMenu({ show: false, x: 0, y: 0 });
            }
        };

        document.addEventListener('mouseup', handleGlobalMouseUp);
        document.addEventListener('click', handleGlobalClick);

        return () => {
            document.removeEventListener('mouseup', handleGlobalMouseUp);
            document.removeEventListener('click', handleGlobalClick);
        };
    }, [isDragging, selectedDates, contextMenu.show]);

    // Add this to your component's render function
    const calendarDays = generateDays();
    const neededRows = Math.ceil(calendarDays.length / 7);

    // Update TripDay interface to include name
    interface TripDay {
        date: Date;
        activities: Activity[];
        dailyBudget: number;
        name?: string;
    }

    // Add a function to get the day name
    const getDayName = (date: Date): string | undefined => {
        for (const trip of trips) {
            if (!trip.days) continue;

            const day = trip.days.find(
                (day) => day.date && isSameDay(new Date(day.date), date)
            );

            if (day?.name) return day.name;
        }
        return undefined;
    };

    // Update the rendering of days in the calendar
    const renderDays = () => {
        return calendarDays.map((date, index) => {
            // Get other classes and logic as before
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDates.some((d) => isSameDay(d, date));
            const isInCurrentMonth = date.getMonth() === currentDate.getMonth();

            // Find if this day is part of a trip
            const tripForDay = trips.find((trip) =>
                trip.dates.some((tripDate) => isSameDay(tripDate, date))
            );

            // Get the day name if it exists
            const dayName = getDayName(date);

            return (
                <div
                    key={index}
                    className={`
                    ${styles.day}
                    ${isToday ? styles.today : ''}
                    ${isSelected ? styles.selected : ''}
                    ${!isInCurrentMonth ? styles.otherMonth : ''}
                    ${tripForDay ? styles.hasTrip : ''}
                    ${
                        tripForDay && selectedTripId === tripForDay.id
                            ? styles.inSelectedTrip
                            : ''
                    }
                `}
                    style={tripForDay ? { color: tripForDay.color } : {}}
                    onMouseDown={(e) => handleMouseDown(date, e)}
                    onMouseOver={() => handleMouseEnter(date)}
                >
                    <span className={styles.dayNumber}>{date.getDate()}</span>

                    {/* Add this block to display day names */}
                    {dayName && (
                        <span className={styles.dayNameLabel}>{dayName}</span>
                    )}

                    {/* Your existing trip indicators */}
                    {tripForDay && (
                        <>
                            <div className={styles.tripIndicators}>
                                {/* Trip indicators content */}
                            </div>
                            <div
                                className={styles.tripNameIndicator}
                                style={{
                                    backgroundColor: `${tripForDay.color}b3`,
                                }}
                            >
                                {tripForDay.name}
                            </div>
                        </>
                    )}
                </div>
            );
        });
    };

    // Update onDayNameChange handler
    const handleDayNameChange = (name: string) => {
        const trip = getSelectedDayTrip();
        if (!trip || !selectedDay || !onUpdateTripDay) return;

        const existingDayIndex =
            trip.days?.findIndex((day) => isSameDay(day.date, selectedDay)) ??
            -1;

        if (existingDayIndex >= 0 && trip.days) {
            // Update existing day
            const updatedDays = [...trip.days];
            updatedDays[existingDayIndex] = {
                ...updatedDays[existingDayIndex],
                name: name,
            };

            onUpdateTripDay(trip.id, updatedDays[existingDayIndex]);
        } else {
            // Create new day
            const newDay: TripDay = {
                date: new Date(selectedDay),
                activities: [],
                dailyBudget: trip.dailyBudget,
                name: name,
            };

            onUpdateTripDay(trip.id, newDay);
        }
    };

    // Add this handler function
    const handleDailyBudgetChange = (budget: number) => {
        if (!selectedDay || !selectedTripId) return;

        const trip = getSelectedDayTrip();
        if (!trip || !onUpdateTripDay) return;

        // Create or update the day's budget, preserving all other fields
        const existingDayIndex =
            trip.days?.findIndex((day) => isSameDay(day.date, selectedDay)) ??
            -1;

        if (existingDayIndex >= 0 && trip.days) {
            // Update existing day, preserve all fields
            const updatedDays = [...trip.days];
            updatedDays[existingDayIndex] = {
                ...updatedDays[existingDayIndex],
                dailyBudget: budget,
            };
            onUpdateTripDay(trip.id, updatedDays[existingDayIndex]);
        } else {
            // Create new day
            const newDay: TripDay = {
                date: new Date(selectedDay),
                activities: [],
                dailyBudget: budget,
            };
            onUpdateTripDay(trip.id, newDay);
        }
    };

    return (
        <div
            className={`${styles.calendarWrapper} ${
                showDayDetail ? styles.withPanel : ''
            }`}
        >
            <div className={styles.calendar} onContextMenu={handleContextMenu}>
                {/* Header with month navigation */}
                <div className={styles.header}>
                    <button onClick={prevMonth}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <h2>
                        {monthName} {currentYear}
                    </h2>
                    <button onClick={nextMonth}>
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M9 6L15 12L9 18"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>

                {/* Weekday headers */}
                <div className={styles.weekdays}>
                    {weekdays.map((day) => (
                        <div key={day} className={styles.weekday}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar grid */}
                <div
                    className={styles.days}
                    style={{
                        gridTemplateRows: `repeat(${neededRows}, 1fr)`,
                    }}
                >
                    {calendarDays.map((date, index) => {
                        const dateTrips = getTripsForDate(date);
                        const isInSelectedTrip = isDayInSelectedTrip(date);
                        const dayName = getDayName(date); // Add this line

                        return (
                            <div
                                key={index}
                                className={`
                ${styles.day}
                ${isToday(date) ? styles.today : ''}
                ${isSelected(date) ? styles.selected : ''}
                ${!isCurrentMonth(date) ? styles.otherMonth : ''}
                ${isInSelectedTrip ? styles.inSelectedTrip : ''}
            `}
                                onMouseDown={(e) => handleMouseDown(date, e)}
                                onMouseEnter={() => handleMouseEnter(date)}
                                onMouseUp={handleMouseUp}
                            >
                                <span className={styles.dayNumber}>
                                    {date.getDate()}
                                </span>

                                {/* Add this block for day names */}
                                {dayName && (
                                    <span className={styles.dayNameLabel}>
                                        {dayName}
                                    </span>
                                )}

                                {/* Trip indicators */}
                                {dateTrips.length > 0 && (
                                    <div className={styles.tripIndicators}>
                                        {dateTrips.map((trip) => {
                                            const isSelected =
                                                trip.id === selectedTripId;
                                            return (
                                                <div
                                                    key={trip.id}
                                                    className={`${
                                                        styles.tripDot
                                                    } ${
                                                        isSelected
                                                            ? styles.selectedTripDot
                                                            : ''
                                                    }`}
                                                    style={{
                                                        backgroundColor:
                                                            trip.color,
                                                    }}
                                                    title={trip.name}
                                                />
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Trip name indicator */}
                                {isInSelectedTrip && selectedTripId && (
                                    <div
                                        className={styles.tripNameIndicator}
                                        style={{
                                            backgroundColor:
                                                trips.find(
                                                    (t) =>
                                                        t.id === selectedTripId
                                                )?.color + 'B3',
                                        }}
                                    >
                                        {
                                            trips.find(
                                                (t) => t.id === selectedTripId
                                            )?.name
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Context menu and modal */}
                <ContextMenu
                    show={contextMenu.show}
                    x={contextMenu.x}
                    y={contextMenu.y}
                    onCreateTrip={handleCreateTrip}
                />

                <TripCreationModal
                    show={showModal}
                    onClose={() => setShowModal(false)}
                    onCreateTrip={handleNewTrip}
                    selectedDates={selectedDates}
                />
            </div>

            {showDayDetail && selectedDay && (
                <div className={styles.detailPanelContainer}>
                    <DayDetailPanel
                        date={selectedDay}
                        tripId={getSelectedDayTrip()?.id || ''}
                        tripName={getSelectedDayTrip()?.name || ''}
                        tripColor={getSelectedDayTrip()?.color || '#cccccc'}
                        dailyBudget={
                            (getSelectedDayTrip()?.days?.find((day) =>
                                isSameDay(day.date, selectedDay)
                            )?.dailyBudget ??
                                getSelectedDayTrip()?.dailyBudget) ||
                            0
                        }
                        onClose={() => setShowDayDetail(false)}
                        onActivityAdd={handleAddActivity}
                        onActivityDelete={handleDeleteActivity}
                        activities={getSelectedDayActivities()}
                        dayName={
                            getSelectedDayTrip()?.days?.find((day) =>
                                isSameDay(day.date, selectedDay)
                            )?.name || ''
                        }
                        onDayNameChange={handleDayNameChange}
                        onDailyBudgetChange={handleDailyBudgetChange} // Add this
                        currency={getSelectedDayTrip()?.currency || '$'} // Make sure this is passed
                    />
                </div>
            )}
        </div>
    );
};

export default CalendarView;
