import React from 'react';
import styles from './CalendarView.module.css';

interface ContextMenuProps {
    show: boolean;
    x: number;
    y: number;
    onCreateTrip: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    show,
    x,
    y,
    onCreateTrip,
}) => {
    if (!show) return null;

    return (
        <div className={styles.contextMenu} style={{ top: y, left: x }}>
            <div className={styles.menuItem} onClick={onCreateTrip}>
                Create new trip
            </div>
        </div>
    );
};

export default ContextMenu;
