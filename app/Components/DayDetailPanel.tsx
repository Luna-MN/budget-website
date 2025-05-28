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
    dayName?: string;
    onDayNameChange: (name: string) => void;
    onDailyBudgetChange: (budget: number) => void; // Add this
    currency?: string; // Add this
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
    dayName = '',
    onDayNameChange,
    onDailyBudgetChange,
    currency = '$', // Make sure this has a default
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

    // Add state for day name editing
    const [isEditingName, setIsEditingName] = useState(false);
    const [nameInput, setNameInput] = useState(dayName);

    // Add this to handle name changes
    useEffect(() => {
        setNameInput(dayName);
    }, [dayName]);

    // Handle saving the day name
    const handleSaveName = () => {
        onDayNameChange(nameInput);
        setIsEditingName(false);
    };

    // Add these state variables at the top with your other state declarations
    const [isEditingBudget, setIsEditingBudget] = useState(false);
    const [budgetInput, setBudgetInput] = useState(dailyBudget.toString());

    // Add this effect to update budgetInput when dailyBudget changes
    useEffect(() => {
        setBudgetInput(dailyBudget.toString());
    }, [dailyBudget]);

    // Add this handler function
    const handleSaveBudget = () => {
        // You'll need to add an onDailyBudgetChange prop to your component
        const newBudget = parseFloat(budgetInput);
        if (!isNaN(newBudget) && newBudget >= 0) {
            onDailyBudgetChange(newBudget); // Update the daily budget
            setIsEditingBudget(false);
        }
    };

    return (
        <div className={styles.panel}>
            <div
                className={styles.header}
                style={{ backgroundColor: tripColor + '33' }}
            >
                <h2>{tripName}</h2>
                <div className={styles.date}>{formattedDate}</div>

                {/* Add day name editing UI */}
                <div className={styles.dayNameContainer}>
                    {isEditingName ? (
                        <div className={styles.nameEditForm}>
                            <input
                                type="text"
                                value={nameInput}
                                onChange={(e) => setNameInput(e.target.value)}
                                placeholder="Day name..."
                                autoFocus
                                className={styles.nameInput}
                            />
                            <button
                                onClick={handleSaveName}
                                className={styles.saveNameBtn}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div
                            className={styles.dayName}
                            onClick={() => setIsEditingName(true)}
                        >
                            {dayName ? (
                                <>
                                    {dayName}
                                    <span className={styles.editIcon}>✎</span>
                                </>
                            ) : (
                                <span className={styles.addDayName}>
                                    + Add day name
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
            </div>

            <div className={styles.budget}>
                <div className={styles.budgetHeader}>
                    <h3>Daily Budget</h3>
                    {isEditingBudget ? (
                        <div className={styles.budgetEditForm}>
                            <div className={styles.priceInput}>
                                <span>{currency}</span>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={budgetInput}
                                    onChange={(e) =>
                                        setBudgetInput(e.target.value)
                                    }
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter')
                                            handleSaveBudget();
                                    }}
                                />
                            </div>
                            <button
                                className={styles.saveButton}
                                onClick={handleSaveBudget}
                            >
                                Save
                            </button>
                        </div>
                    ) : (
                        <div
                            className={styles.budgetAmount}
                            onClick={() => setIsEditingBudget(true)}
                        >
                            {currency}
                            {dailyBudget.toFixed(2)}
                            <span className={styles.editIcon}>✎</span>
                        </div>
                    )}
                </div>
                <div className={styles.budgetStats}>
                    <div className={styles.stat}>
                        <span>Spent:</span>
                        <span>
                            {currency}
                            {totalSpent.toFixed(2)}
                        </span>
                    </div>
                    <div className={styles.stat}>
                        <span>Remaining:</span>
                        <span className={remaining < 0 ? styles.negative : ''}>
                            {currency}
                            {remaining.toFixed(2)}
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
                            backgroundColor: tripColor,
                        }}
                    ></div>
                </div>
            </div>

            <div className={styles.addActivity}>
                <h3>Add Activity</h3>
                <div className={styles.activityForm}>
                    <input
                        type="time"
                        value={newActivity.time || '12:00'}
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
                        value={newActivity.description || ''}
                        onChange={(e) =>
                            setNewActivity({
                                ...newActivity,
                                description: e.target.value,
                            })
                        }
                    />
                    <div className={styles.priceInput}>
                        <span>{currency}</span>
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
                    <button
                        onClick={handleAddActivity}
                        disabled={!newActivity.description}
                    >
                        Add
                    </button>
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
                                    {currency}
                                    {activity.price.toFixed(2)}
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
