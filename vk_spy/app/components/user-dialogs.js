import Ember from 'ember';
import VKDialog from './../objects/vk-dialog';
import VKMessage from './../objects/vk-message';

const DIALOG_COUNT = 30;

let _this = null;

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

    /**
     * No default div around the element.
     */
    tagName: '',

    offset: 0,
    lastOffset: 0,

    didReceiveAttrs() {
        this._super(...arguments);

        _this = this;
        this.getDialogs( 0 );
        this.get('controller').on('currentUserChanged', this, this.currentUserChanged);
        this.get('controller').on('newMessageTrigger', this, this.receiveMessage);
        this.get('controller').on('readMessageTrigger', this, this.readMessage);
    },

    // didUpdateAttrs() {
    //     this._super(...arguments);
    //     this.getDialogs( 0 );
    // },

    didRender() {
        this._super(...arguments);

        $(".friends .nano").bind("scrollend", function(e){
            console.log('scrolltop');
            // Чтобы не дудосить ВК введем такой костылёк
            if( _this.get('lastOffset') !== _this.get('offset') )
                _this.getDialogs( _this.get('offset') );
        });
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
        this.getDialogs( 0 );
    },

    getDialogs( offset ){
        console.log('user-dialogs::getDialogs');
        this.set( 'lastOffset', offset );
        if( offset === 0 ){
            this.set('dialogs', []);
            this.set( 'offset', 0 );
        }
        
        this.get('VKSpy').getDialogs( DIALOG_COUNT, offset, function( data ){

            console.log( 'getDialogs' );
            //console.log( data );
            _this.incrementProperty( 'offset', data.response.items.length );
            for (let i = data.response.items.length - 1; i >= 0; i--) {
                
                let dialog_response = data.response.items[i];
                //console.log(dialog_response);
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

        goToDialog( user ){
            console.log('user-dialogs::goToDialog');
            this.get('controller').send( 'goToDialog', user );
        },
    }
});
