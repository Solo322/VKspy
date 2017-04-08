import Ember from 'ember';
import VKUser from './../objects/vk-user';

const {remote} = require('electron');
const {BrowserWindow, ipcMain} = remote;

export default Ember.Component.extend({

    /**
     * Автозированные пользователи
     * @type {Array}
     */
    authUsers: [],

    /**
     * No default div around the element.
     */
    tagName: '',

    authUsersChanged: function() {
        // TODO сделать запись один раз при выходе из программы!
        var fs = require('fs');
        fs.writeFile('cookie.json', JSON.stringify(this.get('authUsers'), null, 2) , 'utf-8', function(){} );   
    }.observes('authUsers.[]'),

    init(){
        this._super(...arguments);
        console.log('vk-log-in::init');
        let fs = require('fs');
        if (fs.existsSync('cookie.json')) {
            let contents = fs.readFileSync('cookie.json', 'utf-8');
            if( contents.length ){
                let saved_users = JSON.parse(contents);
                for(let i = 0; i < saved_users.length; i++){
                    let user = VKUser.create(saved_users[i]);
                    this.get('authUsers').pushObject( user );
                }
                // Если текущий пользователь еще не проиницилизирован, то зададим первого попавшегося
                if( !this.get('VKSpy').user && this.get('authUsers').length > 0 ){
                    this.get('VKSpy').set('user', this.get('authUsers')[0] );
                }
            }
        }
        if( !this.get('VKSpy').user ){
            console.log( 'нет пользователей' );
            //Если вообще нет пользователей, то сразу кинем окно авторизации
            this.logIn();
        }
    },

    // didReceiveAttrs() {
    //     this._super(...arguments);
    //     this.get('controller').on('currentUserChanged', this, function(){
    //         if( !this.get('VKSpy').user && this.get('authUsers').length === 0 ){
    //             this.logIn();   
    //         }
    //     });
    // },



    addUser( user ){
        let finded_user = this.get('authUsers').findBy( 'id', user.id );
        if( finded_user ){
            this.get('authUsers').removeObject(finded_user);
        }
        this.get('authUsers').pushObject(user);
        this.get('VKSpy').set('user', user);
    },

    logIn(){
        let _this = this;
        // ссылка на текущий BrowserWindow
        const current = BrowserWindow.getFocusedWindow();

        // создаем новое окно по нажатии с необходимым URL
        let vkWindow = new BrowserWindow({
            width: 800,
             height: 600,
             parent: current
        });

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
            _this.get('VKSpy').userGet( token, function( response ){
                let user = VKUser.create({
                    firstName: response.response[0].first_name,
                    lastName: response.response[0].last_name,
                    id: response.response[0].uid,
                    token: token,
                    photo_50: response.response[0].photo_50,
                });
                _this.addUser( user );
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
                vkWindow.close();
            }
        });

        function getURLParam(url, param_name) {
          let vars = url.split("&");
          for (let i = 0; i < vars.length; i++) {
            let pair = vars[i].split("=");
            if (pair[0] === param_name) {
              return pair[1];
            }
          } 
        }
    },

    actions: {
        selectUser( item ){
            this.get('authUsers').set('currentUser',item);
        },

        removeUser( item ){
            if( this.get('VKSpy').user.id === item.id ){
                this.get('VKSpy').set('user', null);
            }
            this.get('authUsers').removeObject( item );
        },

        currentUser(){
            console.log(this.get('VKSpy').user);  
        },

        logIn(){
            this.logIn();
        },
    }
});
