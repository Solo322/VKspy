import Ember from 'ember';
import VKMessage from './../objects/vk-message';


export default Ember.Controller.extend(Ember.Evented, {

    VKService: Ember.inject.service('vk-spy'),
    currentUser: Ember.computed.alias('VKService.user'),
    currentUserChanged: Ember.observer('VKService.user', function() {
        console.log('Controller::currentUserChanged');
        Ember.run.once(this, 'currentUserChangedTrigger');
        Ember.run.once(this, 'longPopServer');
    }),

    // Переменные для подписки на события
    server: null,
    key: null,
    ts: null,

    init(){
        console.log('Controller::init');
        // TODO если тут не дергать currentUser, то событие обсервера не будет срабатывать...  
        console.log( this.get('currentUser') );
        this.longPopServer();
    },

    currentUserChangedTrigger(){
        console.log('Controller::currentUserChangedTrigger');
        this.trigger( 'currentUserChanged' );
    },

    longPopServer(){
        if( !this.get('currentUser') ){
            return;
        }
        let url = "https://api.vk.com/method/messages.getLongPollServer?access_token=";
        url += this.get('currentUser').token;
        url += "&need_pts=0";
        let _this = this;

        $.getJSON(url).then(data => {
            if( data.response ){
                _this.server = data.response.server;
                _this.key = data.response.key;
                _this.ts = data.response.ts;

                _this.requestToLongPopServer();
            }
        }); 
    },

    requestToLongPopServer(){
        console.log('requestToLongPopServer');
        let url = "https://" + this.server;
        url += "?act=a_check&key=" + this.key;
        url += "&ts=" + this.ts;
        url += "&wait=25&mode=2&version=1";
        let _this = this;
        $.getJSON(url).then(data => {
            if( _this.ts === data.ts ){
                _this.requestToLongPopServer();
                return;
            }
            _this.ts = data.ts;
            console.log('requestToLongPopServer answer');
            console.log( data );
            for( let i = 0; i < data.updates.length; i++ ){
                if( data.updates[i][0] === 4 ){
                    // Получено новое сообщение
                    console.log('MESSAGE!!!');
                    _this.get('VKSpy').getMessageByID( data.updates[i][1], function( message ){
                        _this.trigger( 'newMessageTrigger', message );
                    });
                }
                else if( data.updates[i][0] === 6 || data.updates[i][0] === 7 ){
                    // 6 Я прочитал сообщения
                    // 7 Собеседник прочитал мои сообщения
                    let out = data.updates[i][0] === 7 ? 1 : 0;
                    _this.trigger( 'readMessageTrigger', { out:out, user_id: data.updates[i][1] } );
                }
            }
            _this.requestToLongPopServer();
        }); 
    },

    actions: {

        toggleBody() {
            console.log('toggleBody');
            console.log(this.get('authService.currentUser'));
        },

        goToDialog( user ){
            console.log( 'Controller::goToDialog' );
            this.trigger( 'goToDialog', user );
        },
    }
});
