import { CRON_LOCALE } from './jquery.cron.locale';

interface Schedule {
    h: number[];
    m: number[];
    s: number[];
    D: number[];
    M: number[];
    Y: number[];
    d?: number[];
    dc?: number[];
}

interface Schedules {
    schedules: Partial<Schedule>[];
    exceptions: Partial<Schedule>[];
}

/**
 * Given a cronSpec, return the human-readable string.
 */
function cronToText(cronSpec: string, withSeconds: boolean, locale: CRON_LOCALE): string {
    // Constant array to convert valid names to values
    const NAMES = {
        JAN: 1,
        FEB: 2,
        MAR: 3,
        APR: 4,
        MAY: 5,
        JUN: 6,
        JUL: 7,
        AUG: 8,
        SEP: 9,
        OCT: 10,
        NOV: 11,
        DEC: 12,
        SUN: 1,
        MON: 2,
        TUE: 3,
        WED: 4,
        THU: 5,
        FRI: 6,
        SAT: 7,
    };

    // Parsable replacements for common expressions
    const REPLACEMENTS = {
        '* * * * * *': '0/1 * * * * *',
        '@YEARLY': '0 0 1 1 *',
        '@ANNUALLY': '0 0 1 1 *',
        '@MONTHLY': '0 0 1 * *',
        '@WEEKLY': '0 0 * * 0',
        '@DAILY': '0 0 * * *',
        '@HOURLY': '0 * * * *',
    };

    // Contains the index, min, and max for each of the constraints
    const FIELDS = {
        s: [0, 0, 59], // seconds
        m: [1, 0, 59], // minutes
        h: [2, 0, 23], // hours
        D: [3, 1, 31], // day of month
        M: [4, 1, 12], // month
        Y: [6, 1970, 2099], // year
        d: [5, 1, 7, 1], // day of the week
    };

    /**
     * Returns the value + offset if value is a number, otherwise it
     * attempts to look up the value in the NAMES table and returns
     * that result instead.
     */
    function getValue(
        /** the value that should be parsed */
        value: number | string,
        /** Any offset that must be added to the value */
        offset: number = 0,
        max: number = 9999,
    ): number | null {
        return Number.isNaN(value) ? (NAMES as Record<string, number>)[value] || null : Math.min(+value + offset, max);
    }

    /**
     * Returns a deep clone of a schedule skipping any day of week
     * constraints.
     */
    function cloneSchedule(
        /** The schedule that will be cloned */
        sched: Partial<Schedule>,
    ): Partial<Schedule> {
        const clone: Partial<Schedule> = {};
        let field;

        for (field in sched) {
            if (field !== 'dc' && field !== 'd') {
                (clone as Record<string, number[]>)[field] = (sched as unknown as Record<string, number[]>)[field].slice(0);
            }
        }

        return clone as Schedule;
    }

    /**
     * Adds values to the specified constraint in the current schedule.
     */
    function add(
        /** The schedule to add the constraint to */
        sched: Partial<Schedule>,
        /** The name of the constraint to add */
        name: string,
        /** The minimum value for this constraint */
        min: number,
        /** The maximum value for this constraint */
        max: number,
        /** The increment value for this constraint */
        inc: number = 0,
    ) {
        let i = min;

        if (!(sched as unknown as Record<string, number[]>)[name]) {
            (sched as unknown as Record<string, number[]>)[name] = [];
        }

        while (i <= max) {
            if ((sched as unknown as Record<string, number[]>)[name].indexOf(i) < 0) {
                (sched as unknown as Record<string, number[]>)[name].push(i);
            }
            i += inc || 1;
        }

        (sched as unknown as Record<string, number[]>)[name].sort((a, b) => a - b);
    }

    /**
     * Adds a hash item (of the form x#y or xL) to the schedule.
     */
    function addHash(
        /** The current set of schedules */
        schedules: Partial<Schedule>[],
        /** The current schedule to add to */
        curSched: Partial<Schedule>,
        /** The value to add (x of x#y or xL) */
        value: number,
        /** The hash value to add (y of x#y) */
        hash: number,
    ) {
        // if there are any existing days of week constraints that
        // aren't equal to the one we're adding, create a new
        // composite schedule
        if ((curSched.d && !curSched.dc) || (curSched.dc && !curSched.dc.includes(hash))) {
            schedules.push(cloneSchedule(curSched));
            curSched = schedules[schedules.length - 1];
        }

        add(curSched, 'd', value, value);
        add(curSched, 'dc', hash, hash);
    }

    function addWeekday(
        /** The existing set of schedules */
        s: Schedules,
        /** The current schedule to add to */
        curSched: Partial<Schedule>,
        value: number,
    ) {
        const except1: Partial<Schedule> = {};
        const except2: Partial<Schedule> = {};
        if (value === 1) {
            // cron doesn't pass month boundaries, so if 1st is a
            // weekend then we need to use 2nd or 3rd instead
            add(curSched, 'D', 1, 3);
            add(curSched, 'd', NAMES.MON, NAMES.FRI);
            add(except1, 'D', 2, 2);
            add(except1, 'd', NAMES.TUE, NAMES.FRI);
            add(except2, 'D', 3, 3);
            add(except2, 'd', NAMES.TUE, NAMES.FRI);
        } else {
            // normally you want the closest day, so if v is a
            // Saturday, use the previous Friday.  If it's a
            // sunday, use the following Monday.
            add(curSched, 'D', value - 1, value + 1);
            add(curSched, 'd', NAMES.MON, NAMES.FRI);
            add(except1, 'D', value - 1, value - 1);
            add(except1, 'd', NAMES.MON, NAMES.THU);
            add(except2, 'D', value + 1, value + 1);
            add(except2, 'd', NAMES.TUE, NAMES.FRI);
        }
        s.exceptions.push(except1);
        s.exceptions.push(except2);
    }

    /**
     * Adds a range item (of the form x-y/z) to the schedule.
     */
    function addRange(
        /** The cron expression item to add */
        item: string,
        /** The current schedule to add to */
        curSched: Partial<Schedule>,
        /** The name to use for this constraint */
        name: string,
        /** The min value for the constraint */
        min: number,
        /** The max value for the constraint */
        max: number,
        /** The offset to apply to the cron value */
        offset: number,
    ) {
        // parse range/x
        const incSplit = item.split('/');
        const inc = +incSplit[1];
        const range = incSplit[0];

        // parse x-y or * or 0
        if (range !== '*' && range !== '0') {
            const rangeSplit = range.split('-');
            min = getValue(rangeSplit[0], offset, max) || offset;

            // fix for issue #13, range may be a single digit
            max = getValue(rangeSplit[1], offset, max) || max;
        }

        add(curSched, name, min, max, inc);
    }

    /**
     * Parses a particular item within a cron expression.
     */
    function parse(
        /** The cron expression item to parse */
        item: string,
        /** The existing set of schedules */
        s: Schedules,
        /** The name to use for this constraint */
        name: string,
        /** The min value for the constraint */
        min: number,
        /** The max value for the constraint */
        max: number,
        /** The offset to apply to the cron value */
        offset: number,
    ) {
        let value;
        let split;
        const schedules = s.schedules;
        const curSched = schedules[schedules.length - 1];

        // L just means min - 1 (this also makes it work for any field)
        if (item === 'L') {
            item = (min - 1).toString(10);
        }

        // parse x
        if ((value = getValue(item, offset, max)) !== null) {
            add(curSched, name, value, value);
        } else if ((value = getValue(item.replace('W', ''), offset, max)) !== null) {
            // parse xW
            addWeekday(s, curSched, value);
        } else if ((value = getValue(item.replace('L', ''), offset, max)) !== null) {
            // parse xL
            addHash(schedules, curSched, value, min - 1);
        } else if ((split = item.split('#')).length === 2) {
            // parse x#y
            value = getValue(split[0], offset, max) || offset;
            addHash(schedules, curSched, value, getValue(split[1]) || 0);
        } else {
            // parse x-y or x-y/z or */z or 0/z
            addRange(item, curSched, name, min, max, offset);
        }
    }

    /**
     * Returns true if the item is either of the form x#y or xL.
     */
    function isHash(
        /** The expression item to check */
        item: string,
    ): boolean {
        return item.includes('#') || item.indexOf('L') > 0;
    }

    function itemSorter(a: string, b: string): number {
        return isHash(a) && !isHash(b) ? 1 : (a > b ? 1 : (a < b ? -1 : 0));
    }

    /**
     * Parses each of the fields in a cron expression.  The expression must
     * include the second's field, the year field is optional.
     *
     */
    function parseExpr(
        /** The cron expression to parse */
        expr: string,
    ) {
        const schedule: Schedules = { schedules: [{}], exceptions: [] };
        const components = expr.replace(/(\s)+/g, ' ').split(' ');
        let field;
        let f;
        let component;
        let items;

        for (field in FIELDS) {
            f = (FIELDS as Record<string, number[]>)[field];
            component = components[f[0]];
            if (component && component !== '*' && component !== '?') {
                // need to sort so that any #'s come last, otherwise
                // schedule clones to handle # won't contain all of the
                // other constraints
                items = component.split(',').sort(itemSorter);
                let i;
                const length = items.length;
                for (i = 0; i < length; i++) {
                    parse(items[i], schedule, field, f[1], f[2], f[3]);
                }
            }
        }

        return schedule;
    }

    /**
     * Make cron expression parsable.
     */
    function prepareExpr(
        /** The cron expression to prepare */
        expr: string,
    ) {
        const prepared = expr.toUpperCase();
        return (REPLACEMENTS as Record<string, string>)[prepared] || prepared;
    }

    function parseCron(expr: string, hasSeconds?: boolean) {
        const e = prepareExpr(expr);
        return parseExpr(hasSeconds ? e : `0 ${e}`);
    }

    const schedule = parseCron(cronSpec, withSeconds);

    function absFloor(number: number): number {
        if (number < 0) {
            return Math.ceil(number);
        }
        return Math.floor(number);
    }

    function toInt(argumentForCoercion: number | string): number {
        const coercedNumber = +argumentForCoercion;
        let value = 0;

        if (coercedNumber !== 0 && isFinite(coercedNumber)) {
            value = absFloor(coercedNumber);
        }

        return value;
    }

    function ordinal(number: number): string {
        const b = number % 10;
        const output = (toInt(number % 100 / 10) === 1) ? locale.ORDINALS.th :
            b === 1 ? locale.ORDINALS.st :
                b === 2 ? locale.ORDINALS.nd :
                    b === 3 ? locale.ORDINALS.rd : locale.ORDINALS.th;
        return number + output;
    }

    /**
     * For an array of numbers, e.g., a list of hours in a schedule,
     * return a string listing out all of the values (complete with
     * "and" plus ordinal text on the last item).
     */
    function numberList(numbers: number[]): string {
        if (numbers.length < 2) {
            return ordinal(numbers[0]);
        }
        const lastVal = numbers.pop() || 0;
        return `${numbers.join(', ')} ${locale.and} ${ordinal(lastVal)}`;
    }

    /**
     * Parse a number into day of week, or a month name;
     * used in dateList below.
     * @param {Number|String} value
     * @param {String} type
     * @returns {String}
     */
    function numberToDateName(value: number, type: 'dow' | 'mon') {
        if (type === 'dow') {
            return locale.DOW[value - 1];
        }
        if (type === 'mon') {
            return locale.MONTH[value - 1];
        }
        return value;
    }

    /**
     * From an array of numbers corresponding to dates (given in type: either
     * days of the week, or months), return a string listing all the values.
     * @param {Number[]} numbers
     * @param {String} type
     * @returns {String}
     */
    function dateList(numbers: number[], type: 'dow' | 'mon') {
        if (numbers.length < 2) {
            return numberToDateName(numbers[0], type);
        }

        const lastVal = numbers.pop() || 0;
        let outputText = '';

        for (let i = 0, value; (value = numbers[i]); i++) {
            if (outputText.length > 0) {
                outputText += ', ';
            }
            outputText += numberToDateName(value, type);
        }
        return `${outputText} ${locale.and} ${numberToDateName(lastVal, type)}`;
    }

    /**
     * Pad to the equivalent of sprintf('%02d').
     * @param {Number} x
     * @returns {string}
     */
    function zeroPad(x: number): string {
        return x < 10 ? `0${x}` : x.toString();
    }

    //----------------

    /**
     * Given a schedule, generate a friendly sentence description.
     */
    function scheduleToSentence(
        _schedule: Partial<Schedule>,
        _withSeconds: boolean,
    ): string {
        let outputText = `${locale.Every} `;

        if (_schedule.h && _schedule.m && _schedule.h.length <= 2 && _schedule.m.length <= 2 && _withSeconds && _schedule.s && _schedule.s.length <= 2) {
            // If there are only one or two specified values for
            // hour or minute, print them in HH:MM:SS format

            const hm = [];
            for (let i = 0; i < _schedule.h.length; i++) {
                for (let j = 0; j < _schedule.m.length; j++) {
                    for (let k = 0; k < _schedule.s.length; k++) {
                        hm.push(`${zeroPad(_schedule.h[i])}:${zeroPad(_schedule.m[j])}:${zeroPad(_schedule.s[k])}`);
                    }
                }
            }
            if (hm.length < 2) {
                outputText = `${locale.At} ${hm[0]}`;
            } else {
                const lastVal = hm.pop();
                outputText = `${locale.At} ${hm.join(', ')} ${locale.and} ${lastVal}`;
            }
            if (!_schedule.d && !_schedule.D) {
                outputText += ` ${locale['every day']} `;
            }
        } else if (_schedule.h && _schedule.m && _schedule.h.length <= 2 && _schedule.m.length <= 2) {
            // If there are only one or two specified values for
            // hour or minute, print them in HH:MM format

            const hm = [];
            for (let i = 0; i < _schedule.h.length; i++) {
                for (let j = 0; j < _schedule.m.length; j++) {
                    hm.push(`${zeroPad(_schedule.h[i])}:${zeroPad(_schedule.m[j])}`);
                }
            }
            if (hm.length < 2) {
                outputText = `${locale.At} ${hm[0]}`;
            } else {
                const lastVal = hm.pop();
                outputText = `${locale.At} ${hm.join(', ')} ${locale.and} ${lastVal}`;
            }

            if (!_schedule.d && !_schedule.D) {
                outputText += ` ${locale['every day']} `;
            }
        } else if (_schedule.h) { // runs only at specific hours
            // Otherwise, list out every specified hour/minute value.
            if (_schedule.m) { // and only at specific minutes
                if (_withSeconds) {
                    if (!_schedule.s || _schedule.s.length === 60) {
                        outputText += `${locale['second of every']} ${numberList(_schedule.m)} ${locale['minute past the']} ${numberList(_schedule.h)} ${locale.hour}`;
                    } else {
                        outputText += `${numberList(_schedule.s)} ${locale['second of every']} ${numberList(_schedule.m)} ${locale['minute past the']} ${numberList(_schedule.h)} ${locale.hour}`;
                    }
                } else {
                    outputText += `${numberList(_schedule.m)} ${locale['minute past the']} ${numberList(_schedule.h)} ${locale.hour}`;
                }
            } else if (_withSeconds) {
                // specific hours, but every minute
                if (!_schedule.s || _schedule.s.length === 60) {
                    outputText += `${locale['second of every']} ${locale['minute of']} ${numberList(_schedule.h)} ${locale.hour}`;
                } else {
                    outputText += `${numberList(_schedule.s)} ${locale['second of every']} ${locale['minute of']} ${numberList(_schedule.h)} ${locale.hour}`;
                }
            } else {
                outputText += `${locale['minute of']} ${numberList(_schedule.h)} ${locale.hour}`;
            }
        } else if (_schedule.m) { // every hour, but specific minutes
            if (_withSeconds) {
                if (!_schedule.s || _schedule.s.length === 60) {
                    outputText += `${locale['second of every']} ${numberList(_schedule.m)} ${locale['minute every hour']}`;
                } else {
                    outputText += `${numberList(_schedule.s)} ${locale['second of every']} ${numberList(_schedule.m)} ${locale['minute every hour']}`;
                }
            } else {
                outputText += `${numberList(_schedule.m)} ${locale['minute every hour']}`;
            }
        } else if (_withSeconds) {
            if (!_schedule.s || _schedule.s.length === 60) {
                outputText += locale.second;
            } else {
                outputText += `${numberList(_schedule.s)} ${locale.second}`;
            }
        } else { // cronSpec has "*" for both hour and minute
            outputText += locale.minute;
        }

        if (_schedule.D) { // runs only on specific day(s) of month
            outputText += (locale['on the'] ? ` ${locale['on the']} ` : ' ') + numberList(_schedule.D);
            if (!_schedule.M) {
                outputText += ` ${locale['of every month']}`;
            }
        }

        if (_schedule.d) { // runs only on specific day(s) of week
            if (_schedule.D) {
                // if both day fields are specified, cron uses both; superuser.com/a/348372
                outputText += ` ${locale['and every']} `;
            } else {
                outputText += ` ${locale.on} `;
            }
            outputText += dateList(_schedule.d, 'dow');
        }

        if (_schedule.M) {
            // runs only in specific months; put this output last
            outputText += ` ${locale.in} ${dateList(_schedule.M, 'mon')}`;
        }

        return outputText;
    }

    return scheduleToSentence(schedule.schedules[0], withSeconds);
}

export default cronToText;
