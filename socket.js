var gg_websocket_upd = null;
var gg_websockettimeoutid = null;
var gg_captcha_server = "forum.bookrailticket.com";

chrome.runtime.onConnect.addListener(function (port)
{
    console.log("Connected to a port");

    var fun = function (request) {

        console.log("Background request received:%o", request);

        if ('op' in request && request.op == "sndpskdata")
        {
            console.log("Making request for pskdata");

            if (!gg_websocket_upd || gg_websocket_upd.readyState == 3)
            {
                console.log("Created gg_websocket_upd");
                gg_websocket_upd = new WebSocket("wss://" + gg_captcha_server + ':31333');

                gg_websocket_upd.onopen = function (evt)
                {
                    console.log("in onopen");

                    //set it cancel after 40 seconds
                    if (gg_websockettimeoutid)
                    {
                        clearTimeout(gg_websockettimeoutid);
                    }

                    gg_websockettimeoutid = setTimeout(
                            function ()
                            {
                                if (gg_websocket_upd)
                                {
                                    //gg_websocket_upd.close();
                                    //gg_websocket_upd = null;
                                }
                                gg_websockettimeoutid = null;
                            },
                            40000
                            );

                    ff_sendRequest(request, gg_websocket_upd);

                } //on open event
                gg_websocket_upd.onclose = function (evt)
                { /* do stuff */
                    console.log("Socket closed");
                    gg_websocket_upd = null;
                }; //on close event
                gg_websocket_upd.onmessage = function (evt)
                {
                    console.log('Server response:%o ', evt);
                    try
                    {
                        var obj = JSON.parse(evt.data);

                        port.postMessage(obj);//                      
                    }
                    catch (ex5)
                    {
                        console.log("Exception caught:%o", ex5);
                    }
                    //gg_websocket_upd.close()
                }; //on message event
                gg_websocket_upd.onerror = function (evt)
                {
                    console.log("In onerror : %O", evt);
                    try
                    {
                        gg_websocket_upd.close();
                        gg_websocket_upd = null;
                    }
                    catch (e3)
                    {
                        console.log(e3);
                    }
                }; //on error event
            }
            else
            {
                console.log("Websocket already open");
                gg_websocket_upd.onmessage = function (evt)
                {
                    console.log('Server response:%o ', evt);
                    console.log("port name=" + port.name);
                    try
                    {
                        var obj = JSON.parse(evt.data);

                        port.postMessage(obj);//                      
                    }
                    catch (ex5)
                    {
                        console.log("Exception caught:%o", ex5);
                    }
                    //gg_websocket_upd.close()
                }; //on message event

                console.log("gg_websocket_upd already open");
                ff_sendRequest(request,gg_websocket_upd);
            }
        }

        else
        {
            console.log("Unidentified request found!");
        }

    }


    //console.assert(port.name == "captchaport");
    port.onMessage.addListener(fun
            );
});
function ff_sendRequest(request, gg_websocket)
{
    
    console.log("request=", request);

    var payload = JSON.stringify(request);
    console.log("payload length=" + payload.length);
    console.log("payload=", payload);
    //console.log(payload);

    // Wait until the state of the socket is not ready and send the message when it is...
    waitForSocketConnection(gg_websocket, function ()
    {
        console.log("message sent!!!");
        gg_websocket.send(payload);
    });
}

// Make the function wait until the connection is made...
function waitForSocketConnection(socket, callback)
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
                    console.log("wait for connection...")
                    waitForSocketConnection(socket, callback);
                }

            }, 10); // wait 5 milisecond for the connection...
}
