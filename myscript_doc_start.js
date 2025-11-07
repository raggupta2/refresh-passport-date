"use strict";

var USER_LOGIN = 2;

var USER_PASSWORD = 4;

var SEARCH_ARN = 8;

var LOGIN_ACTION = 16;

var SELECT_APPLICATION = 32;

var NEXT_BTN = 64;

var CREATE_APPOINTMENT_ONLINE = 128;

var SELECT_DATE = 256;

var SELECT_LOCATION = 512;

var RESCHEDULE_APPOINTMENT = 1024;

var gg_login_list = null;

var gg_autocb = false; //is it on or off

var gg_socket_listeners = [];

var gg_email = null;
var gg_hostname = '';

var gg_original_alert = window.alert;
var gg_reload_timer = null;

var gg_psktable1 = ".block_right_inner > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) tr";

var gg_socket_listeners = [];

var gg_port1 = chrome.runtime.connect({name: "captchaport"});


gg_port1.onMessage.addListener(function (response)
{
    console.log("port response received=", response);

    for (var i = 0; i < gg_socket_listeners.length; ++i)
    {
        if (gg_socket_listeners[i])
        {
            gg_socket_listeners[i](response);
        }
    }
});

if ($("body").text().match(/Appointment Availability/)) {
    ff_main1();
} else {
    var sid = setInterval(function () {
        //console.log("Looping111");
        if ($("body").text().match(/Appointment Availability/)) {
            console.log("osktable greater than eq 0");

            clearInterval(sid);

            ff_main1();


        } else {
            // console.log("osktable less than eq 0");
        }

    }, 50);
}




function    ff_main1()
{
    var page = ff_detect_page1();
    console.log("a0000");

    var obj = ff_get_all_location_dates1();

    var timing = sessionStorage.getItem('reloadtiming');
    if (timing != null)
    {
        console.log("a1114");
        console.log("Time difference=" + (new Date() - sessionStorage.getItem('reloadtiming')));

        var data = {
            l: '7702020220',
            obj: obj,
            op: 'sndpskdata',
            time: sessionStorage.getItem('reloadtiming')
        };
        console.log(data);
        console.log("sended data");
        //obj != null && gg_port1.postMessage(data);
        if (obj) {
            gg_port1.postMessage(data);
        }
        console.log(obj);

        var reload = function () {
            sessionStorage.setItem("reloadtiming", new Date().getTime());
            window.location.reload();
        }

        var flag = sessionStorage.getItem('imgstart');

        if (+flag) {

            reload();
        }
    } else {
        console.log("b11111");
    }



}



function ff_handle_changes_psk_table() {

    var old_arr = sessionStorage.getItem('oldpsktable');

    sessionStorage.setItem('oldpsktable', JSON.stringify(ff_get_psk_table()));

    if (old_arr == null) {
        return;
    }
    ff_compare_color_psk_table(JSON.parse(old_arr));
}

function ff_compare_color_psk_table(old_arr)
{
    var index = 0;
    $(gg_psktable1).each(function () {
        var center = $(this).find('td:eq(0)').text().trim();
        var dateline = $(this).find('td:eq(1)').text().trim();
        if (old_arr) {
            var item = old_arr[index++];

            if (item.center != center)
            {
                console.log("ALERT: Center not same:" + center);

                if (dateline != item.dateline)
                {
                    $(this).find('td:eq(1)').css({'background-color': 'lightyellow'});
                }
            }
        }

    });

}

function ff_get_psk_table() {


    var arr = [];
    $(gg_psktable1).each(function () {
        var center = $(this).find('td:eq(0)').text();
        var dateline = $(this).find('td:eq(1)').text();

        arr.push(
                {center: center.trim(), dateline: dateline.trim()}
        );


    });

    return arr;
}

function  ff_get_all_location_dates1() {


    var divs = document.querySelectorAll('div');
    var withScroll = Array.from(divs).filter(el =>
        el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth
    );

    var items = [];

    $("div[dir='auto']", withScroll[0]).each(function () {

        var txt = $(this).text();
        if (txt.match(/Appointment/))
        {
            return;
        }
        items.push(txt);

        console.log($(this).text());
        console.log('');
    });

    var availability_arr = {};

    for (var i = 0; i < items.length; i += 2)
    {


        var availableTxt = items[i + 1];

        const match = availableTxt.match(/\b\d{2}-\d{2}-\d{4}\b/);
        const date = match ? match[0] : null;

        if (date == null) {
            continue;
        } else {
            availability_arr[items[i]] = date;
        }
    }

    console.log("Availability", availability_arr);

    return availability_arr;
}



function ff_detect_page1()
{
    if (window.location.href == 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline')
    {
        return SELECT_LOCATION;
    }
}


function ff_bottomMsg(msg, force)
{
    var timedelay = 5000;
    force = force || false;
    //if the message is same as earlier message then don't show
    if (ff_bottomMsg.msgarr)
    {
        if (!force && msg === ff_bottomMsg.msgarr[ff_bottomMsg.msgarr.length - 1])
        {
            return;
        }
    }

    $(".btcnotification a").click(
            function ()
            {
                $(this).parent("div.btcnotification").slideUp(500, function ()
                {
                    //remove from array
                    if (ff_bottomMsg.msgarr)
                    {
                        console.log(ff_bottomMsg.msgarr);
                    }

                    delete ff_bottomMsg.msgarr[0];
                });
            });
    if (!ff_bottomMsg.msgarr)
    {
        ff_bottomMsg.msgarr = new Array();
    } else
    {
    }
    ff_bottomMsg.msgarr.push(msg);
    if (ff_bottomMsg.msgarr.length === 1)
    {

        if ($("#bt-notification btnmatter").length)
        {

        }
        $("#bt-notification .btnmatter").text(msg);
        $("#bt-notification").slideDown(500);
        setTimeout(function ()
        {
            $("#bt-notification").slideUp(500, function ()
            {
                //remove from array
                if (ff_bottomMsg.msgarr)
                {
                    console.log(ff_bottomMsg.msgarr);
                }

                delete ff_bottomMsg.msgarr[0];
            });
        }, timedelay);
    } else
    {
        console.log("in notification1");
        $("#bt-notification1 .btnmatter").text(msg);
        $("#bt-notification1").slideDown(500);
        setTimeout(function ()
        {
            $("#bt-notification1").slideUp(500, function ()
            {
                delete ff_bottomMsg.msgarr[0];
            });
        }, timedelay);
    }
}

function ff_get_correct_time() {
    return new Date(new Date().getTime());
}
