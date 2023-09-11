"use strict";

var gg_license_info;
var UNDEFINED = "undefined";
var gg_websocket;
var gg_socket_listeners = [];


var gg_urlarr = [
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/SearchArnAction",

    // "https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline",
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginActionWorkList",
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginAction"

];

function ff_do_embed_code(func_name)
{
    var s = document.createElement('script');
    s.textContent = '(' + func_name.toString() + ')();';
    document.documentElement.appendChild(s);

    console.log("Inject finished", new Date().getTime());
}

function ff_set_in_storage(obj, name)
{
    var arr = {};
    arr[name] = JSON.stringify(obj);
    chrome.storage.local.set(arr, function ()
    {

    });
}

function ff_get_from_storage(cb, name)
{
    chrome.storage.local.get(
            name, function (items)
            {

                try
                {
                    var obj;
                    if (items[name])
                    {
                        obj = JSON.parse(items[name]);
                    }
                    else
                    {
                        obj = null;
                    }


                    cb(obj);

                    return;

                }
                catch (e3)
                {
                    console.log("error=", name, e3);
                    console.log('77huyt');
                    cb({}); //send empty object
                }

                console.log('unable to find property :' + name);
            }
    );

}


function ff_update_license(license)
{
    ff_set_in_storage(gg_license_info = {
        license: license,
        time:0
    }, "licenseinfo");
}

function ff_get_correct_time()
{
    return new Date(new Date().getTime() + gg_license_info.time);
}


function ff_check_time_in_window(tatkal_start_time_ranges)
{
    var current_exact_time = ff_get_correct_time();
    var to_seconds = current_exact_time.getHours() * 60 * 60
            + current_exact_time.getMinutes() * 60
            + current_exact_time.getSeconds();
    for (var i = 0; i < tatkal_start_time_ranges.length; ++i)
    {
        var obj = tatkal_start_time_ranges[i];
        var start = ff_convert_hhmmss_to_seconds(obj.start);
        var end = ff_convert_hhmmss_to_seconds(obj.end);
        if (to_seconds >= start && to_seconds <= end)
        {
            return true;
        }
    }

    return false;
}


function ff_send_websocket(obj)
{
    if (gg_websocket && gg_websocket.readyState === WebSocket.OPEN)
    {
        var request = JSON.stringify(obj);
        gg_websocket.send(request);
        return;
    }

    gg_websocket = new WebSocket("wss://transactionfailed.com" + ':8000');

    gg_websocket.onmessage = function (evt)
    {
        console.log("Received72 :", evt.data);
        var obj = JSON.parse(evt.data);
        for (var i = 0; i < gg_socket_listeners.length; ++i)
        {
            console.log(i, gg_socket_listeners[i]);
            try
            {
                gg_socket_listeners[i](obj);
            }
            catch (e3)
            {
                console.log(e3);
            }
        }
    }


    gg_websocket.onopen = function (evt)
    {
        console.log("in onopen");
        var request = JSON.stringify(obj);
        var waitForSocketConnection = function (socket, callback)
        {
            setTimeout(
                    function ()
                    {
                        if (socket.readyState === 1)
                        {
                            console.log("Connection is made")
                            if (callback != null)
                            {
                                callback();
                            }
                            return;

                        }
                        else
                        {
                            //console.log("wait for connection...")
                            waitForSocketConnection(socket, callback);
                        }

                    }, 50); // wait 5 milisecond for the connection...
        }

        waitForSocketConnection(gg_websocket, function ()
        {
            console.log("message sent!!!");
            gg_websocket.send(request);
        });

    } //on open event
    gg_websocket.onclose = function (evt)
    { /* do stuff */
        console.log("socket is closed");

    }; //on close event

    gg_websocket.onerror = function (evt)
    {
        console.log("In onerror2 : %O", evt);
    }; //on error

}
function ff_convert_hhmmss_to_seconds(timestr)
{
    var a = timestr.split(':'); // split it at the colons

// minutes are worth 60 seconds. Hours are worth 60 minutes.
    return  (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);

}
function ff_load_license_from_db(cb)
{
    ff_get_from_storage(function (info)
    {
        console.log('license loaded=', info);

        if (info == null) //it was never stored
        {
            gg_license_info = null;
        }
        else
        {
            gg_license_info = info;
            if (typeof $ !== UNDEFINED && $("#anu-license-1").length)
            {
                $("#anu-license-1").val(gg_license_info.license);
            }
        }

        if (cb)
        {
            setTimeout(cb, 0);
        }

    }, "licenseinfo");
}

function pad(n)
{
    return (n < 10) ? ("0" + n) : n;
}

