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
var gg_captcha_server = "govtschemes.in";
var gg_email = 'rag.raggupta@gmail.com';
var gg_hostname = '';

var gg_original_alert = window.alert;
var gg_reload_timer = null;

var gg_psktable = ".block_right_inner > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(1) > table:nth-child(1) tr";

var gg_socket_listeners = [];



function ff_premain() {
    //load the login/password

    ff_get_from_storage(function (obj) {
        if (obj) {
            if ("email" in obj)
            {
                gg_email = obj.email;
            }
            if ("hostname" in obj) {
                gg_hostname = obj.hostname;
            }
        }

        ff_main();

    }, "user_details");

}


ff_load_license_from_db(ff_premain);


function ff_make_date_bold() {
    $("span[style]").each(function () {
        var txt = $(this).text();

        var ret = txt.match(/EARLIEST APPOINTMENT AVAILABLE FOR (\d\d\/\d\d\/\d{4})[\r\n\s]+\. To proceed click Book Appointment/);
        if (ret)
        {
            $(this).css({'font-size': "1.5em"});
            console.log(ret[1]);
            if (ret.length > 1)
            {
                sessionStorage.setItem("andatte", ret[1]);
            }


        }
    });
}

function ff_display_last_datefnd() {

    var dt = sessionStorage.getItem("andatte");

    if (dt) {
        $("body").append('<div id="andatte"><strong>' + dt + '</strong></div>');

    }

}
function ff_main()
{
    if (window.location.href.match(/portal1.passportindia.gov.in\/AppOnlineProject\/welcomeLink/)) {
        window.location = "https://portal1.passportindia.gov.in/AppOnlineProject/user/userLogin";
        return;
    }

    $("body").append("<div id='bt-notification1' class='btcnotification'><a href='#'>Close</a><span class='btnmatter'></span></div><div id='bt-notification' class='btcnotification'><a href='#'>Close</a><span class='btnmatter'></span></div>");
    $("#outer > table > tbody > tr:nth-child(2)").hide();
    $("table[width='100%'][style~='#e5e5e5']").hide();

    $("li").each(function ()
    {
        if ($(this).text().match(/Terms & Conditions/))
        {
            $(this).closest('table').hide();
            return true;
        }
    });

    $("div.copyright").closest('table').hide();

    window.addEventListener("contextmenu",
            function (e)
            {
                e.stopPropagation();
            }, true);

    $("a[href='/AppOnlineProject/secure/loginActionWorkList']").closest('li').css({
        fontSize: '2em',
        border: '2px red solid',
        padding: '5px 5px'
    });

    $("body").append("<label id='anstatus'></label>");


    $("html").append('<div id="answitch"> <label for="autocb" class="switch-toggle" data-on="On" data-off="Off">Switch:<input type="checkbox" id="autocb" /></label>  </div>'
            );

    $('#' + 'autocb').click(function () {

        gg_autocb = $('#autocb').is(":checked");

        localStorage.setItem("autocb", gg_autocb);

        if (gg_autocb) {
            ff_switch_onoff(page);
        }
    });
    console.log("autocb=" + localStorage.getItem('autocb'));
    if (localStorage.getItem('autocb') == 'true')
    {
        $('#autocb').prop('checked', true);
        gg_autocb = true;
    }

    ff_show_timer();

    var page = ff_detect_page();

    setTimeout(function () {
        ff_switch_onoff(page);
    }, 750);

    console.log("page=", page);

    if (page == RESCHEDULE_APPOINTMENT) {
        ff_display_last_datefnd();
        //ff_do_embed_code(ff_inject_alert);
        $("#showAppointment_showAppointmentOnline_Change_Appointment_key").attr('onclick', "return true");
        $("#showAppointment_showAppointmentOnline_Change_Appointment_key").trigger('click');
    }
    if (page == USER_LOGIN)
    {
        ff_display_last_datefnd();
        $("#userName").css({'width': '700px'});
        $("#userName").removeAttr('maxlength');
        $("#userName").attr('size', '60');
        $("#userName").attr('maxlength', '60');
        $("#userName").val(localStorage.getItem('userName'));
        ff_get_from_storage(function (obj) {
            console.log('usrname recv=', obj);
            $("#userName").val(obj);
        }, "userName");
        setInterval(function ()
        {
            if ($("#userName").val().trim().length > 4)
            {
                ff_set_in_storage($("#userName").val().trim(), 'userName');
            }
        }, 1000);

        ff_display_all_logins();

        var imageid = 'captcha';

        $("#captcha").on("load", ff_fill_common_captcha).each(function ()
        {
            if (this.complete)
                $(this).load();
        });

        gg_socket_listeners.push(function (arr) {
            if (arr.constructor === Array)
            {
                ff_set_in_storage({str: arr[2]}, "clicktime");
                $("#userName").val(arr[0]);
                $("#Login").trigger('click');
            }
        });

        //load the login/password
        ff_load_remote_login_passwd(function () {});

    }
    if (page == USER_PASSWORD)
    {
        ff_display_last_datefnd();
        if (gg_license_info && "license" in gg_license_info)
        {
            var ranges = [
                {
                    start: "12:00:00",
                    end: "12:05:00"
                },
            ];
            if (!ff_check_time_in_window(ranges))
            {
                if (new Date() - gg_license_info.lastupdated > 30 * 60 * 1000)
                {
                    ff_update_license(gg_license_info.license);
                }
            }
        }

        $('<input id="newpa" type="password">').insertAfter($("#password"));

        $("#password").hide();

        setInterval(function ()
        {
            if ($("#password").length < 50)
            {
                $("#password").val($("#newpa").val());
            }
        }, 500);

        $("#userName2").css({'width': '700px'});
        $("#userName2").removeAttr('style');
        $("#LoginButton").width('200px');

        ff_get_passwd_for_login(function (passwd)
        {
            if (passwd)
            {
                $("#password,#newpa").val(passwd);
            }

        }, $("#userName2").val().trim())

        $("#test123").attr('autocomplete', 'off');

        setTimeout(function ()
        {
            if ($("#password").val().trim().length)
            {
                $("#test123").focus();
            }
            else
            {
                $("#newpa").focus();
            }
        }, 700);

        var save_login_passwd = function ()
        {
            var login = $("#userName2").val().trim();
            var passwd = $("#newpa").val().trim();

            ff_set_in_storage(login, 'userName');
            ff_set_in_storage(passwd, 'anpassword');

        }

        $("#LoginButton").click(save_login_passwd);

        var cap_text_id = $("#test123");
        cap_text_id.bind('keyup', function (e)
        {
            if (e.which >= 97 && e.which <= 122)
            {
                var newKey = e.which - 32;
                // I have tried setting those
                e.keyCode = newKey;
                e.charCode = newKey;
            }
            cap_text_id.val((cap_text_id.val()).toUpperCase());
        }).keypress(function (e)
        {
            if (e.which == 13)
            {
                e.preventDefault();
                $("#LoginButton").trigger('click');
                return false; //<---- Add this line
            }
        });

        ff_display_all_logins();

        $("#audCaptcha").click();


        gg_socket_listeners.push(function (text) {
            if (typeof text != "string")
            {
                return;
            }
            $("#test123").val(text);
            if ($("#userName2").val().trim().length > 3)
            {
                if (gg_autocb) {
                    $("#LoginButton").trigger('click');
                }
            }
        });

        $("#captcha").on("load", ff_fill_common_captcha).each(function ()
        {
            if (this.complete)
                $(this).load();
        });


        gg_socket_listeners.push(function (arr) {
            if (arr.constructor === Array)
            {
                $("#password,#newpa").val(arr[1]);
                setTimeout(function () {
                    $("#test123").val().trim().length > 2 && $("#LoginButton").trigger('click');
                }, 2000);

            }
        });

        //load the login/password
        ff_load_remote_login_passwd(function () {});


    }
    if (page == SEARCH_ARN)
    {
        $("#payMode1I").trigger('click');
        document.getElementById('nextButton').click();

    }
    if (page == LOGIN_ACTION)
    {
        $("a[href~=loginActionWorkList]").closest('td').css(
                {
                    fontSize: '2em',
                    border: '2px red',
                    padding: '5px 5px'
                }
        );

        window.location = 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginActionWorkList';
    }
    if (page == SELECT_APPLICATION)
    {

        ff_display_last_datefnd();
        ff_save_login_passwd();

        var str = 'input[name="appRefNo"]:eq(0)';

        if ($('input[name=appRefNo]:checked').length == 0
                )
        {
            $(str).prop('checked', true).trigger("click");

            $('li').each(function ()
            {
                if ($(this).text().match(/Payment and Appointment/))
                {
                    $(this).css({
                        fontSize: '2em',
                        border: '2px solid red'
                    });
                    $(this).trigger('click');
                    // $("img[src='/AppOnlineProject/css/images/clickHereImage.jpg']",$(this)).trigger('click');
                    return false;
                }
            });
        }
        $(str).closest('tr').find('td').attr('class', 'customerrow');

        $(str).closest('tr').find('td').css(
                {
                    'font-size': '1.5em !important',
                    border: '1px solid red !important',
                });
        $(str).closest('tr').find('td').each(function ()
        {
            $(this).css(
                    {
                        'font-size': '1.5em !important',
                        border: '1px solid red !important',
                    });

        });

        setInterval(function ()
        {
            if ($('input[name=appRefNo]:checked').length)
            {
                localStorage.setItem("aarn", $('input[name=appRefNo]:checked').val());

                localStorage.setItem("clinam", $('input[name=appRefNo]:checked').closest('tr').find('td:eq(3)').text());
                console.log("aarn=" + localStorage.getItem('aarn'));
            }
        }, 1000);

        $("#scheduleEnquiry span").removeAttr('title');

        $("li").each(function ()
        {
            if ($(this).text().match(/Schedule an enquiry appointment  at Passport Office. Schedule appointment to/))
            {
                $(this).find('table').remove();
                return false;
            }
        });
    }
    if (page == NEXT_BTN)
    {
        document.getElementById('showAppointment_Next_key').click();
        ff_display_last_datefnd();
        var given_sel = "table > tbody > tr:nth-child(2) > td:nth-child(2)";
        var sur_sel = "table > tbody > tr:nth-child(3) > td:nth-child(2)";

        var angiven_name = localStorage.getItem('angiven_name');
        var ansur_name = localStorage.getItem('ansur_name');
        $("span").each(function ()
        {
            if ($(this).text().match(/You have not taken an appointment./))
            {
                var table = $(this).closest('table').find('table');


                $(given_sel + "," + sur_sel).css(
                        {
                            'font-size': '2em',
                            border: '2px solid green',
                            padding: '4px 4px'

                        });

                var givename = $(given_sel).text();
                var surname = $(sur_sel).text();
                localStorage.setItem('angiven_name', givename);
                localStorage.setItem('ansur_name', surname);
                if (localStorage.getItem('angiven_name'))
                {

                    if (angiven_name != givename || ansur_name != surname)
                    {
                        $(given_sel + "," + sur_sel).css(
                                {
                                    'text-decoration': 'line-through',
                                    border: '2px solid red',
                                });
                    }
                    else
                    {
                        // $("#showAppointment_Next_key").trigger('click');
                    }
                }
                return false;
            }
        });
        if (gg_autocb) {
            $("#showAppointment_Next_key").trigger('click');
        }
    }

    else if (SELECT_LOCATION == page) {


        setInterval(function () {
            if ($('#pfcLocation').length && $('#pfcLocation').find(":selected").val() && $('#pfcLocation').find(":selected").val().trim().length) {
                localStorage.setItem('anpfclocation', $('#pfcLocation').find(":selected").val());
                console.log("anpfclo=" + localStorage.getItem('anpfclocation', $('#pfcLocation')));
            }
        }, 1000);

        ff_handle_changes_psk_table();

        ff_handle_start_stop();

        ff_get_from_storage(function (obj) {

            if ("str" in obj)
            {
                new AutoClickTimer("Press Submit",
                        obj.str, function ()
                        {
                            var reload = function () {
                                sessionStorage.setItem("reloadtiming", new Date().getTime());
                                window.location.reload();
                            }
                            sessionStorage.setItem("imgstart", 1);
                            $("#imgstart").hide();
                            $("#imgstop").hide();
                            reload();
                        }, null, true, false);
            }

        }, "clicktime");
    }

    $("#captcha").remove();
}

