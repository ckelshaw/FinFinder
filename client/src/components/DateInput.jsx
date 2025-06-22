import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function DateInput({ onChange }){ //passing in the parents handleChange method
    const [selectedDate, setSelectedDate] = useState(null);

    const handleChange = (date) => {
        setSelectedDate(date);
        onChange(date) //passing the date back up to the parent
    };

    return (
        <DatePicker
            selected={selectedDate}
            onChange={handleChange}
            className="form-control"
            placeholderText='Select a Date'
        />
    );
}

export default DateInput;