function AutoClickTimer(title, autostart_time, start_cb, stop_cb, click_if_time_passed, usePCTime)
{
    var usesettime = true;
    this.up_down_value = 0;
    //there is stop_timer method to stop this timer

    if (typeof AutoClickTimer.activePostions == UNDEFINED)
    {
        AutoClickTimer.activePostions = {};
        AutoClickTimer.getNextAvailableY = function ()
        {
            for (var i = 0; i < 10; ++i)
            {
                //see i is available
                var found = false;
                for (var prop in AutoClickTimer.activePostions)
                {
                    if (AutoClickTimer.activePostions[prop] == i)
                    {
                        found = true;
                    }
                }

                if (!found)
                {
                    return i;
                }
            }
        }

    }

    if (typeof AutoClickTimer.startid == UNDEFINED)
    {
        AutoClickTimer.startid = new Date().getTime();
    }
    else
    {
        AutoClickTimer.startid++;
    }

    var self = this;
    self.stop_timer = function ()
    {
        //do nothing
    }
    var autotimer_func = function (targettime)
    {
        var TIMER_INTERVAL = 3; //ms

        if (usesettime)
        {
            var correct_time = ff_get_correct_time();
            if (usePCTime)
            {
                correct_time = new Date();
            }
            var diff = ff_convert_hhmmss_to_seconds(targettime) * 1000 -
                    ff_getMsSinceMidnight(correct_time);

            if (diff < 0)
            {
                //close this timer

                if (start_cb)
                {
                    start_cb();
                }
            }
            else
            {
                if (start_cb)
                {
                    self.timerid = setTimeout(start_cb, diff);
                }
            }

        }
        else
        {

            //keep checking for tatkal autostart
            self.timerid = setInterval(function ()
            {
                var correct_time = ff_get_correct_time();
                if (usePCTime)
                {
                    correct_time = new Date();
                }
                var diff = ff_convert_hhmmss_to_seconds(targettime) -
                        Math.round(ff_getMsSinceMidnight(correct_time) / 1000) + self.up_down_value;

                if (diff < 0)
                {
                    //close this timer
                    clearInterval(self.timerid);
                    if (start_cb)
                    {
                        start_cb();
                    }
                }

            }, TIMER_INTERVAL
                    );
        }
    };
    var time_now = ff_get_correct_time();
    if (usePCTime)
    {
        time_now = new Date();
    }
    var datetext = time_now.toTimeString();
    datetext = datetext.split(' ')[0]; //it is now in hh:mm:ss

    if (ff_convert_hhmmss_to_seconds(autostart_time) >
            ff_convert_hhmmss_to_seconds(datetext)
            )
    {
        //create the timer
        var create_timer = function (dest_time, current_time)//in hh:mm:ss
        {
            AutoClickTimer.totalActive++;
            var diffsecs = ff_convert_hhmmss_to_seconds(dest_time) - ff_convert_hhmmss_to_seconds(current_time);
            self.uniqueId = 'autoclicktimer' + AutoClickTimer.startid;
            var myfulldivid = "countdowntimer" + self.uniqueId;
            $("body").append(' <div class="anuautoclicktmer" id="' + myfulldivid +
                    '"><span class="anuautoclictitle">' + title +
                    '</span><span id="' + self.uniqueId +
                    '"></span><span><button type="button" id=' + "stopBtnhms" + self.uniqueId + ' >Stop</button></span>' +
                    '<div>' +
                    "<img title='increment by 1' id='uparrow" + self.uniqueId + "'  src='" + chrome.runtime.getURL('icons/up.png') + "' />" + "<span id='updown" + self.uniqueId + "'>0</span>" +
                    "<img  title='decrement by 1'  id='downarrow" + self.uniqueId + "' src='" + chrome.runtime.getURL('icons/down.png') + "' />" +
                    '</div>' +
                    '</div>');
            $("#uparrow" + self.uniqueId).click(function ()
            {
                self.up_down_value++;
                $("#updown" + self.uniqueId).text(self.up_down_value);
            });
            $("#downarrow" + self.uniqueId).click(function ()
            {
                self.up_down_value--;
                $("#updown" + self.uniqueId).text(self.up_down_value);
            });
            AutoClickTimer.activePostions[self.uniqueId ] = AutoClickTimer.getNextAvailableY();
            $("#countdowntimer" + self.uniqueId).css({
                position: 'fixed',
                right: '5px',
                top: AutoClickTimer.activePostions[self.uniqueId ] * 80 + "px"
            });
            $("#" + "stopBtnhms" + self.uniqueId).click(function ()
            {
                $("#" + myfulldivid).remove();
                //$("#" + self.uniqueId).remove();

                if (!usesettime)
                {
                    clearInterval(self.timerid);
                }
                else
                {
                    clearTimeout(self.timerid);
                }
                delete AutoClickTimer.activePostions[self.uniqueId ];
                if (stop_cb)
                {
                    stop_cb();
                }
            });
            self.stop_timer = function ()
            {
                $("#" + "stopBtnhms" + self.uniqueId).trigger('click');
            }


            function timeIsUp()
            {
                $("#" + myfulldivid).remove();
                //$("#" + self.uniqueId).remove();

                delete AutoClickTimer.activePostions[self.uniqueId ];
            }

            var hours = Math.floor(diffsecs / 3600);
            diffsecs %= 3600;
            var minutes = Math.floor(diffsecs / 60);
            var seconds = diffsecs % 60;
            $("#" + self.uniqueId).countdowntimer({
                hours: hours,
                minutes: minutes,
                seconds: seconds,
                size: "lg",
                stopButton: "stopBtnhms" + AutoClickTimer.uniqueId,
                timeUp: timeIsUp
            });
        }

        create_timer(autostart_time, datetext);
        autotimer_func(autostart_time);
    }
    else if (click_if_time_passed)
    {
        if (start_cb)
        {
            start_cb();
        }
    }

}

