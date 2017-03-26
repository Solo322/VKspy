'use strinct';

const METHOD_URL = "https://api.vk.com/method/";

export default class VKSpy
{
    constructor( auth_token ){
        this.token = auth_token;        
    }


    sendRequest( url, callback ){
        var request = require('request');
        request(url, function (error, response, body) {
            console.log('error:', error); // Print the error if one occurred
            console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
            if (!error && response.statusCode === 200) {
                let json_body = JSON.parse(body);
                callback(json_body);
            }
        });
    }

    sendMessage( user_id, text ){
        let url = METHOD_URL + "messages.send?access_token=";
        url += this.token;
        url += "&message=";
        url += encodeURIComponent(text);
        url += "&user_id=";
        url += user_id;
        this.sendRequest( url, function(){} );
    }

    userGet( callback ){  
        let url = METHOD_URL + "users.get?access_token=";
        url += this.token;
        this.sendRequest( url, callback );
    }

    setOnline(){
        let url = METHOD_URL + "account.setOnline?access_token=";
        url += this.token;
        url += "&voip=0";
        this.sendRequest( url, function(){} ); 
    }    
}