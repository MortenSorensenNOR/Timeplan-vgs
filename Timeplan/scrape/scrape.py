import os
import math
import json
import datetime
import requests

def getSchedule(date, week):
    LEARNERID = 1234567
    URL = f"https://amalieskram-vgs.inschool.visma.no/control/timetablev2/learner/{LEARNERID}/fetch/ALL/0/current?forWeek={date}&extra-info=true&types=LESSON,EVENT,ACTIVITY,SUBSTITUTION"
    cookies = {
        '_ga_6FW5VD7DW7': '',
        'NPS_EU-c1ffc80c_last_seen': '', 
        'XSRF-TOKEN': '',
        'JSESSIONID': '',
        'Authorization': '',
        '_gid': '',
        'SameSite': 'None',
        'ADRUM': '',
        '_ga_QE3PD2DH31': '',
        '_ga': '',
        '_gat': '1',
        'AWSALB' : '',
        'AWSALBCORS' : ''
    }

    r = requests.get(URL, cookies=cookies)

    filename = '../data/data.json'
    with open(filename, 'r') as f:
        data = json.load(f)
        data[week] = json.loads(r.text)

    os.remove(filename)
    with open(filename, "w") as f:
        json.dump(data, f, indent=4)


today = datetime.datetime.now()
d = datetime.datetime.now()
lastSchoolDay = datetime.datetime(2023, 6, 20)
while d < lastSchoolDay:
    date = d.strftime("%d/%m/%Y")
    week = math.floor(d.timetuple().tm_yday / 7)
    getSchedule(date, week)
    
    d += datetime.timedelta(days=7)