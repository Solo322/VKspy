import Ember from 'ember';
import VKSpy from './../vk_api/vk';
import VKUser from './../objects/vk-user';

const {remote} = require('electron');
const {BrowserWindow, ipcMain} = remote;
let auth_users = null;

export default Ember.Component.extend({
    actions: {
        selectUser( item ){
            this.get('authUsers').set('currentUser',item);
        },

        removeUser( item ){
            this.get('authUsers').remove( item );
        },

        currentUser(){
          console.log(this.get('authUsers').getCurrentUser());  
        },

        logIn(){
            auth_users = this.get('authUsers');
            // ссылка на текущий BrowserWindow
            const current = BrowserWindow.getFocusedWindow();

            // создаем новое окно по нажатии с необходимым URL
            let vkWindow = new BrowserWindow({
                width: 800,
                 height: 600,
                 parent: current
            });
            // current.webContents.session.cookies.get(
            //   {}, 
            //  function( err, cookies )
            //  {
            //     console.log( 'Cookies' );
            //     console.log( cookies );  
            //  }
            // )

            current.webContents.session.clearStorageData({
                    storages: [
                        'cookies',
                    ],
                    quotas: [
                        'temporary',
                        'persistent',
                        'syncable',
                    ],
                }
            );

            vkWindow.loadURL('https://oauth.vk.com/authorize?client_id=5927655&redirect_uri=https://oauth.vk.com/blank.html&scope=messages,friends,video,offline&display=popup&response_type=token');

            // подписываем главное окно на событие query
            // и в случае перехвата алертим его данные
            ipcMain.on('query', (event, message) => {
                let token = getURLParam( message.split("#")[1], "access_token" );
                let service = new VKSpy( token ); 
                service.userGet( function( response ){
                    
                    console.log( 'user' );
                    console.log(response.response[0]);

                    let user = VKUser.create({
                        firstName: response.response[0].first_name,
                        lastName: response.response[0].last_name,
                        id: response.response[0].uid,
                        token: token
                    });
                    auth_users.add( user );
                    vkWindow.close();
                });
            });

            vkWindow.webContents.on('did-finish-load', function(){
                if( vkWindow.webContents.getURL().search( "access_token" ) !== -1 )
                {
                    vkWindow.webContents.executeJavaScript(
                        "const {ipcRenderer} = require('electron');" + 
                        "let message = document.location.href;" +
                        "ipcRenderer.send('query', message);"
                        );
                }
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
