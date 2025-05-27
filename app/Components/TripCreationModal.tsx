import React, { useRef, useEffect } from 'react';
import styles from './CalendarView.module.css';

interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
}

interface TripCreationModalProps {
    show: boolean;
    onClose: () => void;
    onCreateTrip: (trip: Trip) => void;
    selectedDates: Date[];
    initialColor?: string;
}

const TripCreationModal: React.FC<TripCreationModalProps> = ({
    show,
    onClose,
    onCreateTrip,
    selectedDates,
    initialColor = '#1890ff',
}) => {
    const [newTrip, setNewTrip] = React.useState<{
        name: string;
        color: string;
    }>({
        name: '',
        color: initialColor,
    });

    const modalRef = useRef<HTMLDivElement>(null);

    const handleSubmitTrip = (e: React.FormEvent) => {
        e.preventDefault();

        if (newTrip.name.trim() && selectedDates.length > 0) {
            const trip: Trip = {
                id: `trip-${Date.now()}`,
                name: newTrip.name,
                color: newTrip.color,
                dates: [...selectedDates],
            };

            onCreateTrip(trip);

            // Reset form
            setNewTrip({
                name: '',
                color: initialColor,
            });

            onClose();
        }
    };

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                modalRef.current &&
                !modalRef.current.contains(e.target as Node)
            ) {
                onClose();
            }
        };

        if (show) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modal} ref={modalRef}>
                <h3>Create New Trip</h3>

                <form onSubmit={handleSubmitTrip}>
                    <div className={styles.formGroup}>
                        <label htmlFor="tripName">Trip Name</label>
                        <input
                            id="tripName"
                            type="text"
                            value={newTrip.name}
                            onChange={(e) =>
                                setNewTrip({
                                    ...newTrip,
                                    name: e.target.value,
                                })
                            }
                            placeholder="Enter trip name"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="tripColor">Trip Color</label>
                        <input
                            id="tripColor"
                            type="color"
                            value={newTrip.color}
                            onChange={(e) =>
                                setNewTrip({
                                    ...newTrip,
                                    color: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div className={styles.tripDates}>
                        <p>Trip Dates: {selectedDates.length} day(s)</p>
                        <p className={styles.dateRange}>
                            {selectedDates.length > 0 && (
                                <>
                                    {new Date(
                                        Math.min(
                                            ...selectedDates.map((d) =>
                                                d.getTime()
                                            )
                                        )
                                    ).toLocaleDateString()}
                                    {' - '}
                                    {new Date(
                                        Math.max(
                                            ...selectedDates.map((d) =>
                                                d.getTime()
                                            )
                                        )
                                    ).toLocaleDateString()}
                                </>
                            )}
                        </p>
                    </div>

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button type="submit" className={styles.createButton}>
                            Create Trip
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TripCreationModal;