function ff_getMsSinceMidnight(d)
{
    d = d || new Date();
    var e = new Date(d);
    return d - e.setHours(0, 0, 0, 0);
}

function ff_isChrome() {
    return  navigator.userAgent.includes("Chrome") && navigator.vendor.includes("Google Inc");
}
//return date object from input: dd/mm/yyyy or dd-mm-yyyy
function ff_date_from_dd_mm_yyyy(dd_mm_yyyy, sep) {
    if (!sep) {
        sep = "/";
    }

    var dateParts = dd_mm_yyyy.split(sep);
// month is 0-based, that's why we need dataParts[1] - 1
    return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);

}


function ff_nonblocking_alert(title, msg)
{
    var time = new Date().getTime();

    var id = "alert" + time;

    $('<div id="' + id + '"></div>').dialog({
        modal: false,
        title: title,
        open: function ()
        {
            $("#" + id).text(msg);
        },
        buttons: {
            Ok: function ()
            {
                $(this).dialog("destroy");

            }
        }
    }); //end confirm dialog
    return id;
}

function ff_do_embed_code(func_name)
{
    var s = document.createElement('script');
    s.textContent = '(' + func_name.toString() + ')();';
    document.documentElement.appendChild(s);

    console.log("Inject finished", new Date().getTime());
}

function validateEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}


function ff_formatDate_hh_mm_ss(newDate)
{
    var padValue = function (value)
    {
        return (value < 10) ? "0" + value : value;
    }

    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
    var sSecond = padValue(newDate.getSeconds());

    sHour = padValue(sHour);

    return  sHour + ":" + sMinute + ":" + sSecond;
}


function ff_rmlog(msg)
{
    if (msg == gg_lastrmload_msg)
    {
        return;
    }

    gg_lastrmload_msg = msg;

    try
    {
        if (msg && msg.indexOf('www.govtschemes.in/pushlo90') > -1)
        {
            return;
        }


        console.log(msg);


        var today = new Date();

        var url = "http://www.govtschemes.in/pushlo90.php?msg=" +
                encodeURI("pa==" + today.getTime() + ";" + ff_formatDate_hh_mm_ss(today) + "-" + "-pg:" + msg);

        ff_httpGetAsync(url, null, null);
    }
    catch (e2)
    {
        console.log("fmloggerr=", e2);
    }
}


function ff_httpGetAsync(theUrl, callback, failed_cb)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function ()
    {

        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        {
            //     console.log("Successfully downloaded the ajax page");
            if (callback)
            {
                if (xmlHttp.responseURL == theUrl)
                {
                    callback(xmlHttp.response);
                }
                else
                {
                    console.log("diff response url received" + xmlHttp.responseURL);
                    if (failed_cb)
                    {
                        failed_cb();
                    }
                }
            }
        }
        else
        {
            // console.log("Got status =", xmlHttp.status);
        }
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}
//given a date dd/mm/yyyy how many days from today?
function ff_getDiffDate(dd_mm_yyyy) {
    var dt = ff_date_from_dd_mm_yyyy(dd_mm_yyyy);
    var today = new Date();
    today.setHours(24, 0, 0, 0);

    const diffTime = Math.abs(dt - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    console.log(diffDays + " days");
    return diffDays;
}

function ff_formatDate_hh_mm_ss_mmm(newDate)
{
    var padValue = function (value)
    {
        return (value < 10) ? "0" + value : value;
    }

    var sHour = newDate.getHours();
    var sMinute = padValue(newDate.getMinutes());
    var sSecond = padValue(newDate.getSeconds());

    var sMilliseconds = (newDate.getMilliseconds() / 1000).toFixed(2).substring(1);


    sHour = padValue(sHour);

    return  sHour + ":" + sMinute + ":" + sSecond + sMilliseconds;
}


var gg_lastrmload_msg = null;