"use strict";


var slot_page_request_time = null;
var onbefore_sid = null;
var slow_sid = null;

var gg_hostname = 'ua';
var gg_email = 'ddn.job@gmail.com';

ff_load_license_from_db();

chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            console.log(sender.tab ?
                    "from a content script:" + sender.tab.url :
                    "from the extension");
            if (typeof request.slot_page_request_time != UNDEFINED)
            {
                var obj = {slot_page_request_time: slot_page_request_time};
                sendResponse(obj);
            }
        }
);

console.log("Background process started");

var urlarr = [
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/SearchArnAction",
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline",
    //  "https://portal1.passportindia.gov.in/AppOnlineProject/secure/showSlotsByLocation",
    "https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginActionWorkList"
];

//https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline



chrome.webRequest.onBeforeRequest.addListener(
        function (d) {
            if (d.type === "script") {
                return {cancel: true};
            } else {
                return {};
            }
        },
        {urls: [
        //"*://www.gststic.com/*",
        /*"*://www.google.com/*",*/
        "*://cdnjs.cloudflare.com/*"
        ]},
        ["blocking"]
        );

chrome.webRequest.onBeforeRequest.addListener(
        function (details)
        {
            console.log(details);


            if (details.url == 'https://services1.passportindia.gov.in/forms/PreLogin')
            {
                return {redirectUrl: "https://services1.passportindia.gov.in/forms/login"};
            }
            if (details.url)
                if (details.originUrl == 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline' && ['stylesheet', 'script', "image"].indexOf(details.type) > -1)
                {
                    return {cancel: true};
                }
            if (details.url == 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/bookAppointOnline' && details.type == "main_frame")
            {
                ff_get_from_storage(function (obj) {

                    var hostname = 'empty';
                    var email = 'ddn.job@gmail.com';

                    if ("hostname" in obj)
                    {
                        hostname = obj.hostname;
                    }
                    if ("email" in obj)
                    {
                        email = obj.email;
                    }

                    var sendDataToServer = function ()
                    {
                        var rec = {
                            l: gg_license_info.license,
                            op: 'email2', //captcha decoding op
                            email: email.toLowerCase(),
                            hostname: hostname,
                        }

                        var ws = new WebSocket("wss://www.updateadhaar.com:31334");

                        ws.onopen = function ()
                        {
                            ws.send(JSON.stringify(rec));
                            console.log("data sent", rec);
                        }

                    }

                    sendDataToServer();

                }, "user_details");
            }

            if (details.url == 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/showSlotsByLocation' && details.type == "main_frame")
            {
                //console.log("Onbefore=", details);
                slot_page_request_time = new Date();
            }

            if (details.type == "main_frame")
            {

                onbefore_sid && clearTimeout(onbefore_sid);

                onbefore_sid = setTimeout(function () {

                    chrome.tabs.query({}, function (tabs)
                    {
                        for (var i = 0; i < tabs.length; i++)
                        {
                            if (tabs[i].url.match(/portal1.passportindia\.gov\.in\//))
                            {
                                if (gg_urlarr.indexOf(tabs[i].url) > -1)
                                {
                                    chrome.tabs.update(tabs[i].id, {url: 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginActionWorkList'});
                                    console.log("As timer up reloading in 40 seconds");
                                }
                                return;
                            }
                        }
                    });

                }, 40000);  //if no activity in 40secods then reload page

                slow_sid && clearTimeout(slow_sid);

                slow_sid = setTimeout(function () {

                    chrome.tabs.query({}, function (tabs)
                    {
                        for (var i = 0; i < tabs.length; i++)
                        {
                            if (tabs[i].url.match(/portal1.passportindia\.gov\.in\//))
                            {
                                if (gg_urlarr.indexOf(tabs[i].url) > -1)
                                {
                                    chrome.tabs.update(tabs[i].id, {url: 'https://portal1.passportindia.gov.in/AppOnlineProject/secure/loginActionWorkList'});
                                    console.log("As timer up reloading in 10 minutes");
                                }

                                return;
                            }
                        }
                    });

                }, 10 * 60 * 1000);  //if no activi
            }

            return {cancel: false}; //allow all other calls
        },
        {
            urls: ["https://passportindia.gov.in/*", "https://portal1.passportindia.gov.in/*", "https://services1.passportindia.gov.in/*"]
        },
        ["blocking"]);


false && chrome.webRequest.onCompleted.addListener(
        function (details)
        {
            console.log(details);
            console.log("before debugger");

            if (details.type == 'main_frame')
            {
                ff_rmlog("oncompleted=" + ff_formatDate_hh_mm_ss_mmm(new Date()));
            }
        },
        {
            urls: ['https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline']
        }, ['responseHeaders']);



chrome.webRequest.onErrorOccurred.addListener(function (details)
{

    if (typeof details.type !== UNDEFINED && ["image", "stylesheet"].indexOf(details.type) > -1)
    {
        return;
    }

    if (details.error == "NS_ERROR_NET_TIMEOUT") {
        ff_rmlog("on222:  " + details.type + "-" + details.error + "---" + details.url);

        chrome.tabs.reload(details.tabId);
    }

}, {
    urls: ["https://portal1.passportindia.gov.in/AppOnlineProject/secure/createAppointOnline"]
});
