/**
 * 
 * @param {Date} date Date object
 * @returns Time in am/pm instead of 24hr
 */
function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
}

function AMPMtoMinutes(time) {
    const [t, ap] = time.split(' ');
    const [h, m] = t.split(':');
    const delta = ap == 'AM' ? 0 : 12;

    let minutes = ((+h + +delta) * 60) + +m;
    return minutes;
}

function minutesToAMPM(minutes) {
    let h = Math.floor(minutes / 60);
    let m = minutes % 60;
    let ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    m = m < 10 ? '0' + m : m;
    var strTime = h + ':' + m + ' ' + ap;
    return strTime;
}

function convertDayToDate(dayInput) {
    try {
        // dayInput is a string in the format of '07/19/2022, 5:30 PM'
        // output must be a Date object
        const [date, time] = dayInput.split(', ');
        const [month, day, year] = date.split('/');
        const [_time, ampm] = time.split(' ');
        const [hour, minute] = _time.split(':');
        const delta = ampm.toUpperCase() == 'AM' ? 0 : 12;
        const hours = (+hour + +delta);
        const minutes = +minute;
        const seconds = 0;
        const milliseconds = 0;
        return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds);
    } catch (e) {
        console.log(e);
        console.log(dayInput);
        alert('Your date input is invalid, it must be in the format of: "mm/dd/yyyy, hh:mm AM/PM"');
    }
}

/**
 * 
 * @param {Date} date 
 * @returns {string} Date in the format of '07/19/2022, 5:30 PM'
 */
function convertDateToDay(date) {
    // date is a Date object
    // output must be a string in the format of '07/19/2022, 5:30 PM'
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    const strTime = hours + ':' + minutes + ' ' + ampm;
    return `${month}/${day}/${year}, ${strTime}`;
}

function convertDayNoTimeToDate(dayInput) {
    try {
        // dayInput is a string in the format of '07/19/2022'
        // output must be a Date object
        const [month, day, year] = dayInput.split('/');
        return new Date(year, month - 1, day);
    } catch (e) {
        console.log(e);
        console.log(dayInput);
        alert('Your date input is invalid, it must be in the format of: "mm/dd/yyyy"');
    }
}



class WeekSet {
    constructor(element, onclick) {
        this.id = element.id;
        this.week = element;
        this.days = element.querySelectorAll('.week-day');
        this.type = element.dataset.btnGroupType;
        this.selectedDays = [];
        this.selectedIndexes = [];
        this.selectedDay = null;
        this.selectedIndex = null;

        if (this.type == 'toggle') {
            this.setToggleWeekdays();
        } else {
            this.setMultiSelectWeekdays();
        }

        if (onclick) {
            this.days.forEach(wd => {
                wd.addEventListener('click', onclick);
            });
        }
    }

    setToggleWeekdays() {
        this.days.forEach(wd => {
            wd.addEventListener('click', () => {
                let isSelected = wd.classList.contains('selected');
                this.week.querySelectorAll('.week-day').forEach(wd => {
                    wd.classList.remove('selected');
                });
                if (isSelected) {
                    this.week.dataset.day = null;
                    this.week.dataset.index = null;
                    this.selectedDay = null;
                    this.selectedIndex = null;
                } else {
                    wd.classList.add('selected');

                    this.week.dataset.day = wd.dataset.weekDay;
                    this.week.dataset.index = wd.dataset.weekIndex;
                    this.selectedDay = wd.dataset.weekDay;
                    this.selectedIndex = wd.dataset.weekIndex;

                    console.log(this.selectedDay);
                    console.log(this.selectedIndex);
                }
            });
        });
        // this.selectIndex(0);
    }

