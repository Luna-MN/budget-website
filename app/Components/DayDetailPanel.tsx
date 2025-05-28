import React, { useState, useEffect } from 'react';
import styles from './DayDetailPanel.module.css';

interface Activity {
    id: string;
    time: string;
    description: string;
    price: number;
}

interface DayDetailPanelProps {
    date: Date;
    tripId: string;
    tripName: string;
    tripColor: string;
    dailyBudget: number;
    onClose: () => void;
    onActivityAdd: (activity: Activity) => void;
    onActivityDelete: (activityId: string) => void;
    activities?: Activity[];
}

const DayDetailPanel: React.FC<DayDetailPanelProps> = ({
    date,
    tripId,
    tripName,
    tripColor,
    dailyBudget,
    onClose,
    onActivityAdd,
    onActivityDelete,
    activities = [],
}) => {
    const [newActivity, setNewActivity] = useState<Partial<Activity>>({
        time: '12:00',
        description: '',
        price: 0,
    });
    const [totalSpent, setTotalSpent] = useState(0);
    const [remaining, setRemaining] = useState(dailyBudget);

    // Sort activities by time
    const sortedActivities = [...activities].sort((a, b) => {
        return a.time.localeCompare(b.time);
    });

    // Calculate budget statistics
    useEffect(() => {
        const total = activities.reduce(
            (sum, activity) => sum + activity.price,
            0
        );
        setTotalSpent(total);
        setRemaining(dailyBudget - total);
    }, [activities, dailyBudget]);

    // Format the date
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(date);

    const handleAddActivity = () => {
        if (!newActivity.description) return;

        onActivityAdd({
            id: Date.now().toString(),
            time: newActivity.time || '12:00',
            description: newActivity.description || '',
            price: newActivity.price || 0,
        });

        // Reset form
        setNewActivity({
            time: '12:00',
            description: '',
            price: 0,
        });
    };

    return (
        <div className={styles.panel}>
            <div
                className={styles.header}
                style={{ backgroundColor: tripColor + '33' }}
            >
                <h2>{tripName}</h2>
                <div className={styles.date}>{formattedDate}</div>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
            </div>

            <div className={styles.budget}>
                <div className={styles.budgetHeader}>
                    <h3>Daily Budget</h3>
                    <div className={styles.budgetAmount}>
                        ${dailyBudget.toFixed(2)}
                    </div>
                </div>
                <div className={styles.budgetStats}>
                    <div className={styles.stat}>
                        <span>Spent:</span>
                        <span>${totalSpent.toFixed(2)}</span>
                    </div>
                    <div className={styles.stat}>
                        <span>Remaining:</span>
                        <span className={remaining < 0 ? styles.negative : ''}>
                            ${remaining.toFixed(2)}
                        </span>
                    </div>
                </div>
                <div className={styles.budgetBar}>
                    <div
                        className={styles.budgetProgress}
                        style={{
                            width: `${Math.min(
                                100,
                                (totalSpent / dailyBudget) * 100
                            )}%`,
                            backgroundColor:
                                remaining < 0 ? '#ff6b6b' : tripColor,
                        }}
                    />
                </div>
            </div>

            <div className={styles.addActivity}>
                <h3>Add Activity</h3>
                <div className={styles.activityForm}>
                    <input
                        type="time"
                        value={newActivity.time}
                        onChange={(e) =>
                            setNewActivity({
                                ...newActivity,
                                time: e.target.value,
                            })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Activity description"
                        value={newActivity.description}
                        onChange={(e) =>
                            setNewActivity({
                                ...newActivity,
                                description: e.target.value,
                            })
                        }
                    />
                    <div className={styles.priceInput}>
                        <span>$</span>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0.00"
                            value={newActivity.price || ''}
                            onChange={(e) =>
                                setNewActivity({
                                    ...newActivity,
                                    price: parseFloat(e.target.value) || 0,
                                })
                            }
                        />
                    </div>
                    <button onClick={handleAddActivity}>Add</button>
                </div>
            </div>

            <div className={styles.activities}>
                <h3>Day Schedule</h3>
                {sortedActivities.length === 0 ? (
                    <div className={styles.emptyState}>
                        No activities planned yet
                    </div>
                ) : (
                    <div className={styles.activityList}>
                        {sortedActivities.map((activity) => (
                            <div
                                key={activity.id}
                                className={styles.activityItem}
                            >
                                <div className={styles.activityTime}>
                                    {activity.time}
                                </div>
                                <div className={styles.activityDescription}>
                                    {activity.description}
                                </div>
                                <div className={styles.activityPrice}>
                                    ${activity.price.toFixed(2)}
                                </div>
                                <button
                                    className={styles.deleteButton}
                                    onClick={() =>
                                        onActivityDelete(activity.id)
                                    }
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DayDetailPanel;
