const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function timeToSeconds(timeStr) {
    let [time, period] = timeStr.trim().split(" ");
    let [h, m, s] = time.split(":").map(Number);

    if (period === "pm" && h !== 12) h += 12;
    if (period === "am" && h === 12) h = 0;

    return h*3600 + m*60 + s;
}
function secondsToTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
function getShiftDuration(startTime, endTime) {
    // TODO: Implement this function
    const startSeconds = timeToSeconds(startTime);
    const endSeconds = timeToSeconds(endTime);
    const durationSeconds = endSeconds - startSeconds;
    return secondsToTime(durationSeconds);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    // TODO: Implement this function
    let start = timeToSeconds(startTime);
    let end = timeToSeconds(endTime);
    let idle = 0;

    let deliverystart = timeToSeconds("8:00:00 am");
    let deliveryend = timeToSeconds("10:00:00 pm");
    if(start<deliverystart){
        idle += deliverystart - start;
    }
    if(end>deliveryend){
        idle += end-deliveryend;
    }
    return secondsToTime(idle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    // TODO: Implement this function
    let active = timeToSeconds(shiftDuration) - timeToSeconds(idleTime);
    return secondsToTime(active);
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    // TODO: Implement this function
    let [y,m,d] = date.split("-").map(Number);

    let active = activeTime.split(":").reduce((a,b,i)=>a + b*[3600,60,1][i],0);

    let quota;

    if(m === 4 && d >= 10 && d <= 30){
        quota = 6*3600;
    }else{
        quota = 8*3600 + 24*60;
    }

    return active >= quota;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    // TODO: Implement this function

     let data = fs.readFileSync(textFile,"utf8").trim();
    let rows = data.split("\n");

    for(let row of rows){
        let col = row.split(",");
        if(col[0] === shiftObj.driverID && col[2] === shiftObj.date){
            return {};
        }
    }

    let duration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idle = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let active = getActiveTime(duration, idle);
    let quota = metQuota(shiftObj.date, active);
    
    let newRecord = [
        shiftObj.driverID,
        shiftObj.driverName,
        shiftObj.date,
        shiftObj.startTime,
        shiftObj.endTime,
        duration,
        idle,
        active,
        quota,
        false
        ].join(",");

        fs.writeFileSync(textFile, data + "\n" + newRecord);
        
    return {
        ...shiftObj,
        duration,
        idle,
        active,
        metQuota: quota,
        hasBonus: false
    };
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    // TODO: Implement this function

    let data = fs.readFileSync(textFile,"utf8").trim();
    let rows = data.split("\n");

    for(let i=0; i<rows.length; i++){
        let col = rows[i].split(",");
        if(col[0] === driverID && col[2] === date){
            col[9] = newValue.toString();
            rows[i] = col.join(",");
            break;
        }
    }
    fs.writeFileSync(textFile, rows.join("\n"));x
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    // TODO: Implement this function

    const fs = require("fs");
    let data = fs.readFileSync(textFile,"utf8").trim().split("\n");

    let count = 0;
    let found = false;

    for(let i=1;i<data.length;i++){

    let cols = data[i].split(",");

    if(cols[0] === driverID){

        found = true;

        let m = parseInt(cols[2].split("-")[1]);

        if(m === parseInt(month) && cols[9] === "true")
            count++;

    }

}

if(!found) return -1;
return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    // TODO: Implement this function
    const fs = require("fs");

let rows = fs.readFileSync(textFile,"utf8").trim().split("\n");

let total = 0;

for(let i=1;i<rows.length;i++){

    let cols = rows[i].split(",");

    if(cols[0] === driverID){

        let m = parseInt(cols[2].split("-")[1]);

        if(m === month)
            total += timeToSeconds(cols[7]);

    }

}

return secondsToTime(total);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    // TODO: Implement this function
    const fs = require("fs");

let shifts = fs.readFileSync(textFile,"utf8").trim().split("\n");
let rates = fs.readFileSync(rateFile,"utf8").trim().split("\n");

let dayOff;

for(let i=1;i<rates.length;i++){

    let cols = rates[i].split(",");

    if(cols[0] === driverID)
        dayOff = cols[1];

}

let required = 0;

for(let i=1;i<shifts.length;i++){

    let cols = shifts[i].split(",");

    if(cols[0] === driverID){

        let date = cols[2];
        let m = parseInt(date.split("-")[1]);

        if(m === month){

            let d = new Date(date).toLocaleString('en-US',{weekday:'long'});

            if(d !== dayOff){

                let day = parseInt(date.split("-")[2]);

                if(month === 4 && day >= 10 && day <= 30)
                    required += timeToSeconds("6:00:00");
                else
                    required += timeToSeconds("8:24:00");

            }

        }

    }

}

required -= bonusCount * 2 * 3600;

return secondsToTime(required);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    // TODO: Implement this function
const fs = require("fs");

let rows = fs.readFileSync(rateFile,"utf8").trim().split("\n");

let basePay;
let tier;

for(let row of rows){

    let cols = row.split(",");

    if(cols[0].trim() === driverID){
        basePay = parseInt(cols[2]);
        tier = parseInt(cols[3]);
        break;
    }
}


function toHours(time){
    let [h,m,s] = time.split(":").map(Number);
    return h + m/60 + s/3600;
}

let actual = toHours(actualHours);
let required = toHours(requiredHours);


if(actual >= required) return basePay;

let missing = required - actual;

let allowed = {1:50,2:20,3:10,4:3};

missing -= allowed[tier];


if(missing <= 0) return basePay;


let billableHours = Math.floor(missing);

let deductionRate = Math.floor(basePay/185);

return basePay - billableHours * deductionRate;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
