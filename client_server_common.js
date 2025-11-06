/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
"use strict";

var requestTypeEnum = {
    NoCaptchaService: 16,
    LocalProgramcaptchaOnly: 1, //solved by program only
    LocalcaptchaPlusHumanCaptcha: 2,
    OnlyHumanCaptcha: 4,
    RemoteProgramCaptcha: 8,
    DebitCardCaptcha: 32,
    Tesseract:64
};

var requestSource = {
    OTHER: 8,
    IRCTC: 1,
    INCOMETAXEFILING: 2,
    INDIAPOST: 4,
    IRCTC_CAPTCHA: 16,
    SBITATKAL: 32,
    INDIANVISA: 64,
    TELANGANASAND : 128,
    SBICOLLECT: 256,
    TELANGANASAND_CAPTCHA : 512,
    INDIANVISA_CAPTCHA : 1024,
    TELANGANATRICK : 2048,
    FLIPKART: 4096
};


function get_site_name(lsource)
{
    if (lsource & (requestSource.TELANGANASAND_CAPTCHA | requestSource.TELANGANASAND | requestSource.TELANGANATRICK))
    {
        return "gij.admissioncourses.com";
    } else
    if (lsource & (requestSource.IRCTC | requestSource.IRCTC_CAPTCHA | requestSource.SBITATKAL))
    {
        return "www.bookrailticket.com";
    } else
    if (lsource & requestSource.SBICOLLECT)
    {
        return "www.utilitiesindia.com";
    } else if (lsource & (requestSource.INDIANVISA | requestSource.INDIANVISA_CAPTCHA))
    {
        return "www.indianvisabangladesh.xyz";
    }
    
    return "No Site";
}

var AccountStatus = {
    active: 1,
    blocked: 2,
    nobalance: 4,
    notfound: 8,
    expired: 16,
    closed: 32,
    getFormattedStr: function (status)
    {
        var ret = [];
        if (status & this.active)
        {
            ret.push("Active");
        }
        if (status & this.blocked)
        {
            ret.push("Blocked");
        }
        if (status & this.nobalance)
        {
            ret.push("No Balance");
        }
        if (status & this.notfound)
        {
            ret.push("License not found");
        }
        if (status & this.expired)
        {
            ret.push("Expired");
        }
        if (status & this.closed)
        {
            ret.push("Permanently Closed");
        }

        if (ret.length)
        {
            return ret.join(',');
        }
        return "Unknown";
    }
};

function ff_TicketSMSDetails(obj)
{

    if (obj)
    {
        for (var name in obj) {
            if (obj.hasOwnProperty(name)) {
                this[name] = obj[name];
            }
        }
    } else
    {
        this.ff_extract();
        
       
    }

    console.log("this=", this);
}

