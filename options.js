"use strict";

var gg_socket_listeners = [];
var gg_websocket;

$("#fullpage").attr('href', chrome.runtime.getURL('popup.html'));

$(document).ready(function ()
{
    ff_main();
});


function ff_main()
{
     ff_load_license_from_db();
     $("#aat-version").append('Version:'+chrome.runtime.getManifest().version);
   
    $("#save").click(function ()
    {      
          var str = $("#clicktime").val().trim();
        var ret;
       debugger;
        if (str.length) {
            if ((str.length < 5 || (!str.match(/^\d+:\d+:\d+$/) && !str.match(/^\d+:\d+:\d+\.\d\d$/))))
            {
                alert("Invalid Clicktime format1");
                return;
            }
            if (str.match(/^\d+:\d+:\d+$/)) {
                var arr = str.split(/:/);

                if (arr.length != 3)
                {
                    alert("Invalid Clicktime format2");
                    return;
                }

                if (+arr[0] > 23 || +arr[1] > 59 || +arr[2] > 59)
                {
                    alert("Invalid Clicktime format3");
                    return;
                }
            }
            else
            if (ret = str.match(/(^\d+):(\d+):(\d+).(\d\d)$/)) {
                console.log(ret);

                if (!ret)
                {
                    alert("Invalid Clicktime format2");
                    return;
                }

                if (+ret[1] > 23 || +ret[2] > 59 || +ret[3] > 59)
                {
                    alert("Invalid Clicktime format3");
                    return;
                }
            }
        }
        ff_set_in_storage({str: str}, "clicktime");
        var email = $("#email").val().trim();

        if (email.length && !validateEmail(email))
        {
            alert("invalid email");
            return;
        }

        var hostname = $("#hostname").val().trim();

        ff_set_in_storage({         
            email: email,
            hostname: hostname,          
        }, "user_details");
        ff_update_license($("#anu-license-1").val().trim());
    });

    ff_get_from_storage(function (obj) {
       
        if ("email" in obj)
        {
            console.log("email=" + obj.email);

            $("#email").val(obj.email);
        }
        if ("hostname" in obj)
        {
            console.log("hostname=" + obj.hostname);

            $("#hostname").val(obj.hostname);
        }       

    }, "user_details");
    
     ff_get_from_storage(function (obj) {
        if ("str" in obj)
        {
            $("#clicktime").val(obj.str);
        }
    }, "clicktime");

}
