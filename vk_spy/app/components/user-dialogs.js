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
        this.get('controller').on('newMessageTrigger', this, this.receiveMessage);
        this.get('controller').on('readMessageTrigger', this, this.readMessage);
    },

    didUpdateAttrs() {
        this._super(...arguments);
        this.getDialogs();
    },

    receiveMessage( message ){
        let find_dialog = this.get('dialogs').findBy( 'user.id', message.userID);
        if( find_dialog ){
            find_dialog.set( 'message', message );
            // TODO неправильно
            if( message.out === 0 ){
                // увеличиваем счетчик только если это сообщение НАМ, а не ОТ нас
                find_dialog.incrementProperty( 'unread' );
            }
        }
    },

    readMessage( read_info ){
        let find_dialog = this.get('dialogs').findBy( 'user.id', read_info.user_id);

        if( find_dialog ){
            if( find_dialog.message.out === read_info.out ){
                find_dialog.message.set('readState', 1);
                find_dialog.set('unread', 0);
            }
        }
    },

    currentUserChanged(){
        console.log('user-dialogs::currentUserChanged');
        this.getDialogs();
    },

    getDialogs(){
        console.log('user-dialogs::getDialogs');
        this.set('dialogs', []);
        let _this = this;
        this.get('VKSpy').getDialogs( DIALOG_COUNT, function( data ){

            console.log( 'getDialogs' );
            console.log( data );
            for (let i = data.response.items.length - 1; i >= 0; i--) {
                
                let dialog_response = data.response.items[i];
                console.log(dialog_response);
                // Чатики пока игнорируем
                if(dialog_response.message.chat_id){
                    continue;
                }
                _this.get('vkUsers').getUserByID( data.response.items[i].message.user_id, function( user ){
                    let find_dialog = _this.get('dialogs').findBy( 'user.id', user.id);
                    if( find_dialog ){
                        find_dialog.message.initMessage( dialog_response.message );
                    }
                    else {
                        let message = VKMessage.create();
                        message.initMessage( dialog_response.message );

                        let dialog = VKDialog.create({
                            user: user,
                            message: message,
                            unread: dialog_response.unread,                             
                        });
                        _this.get('dialogs').pushObject(dialog);
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
        },

        goToDialog( user_id ){
            console.log('user-dialogs::goToDialog');
            this.get('controller').send( 'goToDialog', user_id );
        },
    }
});
