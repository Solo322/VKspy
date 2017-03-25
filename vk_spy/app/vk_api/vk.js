
'use strinct';

export default class VKSpy
{
    constructor( auth_token )
    {
        this.token = auth_token;        
    }

    sendMessage( user_id, text ){
            
        var script = document.createElement('SCRIPT');  
    
        let str = "https://api.vk.com/method/messages.send?access_token=";
        str += this.token;
        str += "&callback=callbackFunc&message=Test%20message&user_id=";
        str += user_id;
            
        script.src = str;
            
        document.getElementsByTagName("head")[0].appendChild(script); 
 
        function callbackFunc(result) { 
          alert(result); 
        }       
    }

    userGet(){
        function callbackFunc(result) { 
          alert(result); 
        } 
        var script = document.createElement('SCRIPT');  
        let str = "https://api.vk.com/method/users.get?access_token=";
        str += this.token;
        str += "&callback=callbackFunc";            
        script.src = str;
        document.getElementsByTagName("head")[0].appendChild(script);   
    }

    setOnline(){
        var script = document.createElement('SCRIPT');  
    
        let str = "https://api.vk.com/method/account.setOnline?access_token=";
        str += this.token;
        str += "&voip=0";
        script.src = str;
            
        document.getElementsByTagName("head")[0].appendChild(script); 
 
    }
    
}