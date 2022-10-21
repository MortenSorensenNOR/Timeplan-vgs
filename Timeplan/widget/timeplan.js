// let scheduleFileName = 'Timeplan.json';
// const fm = FileManager.iCloud();
// const filePath = fm.joinPath(fm.documentsDirectory(), scheduleFileName);
// if (!fm.isFileDownloaded(filePath)) {
//     await fm.fownloadFileFromiCloud(filePath);
// }

// const scheduleJSON = JSON.parse(fm.readString(filePath));

// let fm = FileManager.local()
// const path = fm.joinPath(fm.documentsDirectory(), 'Timeplan.json')
// let scheduleJSON;
// if (fm.fileExists(path)) {
//     scheduleJSON = JSON.parse(fm.readString(etagPath))
// }

function getSchedule() {
    let today = new Date();
    let year = today.getFullYear();
    let startOfYear = new Date(`${year}-01-01`);
    let dt = today.getTime() - startOfYear.getTime();

    //                           ms    s    min  h    w
    let week = Math.floor(dt / (1000 * 60 * 60 * 24 * 7))
    let data = scheduleJSON[week.toString()];
    return data;
}

function compareDates(date1, date2) {
    date1 = date1.split('-')
    date2 = date2.split('-')

    for (let i = 0; i < date1.length; i++) {
        if (date1[i] != date2[i]) {
            return false;
        }
    }
    return true
}

function getLastMinutes(time) {
    let newTime = [0, 0];
    newTime[1] = (time[1] - 10 + 60) % 60;
    newTime[0] = (time[1] < newTime[1]) ? time[0] - 1 : time[0];
    return newTime;
}

function getSubjcet(schedule) {
    let now = new Date();
    let hour = now.getHours();
    let minute = now.getMinutes();

    let dateFormatter = new DateFormatter()
    dateFormatter.dateFormat = 'yyyy-MM-dd'

    let subject;
    for (let i = 0; i < schedule.length; i++) {
        let date = schedule[i]["date"].split('/').reverse().join('-');
        if (compareDates(date, dateFormatter.string(now))) {
            let subjectEnd = getLastMinutes(schedule[i]["endTime"].split(':').map((x) => parseInt(x)));
            let subjectStart = schedule[i]["endTime"].split(':').map((x) => parseInt(x));
            if (subject) {
                let previousSubjectEnd = getLastMinutes(subject["endTime"].split(':').map((x) => parseInt(x)));
                if (previousSubjectEnd[0] < subjectStart[0]) {
                    return subject;
                } else if (previousSubjectEnd[0] == subjectStart[0]) {
                    if (previousSubjectEnd[1] < subjectStart[1]) {
                        return subject;
                    }
                }
            }

            if (hour < subjectEnd[0]) {
                subject = schedule[i];
            } else if (hour == subjectEnd[0]) {
                if (minute < subjectEnd[1]) {
                    subject = schedule[i];
                }
            }

        }
    }

    return subject;
}

function createWidget() {
    let listwidget = new ListWidget();
    listwidget.backgroundColor = new Color("#1C1B1D");	

    let headStack = listwidget.addStack();
    headStack.layoutHorizontally();
    headStack.topAlignContent();
    headStack.setPadding (0,0,0,0);
    headStack.spacing = 5;

    let title = headStack.addText("Timeplan");
    title.font = Font.boldSystemFont(15);
    title.textColor = new Color("#ffffff");

    let logo = Image.fromData(logo_data);
    let logo_image = headStack.addImage(logo);
    logo_image.imageSize = new Size(16, 16);

    listwidget.addSpacer(15);
    
    let contentStack = listwidget.addStack()
    contentStack.layoutVertically();
    
    let schedule = getSchedule()["timetableItems"];
    let subject = getSubjcet(schedule);
    if (subject != undefined) {
        let subjectText = contentStack.addText(subject["subject"]);
        subjectText.font = Font.boldSystemFont(25);
        subjectText.textColor = new Color("#ffffff");
    
        let roomText = contentStack.addText(`Rom ${subject["locations"][0]}`);
        roomText.font = Font.lightSystemFont(20);
        roomText.textColor = new Color("#0fe2fa");

        let startEndTimeText = contentStack.addText(`${subject["startTime"]} - ${subject["endTime"]}`);
        startEndTimeText.font = Font.lightSystemFont(14);
        startEndTimeText.textColor = new Color("#dddddd");
    } else {
        let subjectText = contentStack.addText("Ingen Fag");
        subjectText.font = Font.boldSystemFont(25);
        subjectText.textColor = new Color("#ffffff");
    }

    listwidget.addSpacer(25);

    return listwidget;
}

async function init() {
    let widget = await createWidget();
    
    // Check where the script is running
    if (config.runsInWidget) {
        // Runs inside a widget so add it to the homescreen widget
        Script.setWidget(widget);
    } else {
        // Show the medium widget inside the app
        widget.presentSmall();
    }
    Script.complete();
}

let logo_data = Data.fromBase64String("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")
init();