'use client';

import { useState } from 'react';
import CalendarView from './Components/CalendarView';
import TripsList from './Components/TripsList';
import styles from './page.module.css';

// Trip interface
interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
}

export default function Home() {
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [trips, setTrips] = useState<Trip[]>([]);
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    const handleDatesSelected = (dates: Date[]) => {
        setSelectedDates(dates);
    };

    const handleCreateTrip = (trip: Trip) => {
        setTrips([...trips, trip]);
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
                />
            </div>
        </div>
    );
}
