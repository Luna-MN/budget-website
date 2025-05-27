import React from 'react';
import styles from './TripsList.module.css';

// Trip interface
interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
}

interface TripsListProps {
    trips: Trip[];
    selectedTripId: string | null;
    onTripSelect: (tripId: string) => void;
}

const TripsList: React.FC<TripsListProps> = ({
    trips,
    selectedTripId,
    onTripSelect,
}) => {
    if (trips.length === 0) {
        return null;
    }

    return (
        <div className={styles.tripsContainer}>
            <h2>Your Trips</h2>
            <div className={styles.tripsList}>
                {trips.map((trip) => (
                    <button
                        key={trip.id}
                        className={`${styles.tripButton} ${
                            selectedTripId === trip.id
                                ? styles.tripButtonSelected
                                : ''
                        }`}
                        style={{
                            backgroundColor: `${trip.color}20`, // Use transparent version of trip color
                            borderColor: trip.color,
                            color: trip.color,
                        }}
                        onClick={() => onTripSelect(trip.id)}
                    >
                        <div
                            className={styles.tripColorDot}
                            style={{ backgroundColor: trip.color }}
                        ></div>
                        <span>{trip.name}</span>
                        <span className={styles.tripDays}>
                            {trip.dates.length} days
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default TripsList;