function ff_load_remote_login_passwd() {
    var sendDataToServer = function ()
    {
        var rec = {
            l: gg_license_info.license,
            op: 'getshortlogin', //captcha decoding op            
        }

        var ws = new WebSocket("wss://nsdo.tspt.in:8000");

        ws.onopen = function ()
        {
            ws.send(JSON.stringify(rec));
            console.log("data sent", rec);
        }

        ws.onmessage = function (evt)
        {
            var obj = JSON.parse(evt.data);

            console.log("obj=", obj);

            for (var i = 0; i < gg_socket_listeners.length; ++i)
            {
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
    }

    sendDataToServer();
}

function ff_handle_start_stop() {
    if ($("#imgstart").length == 0) {
        $("<img id='imgstart' src='" + chrome.runtime.getURL('images/start.jpeg') + "' >").insertAfter('#showSlotsByLocation_Next_key');
        $("<img id='imgstop' src='" + chrome.runtime.getURL('images/stop.jpg') + "' >").insertAfter('#showSlotsByLocation_Next_key');
    }
    var reload = function () {
        sessionStorage.setItem("reloadtiming", new Date().getTime());
        window.location.reload();

    }


    $("#imgstart").click(function () {
        sessionStorage.setItem("imgstart", 1);
        $("#imgstart").hide();
        $("#imgstop").hide();
        reload();
    });

    $("#imgstop").click(function () {
        sessionStorage.setItem("imgstart", 0);
        alert('stopped');

        $("#imgstop").hide();
        $("#imgstart").show();
    });


    var flag = sessionStorage.getItem('imgstart');

    if (flag === null)
    {
        $("#imgstop").hide();
        $("#imgstart").show();
    }
    else if (+flag) {
        $("#imgstop").show();
        $("#imgstart").hide();
        //reload();

    }
    else {
        $("#imgstart").show();
        $("#imgstop").hide();
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
    $(gg_psktable).each(function () {
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
    $(gg_psktable).each(function () {
        var center = $(this).find('td:eq(0)').text();
        var dateline = $(this).find('td:eq(1)').text();

        arr.push(
                {center: center.trim(), dateline: dateline.trim()}
        );


    });

    return arr;
}

function  ff_get_all_location_dates() {

    var dateobj = {};

    $(gg_psktable).each(function () {
        var center = $(this).find('td:eq(0)').text();
        var dateline = $(this).find('td:eq(1)').text();
        var match = dateline.match(/Available for (\d.*)/);

        console.log(match);
        $(this).attr('id', 'dtfnd');
        if (match == null || match.length < 2) {
            console.log("PSK table date not read");
            return;
        }

        dateobj [center] = match[1];
    });
    return dateobj;
}

function  ff_get_location_date(loc) {
    var found = null;
    $(gg_psktable).each(function () {
        var center = $(this).find('td:eq(0)').text();
        var dateline = $(this).find('td:eq(1)').text();

        if (loc == center)
        {
            var match = dateline.match(/Available for (\d.*)/);
            console.log(match);
            $(this).attr('id', 'dtfnd');
            if (match == null || match.length < 2) {
                console.log("PSK table date not read");
                return false;
            }
            found = match[1];

            return false;
        }


    });
    if (found) {
        return found;
    }
    return null;
}

function ff_get_passwd_for_login(cb, login)
{
    var cb1 = function (list)
    {
        if (list == null)
        {
            return;
        }

        for (var prop in list)
            if (list.hasOwnProperty(prop))
                if (prop == login)
                {
                    if (cb)
                    {
                        cb(list[login].passwd);
                        return;
                    }
                }

    }

    ff_get_from_storage(cb1, "alllogins");
}

function ff_display_all_logins()
{
    $("#main-content").hide();
    var cb = function (list)
    {
        if (list == null)
        {
            return;
        }
        gg_login_list = list;

        var mappedHash = Object.keys(list).sort(function (a, b)
        {
            return list[ a ].lastupdated - list[ b ].lastupdated;
        }).map(function (sortedKey)
        {
            return list[ sortedKey ];
        });

        var lines = [];

        var combo = $("<select></select>").attr("id", "anda").attr("name", 'andam');
        for (var i = 0; i < mappedHash.length; ++i)
        {
            var obj = mappedHash[i];
            lines[i] = obj.login + ":" + obj.userdata.length + " applications";


            combo.append("<option>" + lines[i] + "</option>");
        }

        var div = $("<div></div>").attr("id", "andad1").attr("name", 'andamd1');

        combo.appendTo(div);

        var inp = $('<input/>').attr({type: 'button', name: 'shdtls', value: 'Show Applications', id: 'shoapps'});
        inp.prependTo(div);

        var inp2 = $('<input/>').attr({type: 'button', value: 'Delete', id: 'delts'});
        inp2.prependTo(div);

        div.prependTo($("body"));

        $("#shoapps").click(function ()
        {
            var txt = $('#anda').find(":selected").text();

            var arr = txt.split(":");

            ff_show_applications(arr[0]);

            $("#userName").val(arr[0]);
        });

        $("#delts").click(function ()
        {
            var txt = $('#anda').find(":selected").text();

            var arr = txt.split(":");

            ff_delete_application(arr[0]);


        });

    }

    ff_get_from_storage(cb, "alllogins");
}

function ff_delete_application(login)
{
    if (confirm('Want to delete?'))
    {
        if (gg_login_list && login in gg_login_list)
        {
            delete gg_login_list[login];

            ff_set_in_storage(gg_login_list, "alllogins");

            window.location.reload();
        }
    }
}

function ff_show_applications(login)
{
    if (login && login in gg_login_list)
    {
        var obj = gg_login_list[login];

        var table = '<table id="shftbl" "border"="1"><tr><th>Sno</th><th>File</th><th>File</th><th>Name</th><th>Status</th><th>Date</th></tr>';

        for (var i = 0; i < obj.userdata.length; ++i)
        {
            table = table + "<tr>" + "<td>" + (i + 1) + "</td>" + "<td>" + obj.userdata[i][0] + "</td>  <td>"
                    + obj.userdata[i][1] + "</td>  <td>" + obj.userdata[i][2] + "</td>  <td>"
                    + obj.userdata[i][4] + "</td>  <td>" + obj.userdata[i][5] + " </tr>";
        }

        table = table + "</table>";

        $('<div />').html(table).dialog();

        return;
    }
}

function ff_save_login_passwd()
{
    //get list of all login / passwords

    ff_get_from_storage(function (lo)
    {

        ff_get_from_storage(function (pa)
        {
            var login = lo;
            var passwd = pa;


            if (login == null)
            {
                return;
            }

            ff_get_from_storage(function (list)
            {
                if ((login in list))
                {

                    var userdetails = list[login];
                }
                else
                {
                    userdetails = {};
                    userdetails.login = login;


                }
                userdetails.lastupdated = new Date().getTime();
                userdetails.passwd = passwd;

                if ($("#applicationtable").length)
                {
                    var rows = [];
                    var i = 0;
                    $("#applicationtable > tbody > tr").each(function ()
                    {
                        rows[i] = [];
                        $(this).find("td").each(function (j, item)
                        {
                            if (j == 0)
                            {
                                return;
                            }

                            rows[i].push($(item).text().trim());
                        });
                        ++i;
                    });
                }

                userdetails.userdata = rows;

                list[login] = userdetails;

                ff_set_in_storage(list, "alllogins");
            }, "alllogins");

        }, "anpassword");

    }, "userName");

}


function ff_show_timer()
{
    $("body").append("<div id='antimer'></div>");
    $("#antimer").css({
        position: 'fixed',
        top: '10px',
        left: '10px',
        'font-size': '30px',
        'background-color': 'yellow',
        'color': 'red'
    });

    setInterval(function ()
    {
        var d = new Date(new Date().getTime());

        var hh = d.getHours();
        var mm = d.getMinutes();
        var ss = d.getSeconds();

        $("#antimer").text(pad(hh) + ":" + pad(mm) + ":" + pad(ss));
    }, 500);

}


function ff_detect_page()
{

    if ($("#apptDateId").length && $("#confirmAppointOnline_appointment_book_key").length)
    {
        return SELECT_DATE;

    }
    if (window.location.href.match(/userLogin$/))
    {
        return 2;
    }
    if ($("#password").length && $("#test123").length)
    {
        return USER_PASSWORD;
    }
    if ($("#payMode1I").length)
    {
        return SEARCH_ARN;
    }
    if (window.location.href == 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginAction')
    {
        return LOGIN_ACTION;
    }
    if ($("#applicationtable").length && $("form#loginAction").text().match(/View Saved\/Submitted Applications/))
    {
        return SELECT_APPLICATION
    }
    if ($("#showAppointment_Next_key").length && $("div").text().match(/Schedule Appointment/))
    {
        return NEXT_BTN;
    }
    if ($("#pskAddress").length && $("#test123").length &&
            $("div").text().match(/Schedule Appointment For Enquiry at Passport Office/))
    {
        return CREATE_APPOINTMENT_ONLINE;
    }

    if ($("#pfcLocation").length)
    {
        return SELECT_LOCATION;
    }

    if ($("#showAppointment_showAppointmentOnline_Change_Appointment_key").length && $("#showAppointment_showAppointmentOnline_Cancel_Appointment_key").length)
    {
        return RESCHEDULE_APPOINTMENT;
    }
}

function ff_switch_onoff(page) {

    if (page == SELECT_APPLICATION) {


        /*$("img[src='/AppOnlineProject/css/images/clickHereImage.jpg']").get(1).click();*/
        ff_do_embed_code(function () {

            window.chedoubleclick = false;
        });

        setTimeout(function () {
            // document.getElementById('manageAppointment').click();

            // $("#manageAppointment").trigger('click');

            document.getElementById('manageAppointment').click()
        }, 2000);

    }
    if (page == USER_LOGIN)
    {
        if ($("#userName").val().trim().length > 3)
        {
            gg_autocb && $("#Login").trigger('click');
        }
    }
}

function ff_getBase64Image(img)
{
    // Create an empty canvas element
    var canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    // Copy the image contents to the canvas
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/jpeg");
    var replaced = dataURL.replace(/^data:image\/(png|jpeg);base64,/, "");

    return replaced;
}


function ff_fill_common_captcha()
{
    ff_fillcaptcha(gg_captcha_server);

    setTimeout(function () {
        if ($("#test123").val().length <= 3)
        {
            console.log("requesting 2nd captcha");
            ff_fillcaptcha('updateadhaar.com');
        }
    }, 1000);
}

function ff_fillcaptcha(server) {

    var fun = ff_fillcaptcha;
    if (typeof fun.s_reqno == UNDEFINED) {
        fun.s_reqno = 0;
    }
    else {
        ++fun.s_reqno;
    }
    var data = {};
    data.img = ff_getBase64Image(document.getElementById('captcha'));
    // console.log('data.img=', data.img);
    var sendDataToServer = function ()
    {
        var rec = {
            l: gg_license_info.license,
            op: 'captcha', //captcha decoding op
            img: data.img,
            s_reqno: fun.s_reqno,
        }

        var ws = new WebSocket("wss://" + server + ":31334");

        ws.onopen = function ()
        {
            ws.send(JSON.stringify(rec));
            console.log("data sent");
        }

        ws.onmessage = function (evt)
        {
            var obj = JSON.parse(evt.data);

            console.log("obj=", typeof obj);

            for (var i = 0; i < gg_socket_listeners.length; ++i)
            {
                try
                {
                    var obj2 = JSON.parse(obj);
                    gg_socket_listeners[i](obj2.decoded_captcha.captcha);
                }
                catch (e3)
                {
                    console.log(e3);
                }
            }

        }
    }

    sendDataToServer();
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
    }
    else
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
    }
    else
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
    return new Date(new Date().getTime() + gg_license_info.time);
}
