import Ember from 'ember';

export default Ember.Controller.extend(Ember.Evented, {


    authService: Ember.inject.service('auth-users'),
    currentUser: Ember.computed.alias('authService.currentUser'),
    currentUserChanged: Ember.observer('authService.currentUser', function() {
        console.log('Controller::currentUserChanged');
        Ember.run.once(this, 'currentUserChangedTrigger');
        Ember.run.once(this, 'longPopServer');
    }),

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
        let SERVICE = this;

        $.getJSON(url).then(data => {
            SERVICE.server = data.response.server;
            SERVICE.key = data.response.key;
            SERVICE.ts = data.response.ts;

            SERVICE.requestToLongPopServer();
        }); 
    },

    requestToLongPopServer(){
        console.log('requestToLongPopServer');
        let url = "https://";
        url += this.server;
        url += "?act=a_check&key=";
        url += this.key;
        url += "&ts=";
        url += this.ts;
        url += "&wait=25&mode=2&version=1";
        let SERVICE = this;
        $.getJSON(url).then(data => {
            if( SERVICE.ts === data.ts ){
                SERVICE.requestToLongPopServer();
                return;
            }
            SERVICE.ts = data.ts;
            console.log('requestToLongPopServer answer');
            console.log( data );
            for( let i = 0; i < data.updates.length; i++ ){
                if( data.updates[i][0] === 4 ){
                    // Получено новое сообщение
                    console.log('MESSAGE!!!');
                    if( data.updates[i][3] === SERVICE.get('companion') ){
                        this.getMessageByID( data.updates[i][1] );
                    }
                }
                else if( ( data.updates[i][0] === 7 || data.updates[i][0] === 6 ) ){
                    // 7 Собеседник прочитал мои сообщения
                    // 6 Я прочитал сообщения
                    if( data.updates[i][1] === SERVICE.get('companion') ){
                        let out = data.updates[i][0] === 7 ? 1 : 0;
                        this.get('messages').forEach(function(item, index, enumerable) {
                            if( Ember.get(item, 'out') === out ){
                                Ember.set(item, "readState", 1);   
                            }
                        });
                    }
                }
            }
            SERVICE.requestToLongPopServer();
        }); 
    },

    getMessageByID( message_id ){
        let url = "https://api.vk.com/method/messages.getById?access_token=";
        url += this.get('authUsers').getCurrentUser().token;
        url += "&message_ids=" + message_id;

        $.getJSON(url).then(data => {
            data.response.shift();
            for (var i = data.response.length - 1; i >= 0; i--) {
                let type = null;
                let sticker = null;
                if (data.response[i].attachments) {
                    type = data.response[i].attachments[0].type;
                    if (data.response[i].attachment[0].type === "sticker") {
                        sticker = data.response[i].attachment[0].sticker.photo_64;
                    }
                }
                else if (data.response[i].fwd_messages) {
                    type = "forward messages";
                }
                 let message = VKMessage.create({
                        text: data.response[i].body,
                        date: data.response[i].date,
                        type: type,
                        out: data.response[i].out,
                        readState: data.response[i].read_state,
                        stickerImg: server,
                    });
                 console.log( 'getMessageByID' );
                 console.log( message );
                 this.get("messages").pushObject(message);
            }
        });
    },

    helloWorld(){
        alert('helloWorld');
    },


    actions: {

        toggleBody() {
            console.log('toggleBody');
            console.log(this.get('authService.currentUser'));
          // this.toggleProperty('isExpanded');
          // console.log('toggleBody');
          // this.trigger('loginDidFail');
        },

        sendData(data) {
          alert(data);
        },

        goToDialog( user_id ){
            console.log( 'Controller::goToDialog' );
            this.trigger( 'goToDialog', user_id );
        },
    }
});
