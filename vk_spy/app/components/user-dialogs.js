import Ember from 'ember';
import VKDialog from './../objects/vk-dialog';
import VKMessage from './../objects/vk-message';

const DIALOG_COUNT = 5;
const MESSAGE_COUNT = 10;

export default Ember.Component.extend({

    authService: Ember.inject.service('auth-users'),
    currentUser: Ember.computed.alias('authService.currentUser'),
    currentUserChanged: Ember.observer('currentUser', function() {
        Ember.run.once(this, 'getDialogs');
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


    didReceiveAttrs() {
        this._super(...arguments);
        this.getDialogs();
    },

    didUpdateAttrs() {
        this._super(...arguments);
        this.getDialogs();
    },

    getDialogs(){
        this.set('dialogs', []);
        let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
        url += this.get('currentUser').token;
        url += "&count=" + DIALOG_COUNT;

        $.getJSON(url).then(data => {
            if( data.error ){
                alert('Пользователь не авторизован');
            }
            data.response.shift();
            for (var i = data.response.length - 1; i >= 0; i--) {
                let contex = this;
                let dialog_response = data.response[i];
                console.log(dialog_response);
                // Чатики пока игнорируем
                if(dialog_response.chat_id){
                    continue;
                }
                this.get('vkUsers').getUserByID( data.response[i].uid, function( user ){
                    let find_dialog = contex.get('dialogs');
                    let type = null;
                    if (dialog_response.attachments) {
                        type = dialog_response.attachments[0].type;
                    }
                    else if (dialog_response.fwd_messages) {
                        type = "forward messages";
                    }
                    if( find_dialog && find_dialog.findBy( 'user.id', user.id))
                    {
                        find_dialog.message.text = dialog_response.body;
                        find_dialog.message.date = dialog_response.date;
                        find_dialog.message.type = type;
                        find_dialog.message.out = dialog_response.out;
                        find_dialog.message.reaadState = dialog_response.read_state;
                    }
                    else
                    {
                        let message = VKMessage.create({
                            text: dialog_response.body,
                            date: dialog_response.date,
                            type: type,
                            out: dialog_response.out,
                            readState: dialog_response.read_state,
                        });
                        let dialog = VKDialog.create(
                        {
                            user: user,
                            message: message,                            
                        });
                        contex.get('dialogs').pushObject(dialog);
                    }
                } );
            }
        });
    },

    actions: 
    {
        // Test func
        getCurrentUser(){
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

        goToDialog( dialog ){
            this.set("messages", []);
            let url = "https://api.vk.com/method/messages.getHistory?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&count=" + MESSAGE_COUNT;
            url += "&user_id=";
            url += dialog.user.id;
            this.set('companion',dialog.user.id);
            this.set('inDialog', true);

            $.getJSON(url).then(data => {
                data.response.shift();
                for (var i = data.response.length - 1; i >= 0; i--) {
                    let type = null;
                    if (data.response[i].attachments) {
                        type = data.response[i].attachments[0].type;
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

            // TODO Неправильно! Вдруг сообщение не отправлено!
            this.get('messages').pushObject({
                body: this.get('messageText'),
                out: 1,
                date: Date.now(),
            });

            $.getJSON(url);
            this.set('messageText', '');
        },
    }
});
