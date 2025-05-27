import React, { useState, useEffect } from 'react';
import styles from './CalendarView.module.css';
import TripCreationModal from './TripCreationModal';
import ContextMenu from './ContextMenu';

// Trip interface
interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
}

interface CalendarViewProps {
    onDayClick?: (date: Date) => void;
    onDatesSelected?: (dates: Date[]) => void;
    onCreateTrip?: (trip: Trip) => void;
    trips?: Trip[];
    selectedTripId?: string | null;
}

const CalendarView: React.FC<CalendarViewProps> = ({
    onDayClick,
    onDatesSelected,
    onCreateTrip,
    trips = [],
    selectedTripId = null,
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
        const remainingSlots = 42 - days.length; // 6 rows of 7 days
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

    const handleNewTrip = (trip: Trip) => {
        if (onCreateTrip) {
            onCreateTrip(trip);
        }
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

    return (
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
            <div className={styles.days}>
                {generateDays().map((date, index) => {
                    const dateTrips = getTripsForDate(date);
                    const isInSelectedTrip = isDayInSelectedTrip(date);

                    return (
                        <div
                            key={index}
                            className={`
                                ${styles.day}
                                ${isToday(date) ? styles.today : ''}
                                ${isSelected(date) ? styles.selected : ''}
                                ${
                                    !isCurrentMonth(date)
                                        ? styles.otherMonth
                                        : ''
                                }
                                ${isInSelectedTrip ? styles.inSelectedTrip : ''}
                            `}
                            onMouseDown={(e) => handleMouseDown(date, e)}
                            onMouseEnter={() => handleMouseEnter(date)}
                            onMouseUp={handleMouseUp}
                        >
                            <span className={styles.dayNumber}>
                                {date.getDate()}
                            </span>

                            {/* Trip indicators */}
                            {dateTrips.length > 0 && (
                                <div className={styles.tripIndicators}>
                                    {dateTrips.map((trip) => {
                                        const isSelected =
                                            trip.id === selectedTripId;
                                        return (
                                            <div
                                                key={trip.id}
                                                className={`${styles.tripDot} ${
                                                    isSelected
                                                        ? styles.selectedTripDot
                                                        : ''
                                                }`}
                                                style={{
                                                    backgroundColor: trip.color,
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
                                                (t) => t.id === selectedTripId
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
    );
};

export default CalendarView;
