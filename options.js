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
     $("#aat-version").append('Version:'+chrome.runtime.getManifest().version);
     
    ff_load_license_from_db();
    $("#save").click(function ()
    {        
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
}