ff_TicketSMSDetails.prototype.ff_extract = function ()
{
    console.log('in extract');
    var table = $("td:not(:has(table))").filter(function () {
        return $(this).text().match(/PNR No:/);
    }).closest('table');
    this.transaction_id = $("tr:eq(1) td:eq(0)", table).text().match(/Transaction ID:(.*)/)[1].trim();
    this.date_time_booking = $("tr:eq(1) td:eq(1)", table).text().match(/Date & Time Of Booking:(.*)/)[1].trim();
    
    this.pnr = $("tr:eq(0) td:eq(0)", table).text().match(/PNR No:(.*)/)[1].trim();   //" PNR No: 2542237808"
    this.train = $("tr:eq(0) td:eq(1)", table).text().match(/Train No. & Name:(.*)\/.*/)[1].trim();

    var journeydate = ff_parse_to_date($("tr:eq(2) td:eq(1)", table).text().match(/Date Of Journey:(.*)/)[1].trim()); //"16-Jan-2016"

    var day = journeydate.getDate();
    var month = journeydate.getMonth() + 1;

    if (day < 10)
    {
        day = "0" + day.toString();
    }

    if (month < 10)
    {
        month = "0" + month.toString();
    }

    this.doj = day + "-" + month + "-" + journeydate.getFullYear().toString().substring(2);
    this.class2 = $("tr:eq(1) td:eq(2)", table).text().match(/Class:.*\((.*)\)/)[1].trim();

    this.from = $("tr:eq(2) td:eq(0)", table).text().match(/From:.*\((.*)\)/)[1].trim();
    this.to = $("tr:eq(2) td:eq(2)", table).text().match(/To:.*\((.*)\)/)[1].trim();

    if ($("tr:eq(3) td:eq(2)", table).text().match(/Scheduled Departure:.*-\d{4}\s*([0-9:]+)/))
    {
        this.dep = $("tr:eq(3) td:eq(2)", table).text().match(/Scheduled Departure:.*-\d{4}\s*([0-9:]+)/)[1].trim();
    } else
    {
        this.dep = $("tr:eq(3) td:eq(2)", table).text().match(/Scheduled Departure:(.*)/)[1].trim();
    }

    var table = $("th:not(:has(table))").filter(function () {
        return $(this).text().match(/Booking Status/);
    }).closest('table');


    this.name = $("tr:eq(1) td:eq(1)", table).text().trim();
    this.passengers = $("tr", table).length - 1 - 1; //+0

    var current_status_index = $("tr:eq(0) th", table).filter(function () {
        return $(this).text().match(/Current Status/);
    })[0].cellIndex;


    this.bookingarr = $("tr td:nth-child(" + (+current_status_index + 1) + ")", table).map(function () {
        console.log("this.text=", $(this).text());
        return $(this).text().trim();
    }).get();

    // console.log($("tr td:eq(5)", table).length);

    //it looks like CNF/D4/85/WINDOW SIDE

    var table = $("td:not(:has(table))").filter(function () {
        return $(this).text().match(/IRCTC Service Charge/);
    }).closest('table');

    this.fare = $("tr:eq(0) td:eq(1)", table).text().trim();
    this.sc = $("tr:eq(1) td:eq(1)", table).text().trim();

}

//validate this at server side ; all members must be verified
ff_TicketSMSDetails.prototype.ff_validate = function () {
    try {
        if (this.pnr.match(/^\d{10}$/)
                && this.train.match(/^\d{4,6}$/)
                && this.doj.match(/^\d{2}-\d{2}-\d{2}$/)
                && this.class2.match(/^.{1,4}$/)
                && this.from.match(/^[A-Z]{1,5}$/)
                && this.to.match(/^[A-Z]{1,5}$/)
                && (this.dep.match(/^\d{2}:\d{2}$/) || this.dep.match(/^\*N\.A\.$/))
                && this.name.length < 17
                && typeof (this.passengers) == 'number'
                && this.fare.match(/[\d.]+/)
                && this.sc.match(/[\d.]+/)
                )
        {

            return true;
        }
    } catch (e3)
    {
        console.log(e3);
    }

    return false;
}


ff_TicketSMSDetails.prototype.ff_format = function () {

    console.log('bookingarr=', this.bookingarr);

    var bkstr = [];
    for (var i = 0; i < this.bookingarr.length; ++i)
    {
        var m;
        if (m = this.bookingarr[i].trim().match(/^CNF\/([^/]+)\/([^/]+)/))
        {
            bkstr.push(m[1] + " " + m[2]);
        } 
        else if (m = this.bookingarr[i].trim().match(/^([^/]+)\/([^/\s]+)/))
        {
            bkstr.push(m[1] + " " + m[2]);
        }

        console.log("m=", m);
    }

    var arr = [
        "PNR:" + this.pnr,
        "TRAIN:" + this.train,
        "DOJ:" + this.doj,
        this.class2,
        this.from + " - " + this.to,
        "Dep:" + this.dep,
        " " + this.name + (this.passengers ? ("%2B" + this.passengers) : "")

    ];

    for (var i = 0; i < bkstr.length; ++i)
    {
        arr.push(bkstr[i]);


    }

    arr.push('Fare:' + this.fare);
    arr.push('SC:' + this.sc);


    console.log('arr=', arr);

    return arr.join(',') + "%2B PG CHGS";
}

function ff_check_for_trial_license(license)
{
    if (license && license.match(/9+5+9+9+0+0+0+0+0+/i))
    {
        return true;
    }
    return false
}







if ((typeof exports === 'object'))
{
    module.exports.requestTypeEnum = requestTypeEnum;
    module.exports.AccountStatus = AccountStatus;
    module.exports.requestSource = requestSource;
    module.exports.ff_TicketSMSDetails = ff_TicketSMSDetails;
    module.exports.ff_check_for_trial_license = ff_check_for_trial_license;
    module.exports.get_site_name = get_site_name;
    
    

}



