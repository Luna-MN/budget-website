export interface TripDay {
    date: Date;
    activities: Activity[];
    dailyBudget: number;
    name?: string;
}

export interface Trip {
    id: string;
    name: string;
    color: string;
    dates: Date[];
    dailyBudget?: number;
    currency?: string;
    days?: TripDay[];
}

export interface Activity {
    id: string;
    time: string;
    description: string;
    price: number;
}
