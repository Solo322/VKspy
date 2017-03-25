/* global require */
import VKSpy from './../vk_api/vk';
import Ember from 'ember';


const {remote} = require('electron');
const {BrowserWindow, ipcMain} = remote;

export default Ember.Route.extend({
	actions: {
        sendMsg()
        {
            console.log('inside sendMsg');
            var fs = require('fs');
 
            var contents = fs.readFileSync('cookie.txt', 'utf8');
            console.log('From file');
            console.log(contents);

            let service = new VKSpy( contents );
            service.sendMessage( "47674582", "Hi" );
        },

        setOnline(){
            console.log('inside setOnline');
            var fs = require('fs');
 
            var contents = fs.readFileSync('cookie.txt', 'utf8');
            console.log('From file');
            console.log(contents);

            let service = new VKSpy( contents );
            service.userGet();
        },

		toggleBody(){
            // ссылка на текущий BrowserWindow
			const current = BrowserWindow.getFocusedWindow();
            var fs = require('fs'); // Load the File System to execute our common tasks (CRUD)
            // создаем новое окно по нажатии с необходимым URL

            console.log(current.webContents.session)

            current.webContents.session.cookies.get(
              {}, 
             function( err, cookies )
             {
                console.log( 'Cookies' );
                console.log( cookies );  
             }
            )

            current.webContents.session.clearStorageData(
                {
                    storages: [
                        'cookies',
                    ],
                    quotas: [
                        'temporary',
                        'persistent',
                        'syncable',
                    ],
                }
                //function() {} 
            );

            current.webContents.session.cookies.get(
              {}, 
             function( err, cookies )
             {
                console.log( 'Cookies' );
                console.log( cookies );  
             }
            )

			let vkWindow = new BrowserWindow({
        		width: 800,
        		 height: 600,
        		 parent: current
    		});


    		vkWindow.loadURL('https://oauth.vk.com/authorize?client_id=5927655&redirect_uri=https://oauth.vk.com/blank.html&scope=messages,friends,video,offline&display=popup&response_type=token');

            // подписываем главное окно на событие query
            // и в случае перехвата алертим его данные
    		ipcMain.on('query', (event, message) => {

               fs.writeFile("cookie.txt", getURLParam( message.split("#")[1], "access_token" ), function (err) {
                   if(err){
                       alert("An error ocurred creating the file "+ err.message);
                   }
                                
                   //alert("The file has been succesfully saved");
               });
    		});

            vkWindow.webContents.on('did-finish-load', function(){
                if( vkWindow.webContents.getURL().search( "access_token" ) !== -1 )
                    vkWindow.webContents.executeJavaScript(
                        "const {ipcRenderer} = require('electron');" + 
                        "let message = document.location.href;" +
                        "ipcRenderer.send('query', message);"
                        );
            });

            function getURLParam(url, param_name) {
              var vars = url.split("&");
              console.log(vars);
              for (var i=0;i<vars.length;i++) {
                var pair = vars[i].split("=");
                if (pair[0] === param_name) {
                  return pair[1];
                }
              } 
            }


    	}
	}
});
