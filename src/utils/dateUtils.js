const moment = require('moment');

function calculateDuration(startTime, endTime) {
    const start = moment(startTime, 'HH:mm:ss A');
    const end = moment(endTime, 'HH:mm:ss A');
    return end.diff(start, 'minutes');
}

function calculateHoursInBed(startTime, endTime) {
    const start = moment(startTime, 'h:mma');
    const end = moment(endTime, 'h:mma');
    if (end.isBefore(start)) {
        end.add(1, 'day');
    }
    return moment.duration(end.diff(start)).asHours().toFixed(2);
}

module.exports = { calculateDuration, calculateHoursInBed };