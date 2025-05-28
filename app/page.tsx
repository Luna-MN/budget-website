'use client';

import { useState } from 'react';
import CalendarView from './Components/CalendarView';
import TripsList from './Components/TripsList';
import styles from './page.module.css';

// Update interfaces
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
}

interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
    dailyBudget: number;
    days?: TripDay[];
}

export default function Home() {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const handleDatesSelected = (dates: Date[]) => {
        setSelectedDates(dates);
    };

    // Create a trip with a daily budget
    const handleCreateTrip = (trip: Trip) => {
        // Add default daily budget if not provided
        const newTrip = {
            ...trip,
            dailyBudget: trip.dailyBudget || 100, // Default daily budget
            days: [],
        };

        setTrips([...trips, newTrip]);
        setSelectedTripId(newTrip.id);
    };

    // Update a trip day with activities
    const handleUpdateTripDay = (tripId: string, day: TripDay) => {
        setTrips((currentTrips) => {
            return currentTrips.map((trip) => {
                if (trip.id !== tripId) return trip;

                // Find if this day already exists
                const existingDayIndex =
                    trip.days?.findIndex(
                        (d) => d.date.getTime() === day.date.getTime()
                    ) ?? -1;

                const updatedDays = trip.days ? [...trip.days] : [];

                if (existingDayIndex >= 0) {
                    // Update existing day
                    updatedDays[existingDayIndex] = day;
                } else {
                    // Add new day
                    updatedDays.push(day);
                }

                return {
                    ...trip,
                    days: updatedDays,
                };
            });
        });
    };

    const handleTripSelect = (tripId: string) => {
        if (selectedTripId === tripId) {
            // If already selected, deselect it
            setSelectedTripId(null);
        } else {
            // Select the trip
            setSelectedTripId(tripId);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.contentLayout}>
                <TripsList
                    trips={trips}
                    selectedTripId={selectedTripId}
                    onTripSelect={handleTripSelect}
                />

                <CalendarView
                    onDatesSelected={handleDatesSelected}
                    onCreateTrip={handleCreateTrip}
                    trips={trips}
                    selectedTripId={selectedTripId}
                    onUpdateTripDay={handleUpdateTripDay}
                />
            </div>
        </div>
    );
}
