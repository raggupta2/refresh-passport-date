

function ff_albdbk_injected_code()
    {
     

        var gg_original_alert = window.alert;
    


        window.alert =
                function (msg)
                    {

                        console.log("in ff_c1111c=", msg);

                        var textNode = document.createElement('span');
                        textNode.textContent = msg;
                        textNode.setAttribute('id', 'fixedmsg');
                        document.body.appendChild(textNode);
                        textNode.setAttribute("style", "position:fixed;top:300px;font-size:2em;color:red;font-weight:bold;background-color:yellow");
                        setTimeout(function ()
                            {
                                textNode.remove();
                            }, 2000);

                   

                        var ignorable_messages = [
                           
                            /Please wait while page is loading/,
                        ];
                        for (var i = 0; i < ignorable_messages.length; ++i)
                            {
                                if (msg.match(ignorable_messages[i]))
                                    {

                                     
                                        console.log("Ignoring msg2=" + msg);

                                                try
                                                    {
                                                        if ( typeof jQuery.ui == 'undefined')
                                                            {

                                                                $("body").append('<div class="anux"><a href="#" class="anuspanx">close</a><div class="anunotification"></div></div>');

                                                                $(".anux").css({
                                                                    position: 'fixed',
                                                                    bottom: 0,
                                                                    right: 0,
                                                                    width: '50%',
                                                                    height: '50px',
                                                                    backgroundColor: 'red',
                                                                    color: 'white',
                                                                    fontWeight: 'bold',
                                                                    fontSize: '20px',
                                                                    marginLeft: '5px'
                                                                });

                                                                $(".anuspanx").click(function (e)
                                                                    {
                                                                        e.preventDefault();
                                                                        $(this).parent().remove();
                                                                        return false;

                                                                    });



                                                                $(".anunotification").text(msg);


                                                            }
                                                        else
                                                        if ($("#nonblockingdialog").length == 0)
                                                            {
                                                                $('<div id="nonblockingdialog" />').html(msg).dialog({modal: false}).prev(".ui-dialog-titlebar").css("background", "red");
                                                            }
                                                    }
                                                catch (e4)
                                                    {
                                                        console.log(e4);
                                                       // gg_original_alert(msg);
                                                    }
                                            

                                        // setTimeout(function() { gg_original_alert(msg); }, 1);
                                        return;

                                    }
                            }


                        console.log("Cant' ignore msg1=" + msg);
                        gg_original_alert(msg);
                    }

       
    }

ff_do_embed_code(ff_albdbk_injected_code);
