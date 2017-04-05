import Ember from 'ember';
import VKDialog from './../objects/vk-dialog';
import VKMessage from './../objects/vk-message';

const DIALOG_COUNT = 5;


export default Ember.Component.extend({

    /**
     * Диалоги текущего пользователя
     * @type {Array}
     */
    dialogs: [],
    /**
     * Критерий сортировки диалогов
     */
    dialogsSortingDesc: ['message.date:desc'],
    /**
     * Диалоги отсортированные по дате
     * @type {Array}
     */
    sortedDialogs: Ember.computed.sort('dialogs', 'dialogsSortingDesc'),

    didReceiveAttrs() {
        this._super(...arguments);
        this.getDialogs();
        this.get('controller').on('currentUserChanged', this, this.currentUserChanged);
    },

    didUpdateAttrs() {
        this._super(...arguments);
        this.getDialogs();
    },

    currentUserChanged(){
        console.log('user-dialogs::currentUserChanged');
        this.getDialogs();
    },

    getDialogs(){
        this.set('dialogs', []);

        console.log('user-dialogs::getDialogs');
        if( !this.get('VKSpy').user ){
            return;
        }
        let url = "https://api.vk.com/method/messages.getDialogs?access_token=";
        url += this.get('VKSpy').user.token;
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
                    let img = null;
                    if (dialog_response.message.attachments) {
                        type = dialog_response.message.attachments[0].type;
                        if (dialog_response.message.attachments[0].type === "sticker") {
                            img = dialog_response.message.attachments[0].sticker.photo_128;
                        }
                        else if (dialog_response.message.attachments[0].type === "photo") {
                            img = dialog_response.message.attachments[0].photo.photo_130;
                        }
                        else if (dialog_response.message.attachments[0].type === "gift") {
                            img = dialog_response.message.attachments[0].gift.thumb_96;
                        }
                    }
                    else if (dialog_response.message.fwd_messages)
                    {
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
                        find_dialog.message.Img = img;
                    }
                    else {
                        let message = VKMessage.create({
                            text: dialog_response.message.body,
                            date: dialog_response.message.date,
                            type: type,
                            out: dialog_response.message.out,
                            readState: dialog_response.message.read_state,
                            Img: img,
                        });
                        let dialog = VKDialog.create({
                            user: user,
                            message: message,
                            unread: dialog_response.unread,                             
                        });
                        contex.get('dialogs').pushObject(dialog);
                    }
                });
            }
        });
    },

    actions: 
    {
        consoleDlgInfo( dialog ){
            console.log( 'consoleDlgInfo' );
            console.log( dialog );
            console.log(this.get('vkUsers').users);
            this.get('vkUsers').getUserByID( dialog.user.id, function( user ){
                console.log('user');
                console.log(user);
                console.log(dialog);
            } );
        },

        goToDialog( user_id ){
            console.log('user-dialogs::goToDialog');
            this.get('controller').send( 'goToDialog', user_id );
        },
    }
});