    setMultiSelectWeekdays() {
        this.days.forEach(wd => {
            wd.addEventListener('click', () => {
                if (wd.dataset.weekDay == 'all') {
                    let time = 0;
                    if (this.week.dataset.allSelected == 'true') {
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            setTimeout(() => {
                                el.classList.remove('selected');
                            }, time);
                            time += 30;
                        });
                        this.week.dataset.allSelected = false;
                        this.allSelected = false;
                        this.selectedDays = [];
                    } else {
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            setTimeout(() => {
                                el.classList.add('selected');
                            }, time);
                            time += 30;
                        });
                        this.week.dataset.allSelected = true;
                        this.allSelected = true;
                        this.selectedDays = week.map(d => d.toLowerCase());
                        this.selectedIndexes = week.map((d, i) => i);
                    }
                } else {
                    if (wd.classList.contains('selected')) {
                        this.week.dataset.allSelected = false;
                        this.allSelected = false;
                        this.week.querySelector('.week-day[data-week-day="all"]').classList.remove('selected');
                        wd.classList.remove('selected');
                        this.selectedDays.splice(this.selectedDays.indexOf(wd.dataset.weekDay), 1);
                        this.selectedIndexes.splice(this.selectedIndexes.indexOf(wd.dataset.weekIndex), 1);
                    } else {
                        let test = true;
                        this.week.querySelectorAll('.week-day').forEach(el => {
                            if (el.dataset.weekDay == 'all') return;
                            if (el.dataset.weekDay == wd.dataset.weekDay) return;
                            if (!el.classList.contains('selected')) test = false;
                        });
                        if (test) {
                            this.week.dataset.allSelected = true;
                            this.allSelected = true;
                            this.selectedDays = week.map(d => d.toLowerCase());
                            this.selectedIndexes = week.map((d, i) => i);
                            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
                        } else this.week.querySelector('.week-day[data-week-day="all"]').classList.remove('selected');
                        wd.classList.add('selected');
                    }
                }
                this.selectedDays.sort();
                this.selectedIndexes.sort();
            });
        });
    }

    // Select day from text input
    selectDay(day) {
        let index = week.find(d => d.toLowerCase() == day.toLowerCase());


        this.days.forEach(el => {
            if (el.dataset.weekIndex == index) el.classList.add('selected');
            else el.classList.remove('selected');
        });

        this.selectedDay = week[index].toLowerCase();
        this.selectedIndex = index;

        this.week.dataset.day = this.selectedDay;
        this.week.dataset.index = this.selectedIndex;

        this.selectedDays.push(this.selectedDay);
        this.selectedIndexes.push(this.selectedIndex);

        this.selectedDays.sort();
        this.selectedIndexes.sort();

        this.filterUnique();

        if (this.selectedDays.length == 7) {
            this.week.dataset.allSelected = true;
            this.allSelected = true;
            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
        }
    }

    // Select index from text input
    selectIndex(index) {
        this.days.forEach(el => {
            if (el.dataset.weekIndex == index) el.classList.add('selected');
            else el.classList.remove('selected');
        });

        this.selectedDay = week[index].toLowerCase();
        this.selectedIndex = index;

        this.week.dataset.day = this.selectedDay;
        this.week.dataset.index = this.selectedIndex;

        this.selectedDays.push(this.selectedDay);
        this.selectedIndexes.push(this.selectedIndex);

        this.selectedDays.sort();
        this.selectedIndexes.sort();

        this.filterUnique();

        if (this.selectedDays.length == 7) {
            this.week.dataset.allSelected = true;
            this.allSelected = true;
            this.week.querySelector('.week-day[data-week-day="all"]').classList.add('selected');
        }
    }

    filterUnique() {
        this.selectedDays = this.selectedDays.filter((item, pos) => {
            return this.selectedDays.indexOf(item) == pos;
        });
        this.selectedIndexes = this.selectedIndexes.filter((item, pos) => {
            return this.selectedIndexes.indexOf(item) == pos;
        });
    }

    addClickListener(cb) {
        this.days.forEach(el => {
            el.addEventListener('click', cb);
        });
    }

    get getSelectedIndex() {
        let i = 0;

        document.querySelectorAll(`#${this.id} .week-day`).forEach((el, index) => {
            if (el.classList.contains('selected')) i = index;
        });

        return i;
    }

    get getSelectedDay() {
        return week[this.selectedDay];
    }

    get getSelectedIndexes() {
        let days = [];

        document.querySelectorAll(`#${this.id} .week-day`).forEach((el, index) => {
            if (el.classList.contains('selected')) days.push(index);
        });

        return days;
    }

    get getSelectedDays() {
        return this.getSelectedIndexes.map(i => week[i]);
    }
}