import Ember from 'ember';
import VKDialog from './../objects/vk-dialog';

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
    dialogsSortingDesc: ['date:desc'],
    sortedDialogs: Ember.computed.sort('dialogs', 'dialogsSortingDesc'),

    messages: [],
    messagesSortingDesc: ['date'],
    sortedMessages: Ember.computed.sort('messages', 'messagesSortingDesc'),    

    inDialogObserver: Ember.observer('inDialog', function() {
        if(!this.get('inDialog')){;
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
        let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
        if( !this.get('currentUser') )
        {
            this.set('dialogs', []);
            return;
        }
        url += this.get('currentUser').token;
        url += "&count=" + DIALOG_COUNT;

        $.getJSON(url).then(data => {
            if( data.error )
                alert('Пользователь не авторизован');
            data.response.shift();
            for (var i = data.response.length - 1; i >= 0; i--) {
                let contex = this;
                let dialog_response = data.response[i];
                console.log(dialog_response)
                // Чатики пока игнорируем
                if(dialog_response.chat_id)
                    continue;
                this.get('vkUsers').getUserByID( data.response[i].uid, function( user )
                {
                    let find_dialog = contex.get('dialogs');
                    if( find_dialog && find_dialog.findBy( 'user.id', user.id))
                    {
                        find_dialog.lastMsg = dialog_response.body;
                        find_dialog.date = dialog_response.date;
                    }
                    else
                    {
                        let dialog = VKDialog.create(
                        {
                            user: user,
                            lastMsg: dialog_response.body,
                            date: dialog_response.date,
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
            this.get('vkUsers').getUserByID( dialog.uid, function( user )
            {
                console.log('user');
                console.log(user);
                console.log(dialog);
            } );
        },

        goToDialog( dialog ){
            let url = "https://api.vk.com/method/messages.getHistory?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&count=" + MESSAGE_COUNT;
            url += "&user_id=";
            url += dialog.user.id;
            this.set('companion',dialog.user.id);
            this.set('inDialog', true);

            $.getJSON(url).then(data => {
                console.log('getHistory');
                console.log(data);
                data.response.shift();
                this.set('messages', data.response.reverse())
            });
        },

        goToBack(){
            this.set( 'inDialog', false );
        },

        sendMessage()
        {
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

            $.getJSON(url).then(data => {
            });
            this.set('messageText', '');
        },
    }
});
