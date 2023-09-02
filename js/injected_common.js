"use strict";
//This contains only common code needed for js injecting scripts



//inject file so it immediately executes before the page is loaded
function ff_do_embed_code(func_name)
    {
        var s = document.createElement('script');
        s.textContent = '(' + func_name.toString() + ')();';
        document.documentElement.appendChild(s);

        console.log("Inject finished", new Date().getTime());
    }



//inject file so that it can access the web page
function ff_do_embed_script(file)
    {
        var s = document.createElement('script');
        // TODO: add "script.js" to web_accessible_resources in manifest.json
        s.src = chrome.extension.getURL(file);
        s.onload = function ()
            {
                this.parentNode.removeChild(this);
            };
        (document.head || document.documentElement).appendChild(s);
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
                                        obj = {};
                                    }

                                cb(obj);

                                return;

                            }
                        catch (e3)
                            {
                                console.log(e3);
                                console.log('77huyt');
                                cb({}); //send empty object
                            }

                        console.log('unable to find property :' + name);
                    }
        );

    }

