/* eslint-disable */
//var fbappid = '220713978118497'
var fbappid = '776254465843486';
// var loginfb = {
// 	appId: '220713978118497'
// };

var button;
var userInfo;
var ACCESS_TOKEN;

window.fbAsyncInit = function() {
    FB.init({ 
    	appId	: fbappid, //change the appId to your appId
        version : 'v2.8',
        status	: true, 
        cookie	: true,
        xfbml	: true,
        oauth	: true
    });
   
   	function updateButton(response) {
        button       =   document.getElementById('fb-auth');
        userInfo     =   document.getElementById('user-info');
        
        if (response.authResponse)
        {
            //user is already logged in and connected
            FB.api('/me', function(info) {
                login(response, info);
            });
            
            button.onclick = function() {
                FB.logout(function(response) {
                    logout(response);
                });
            };
        } 
        else 
        {
            //user is not connected to your app or logged out
            button.innerHTML = '<i class="glyphicon glyphicon-user icon-white"></i> '+'Log in';
            button.onclick = function() {
                FB.login(function(response) {
                    if (response.authResponse) {
                        FB.api('/me', function(info) {
                            login(response, info);
                        });    
                    }
                }, {scope:'email,user_birthday,user_about_me,user_friends'});   
            };
        }
    }
    //scope:'email,user_birthday,status_update,publish_stream,user_about_me,export_stream,read_stream,user_friends'
    
    // run once with current status and whenever the status changes
    FB.getLoginStatus(updateButton);
    FB.Event.subscribe('auth.statusChange', updateButton);  
};

(function() {
    var e = document.createElement('script'); e.async = true;
    e.src = document.location.protocol +
          '//connect.facebook.net/en_US/all.js';
    document.getElementById('fb-root').appendChild(e);
}());


function login(response, info) {
    if (response.authResponse) 
    {
        var accessToken = response.authResponse.accessToken;
        
        userInfo.innerHTML ='<img src="https://graph.facebook.com/' + info.id + '/picture" height="24" width="24">  ' + info.name;
                           //+ "<br /> Your Access Token: " + accessToken;
       //userInfo.innerHTML ='<img src="https://graph.facebook.com/' + info.id + '/picture" height="24" width="24">  ';
        button.innerHTML = '<i class="glyphicon glyphicon-user icon-white"></i> '+'Log out';
        //document.getElementById('other').style.display = "block";

        ACCESS_TOKEN = accessToken;
    }
}

function logout(response) {
    userInfo.innerHTML                             =   "";
    document.getElementById('debug').innerHTML     =   "";
    //document.getElementById('other').style.display =   "none";
    //accessToken = "";
    //ACCESS_TOKEN = accessToken;
}