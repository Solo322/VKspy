import Ember from 'ember';
import VKDialog from './../objects/vk-dialog';
import VKMessage from './../objects/vk-message';

const DIALOG_COUNT = 5;
const MESSAGE_COUNT = 10;


export default Ember.Component.extend({

    authService: Ember.inject.service('auth-users'),
    currentUser: Ember.computed.alias('authService.currentUser'),
    currentUserChanged: Ember.observer('currentUser', function() {
        console.log('currentUserChanged');
        Ember.run.once(this, 'getDialogs');
        Ember.run.once(this, 'longPopServer');
    }),

    companion: null,
    inDialog: null,

    dialogs: [],
    dialogsSortingDesc: ['message.date:desc'],
    sortedDialogs: Ember.computed.sort('dialogs', 'dialogsSortingDesc'),

    messages: [],
    messagesSortingDesc: ['date'],
    sortedMessages: Ember.computed.sort('messages', 'messagesSortingDesc'),    

    inDialogObserver: Ember.observer('inDialog', function() {
        if(!this.get('inDialog')){
            this.getDialogs();
        }
    }),

    server: null,
    key: null,
    ts: null,

    _setup: Ember.on('didInsertElement', function(){
        this.on('getCurrentUserCall', this, 'helloWorld');
    }),

    helloWorld(){
        console.log('HELLO WORLD');
    },

    didReceiveAttrs() {
        this._super(...arguments);
        this.getDialogs();
        this.longPopServer();
    },

    didUpdateAttrs() {
        this._super(...arguments);
        this.getDialogs();
    },

    longPopServer(){
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

    goToDialog( user_id ){
        this.set("messages", []);

        let url = "https://api.vk.com/method/messages.getHistory?access_token=";
        url += this.get('authUsers').getCurrentUser().token;
        url += "&count=" + MESSAGE_COUNT;
        url += "&user_id=";
        url += user_id;
        this.set('companion',user_id);
        this.set('inDialog', true);

        $.getJSON(url).then(data => {
            data.response.shift();
            for (var i = data.response.length - 1; i >= 0; i--) {
                let type = null;
                let sticker = null;
                if (data.response[i].attachments) {
                    type = data.response[i].attachments[0].type;
                    if (data.response[i].attachments[0].type === "sticker") {
                        sticker = data.response[i].attachments[0].sticker.photo_64;
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
                        stickerImg: sticker,
                    });
                this.get("messages").pushObject(message);
            }
            console.log('getHistory');
            console.log(data);
        });
    },




    getDialogs(){
        this.set('dialogs', []);

        if( !this.get('currentUser') ){
            return;
        }
        let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
        url += this.get('currentUser').token;
        url += "&count=" + DIALOG_COUNT;
        url += "&unread=0";
        url += "&v=5.63";

        $.getJSON(url).then(data => {
            if( data.error ){
                alert('Пользователь не авторизован');
                return;
            }

            console.log( 'getDialogs' );
            console.log( data );

            //data.response.shift();
            for (var i = data.response.items.length - 1; i >= 0; i--) {
                let contex = this;
                let dialog_response = data.response.items[i];
                console.log(dialog_response);
                // Чатики пока игнорируем
                if(dialog_response.message.chat_id){
                    continue;
                }
                this.get('vkUsers').getUserByID( data.response.items[i].message.user_id, function( user ){
                    let find_dialog = contex.get('dialogs');
                    let type = null;
                    let sticker = null;
                    if (dialog_response.attachments) {
                        type = dialog_response.attachments[0].type;
                        if (dialog_response.attachments[0].type === "sticker") {
                            sticker = dialog_response.attachments[0].sticker.photo_64;
                        }
                    else if (dialog_response.message.fwd_messages) {
                        type = "forward messages";
                    }
                    if( find_dialog && find_dialog.findBy( 'user.id', user.id))
                    {
                        find_dialog.message.text = dialog_response.message.body;
                        find_dialog.message.date = dialog_response.message.date;
                        find_dialog.message.type = type;
                        find_dialog.message.out = dialog_response.message.out;
                        find_dialog.message.readState = dialog_response.message.read_state;
                        find_dialog.unread = dialog_response.unread;
                        find_dialog.message.stickerImg = sticker;
                    }
                    else
                    {
                        let message = VKMessage.create({
                            text: dialog_response.message.body,
                            date: dialog_response.message.date,
                            type: type,
                            out: dialog_response.message.out,
                            readState: dialog_response.message.read_state,
                            stickerImg: sticker,
                        });
                        let dialog = VKDialog.create(
                        {
                            user: user,
                            message: message,
                            unread: dialog_response.unread,                             
                        });
                        contex.get('dialogs').pushObject(dialog);
                    }
                };
            }
        });
    },

    actions: 
    {
        moreMessages(){
            let url = "https://api.vk.com/method/messages.getHistory?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&offset=" + this.get('messages').length;
            url += "&count=" + MESSAGE_COUNT;
            url += "&user_id=";
            url += this.get('companion');

            $.getJSON(url).then(data => {
                data.response.shift();
                for (var i = data.response.length - 1; i >= 0; i--) {
                    let type = null;
                    let sticker = null;
                    if (data.response[i].attachments) {
                        type = data.response[i].attachments[0].type;
                        console.log();
                        if (data.response[i].attachments[0].type === "sticker") {
                            sticker = data.response[i].attachments[0].sticker.photo_64;
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
                            stickerImg: sticker,
                        });
                     this.get("messages").pushObject(message);
                }
                console.log('getHistory');
                console.log(data);
            });
        },

        // Test func
        getCurrentUser(){
            console.log('getCurrentUser!!!!!');
            console.log(this.get('currentUser'));
        },

        consoleDlgInfo( dialog )
        {
            console.log( 'consoleDlgInfo' );
            console.log( dialog );
            console.log(this.get('vkUsers').users);
            this.get('vkUsers').getUserByID( dialog.user.id, function( user ){
                console.log('user');
                console.log(user);
                console.log(dialog);
            } );
        },

        setActivity(){
            let url = "https://api.vk.com/method/messages.setActivity?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&user_id=" + this.get('companion');
            url += "&type=typing";
            $.getJSON(url).then(data =>{
                console.log('setActivity');
            });
        },

        goToDialog( user_id ){
            this.set("messages", []);

            let url = "https://api.vk.com/method/messages.getHistory?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&count=" + MESSAGE_COUNT;
            url += "&user_id=";
            url += user_id;
            this.set('companion',user_id);
            this.set('inDialog', true);

            $.getJSON(url).then(data => {
                data.response.shift();
                for (var i = data.response.length - 1; i >= 0; i--) {
                    let type = null;
                    let sticker = null;
                    if (data.response[i].attachments) {
                        type = data.response[i].attachments[0].type;
                        if (data.response[i].attachments[0].type === "sticker") {
                            sticker = data.response[i].attachments[0].sticker.photo_64;
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
                            stickerImg: sticker,
                    });
                    this.get("messages").pushObject(message);
                }
                console.log('getHistory');
                console.log(data);
            });
        },

        goToBack(){
            this.set( 'inDialog', false );
        },

        sendMessage(){
            let url = "https://api.vk.com/method/messages.send?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&message=";
            url += encodeURIComponent(this.get('messageText'));
            url += "&user_id=";
            url += this.companion;
            $.getJSON(url);
            this.set('messageText', '');
        },
    }
});
