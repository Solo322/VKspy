import Ember from 'ember';
import VKMessage from './../objects/vk-message';

const MESSAGE_COUNT = 10;

// Чота как то фуфуфу
// Но пока хз как по другому
let _this = null;

export default Ember.Component.extend({

	/**
	 * id пользователя с которым находимся в диалоге
	 * @type {String}
	 */
	userID: null,
	/**
	 * Сообщения диалога
	 * @type {Array}
	 */
    messages: [],
    /**
     * Критерий сортировки сообщений
     */
    messagesSortingDesc: ['date'],
    /**
     * Сообщения отсортированные по дате
     * @type {[type]}
     */
    sortedMessages: Ember.computed.sort('messages', 'messagesSortingDesc'),

    /**
     * No default div around the element.
     */
    tagName: '',

    didReceiveAttrs() {
        this._super(...arguments);
		this.get('controller').on('goToDialog', this, this.goToDialog);
		this.get('controller').on('currentUserChanged', this, this.currentUserChanged);
		this.get('controller').on('newMessageTrigger', this, this.receiveMessage);
        this.get('controller').on('readMessageTrigger', this, this.readMessage);
    },

    currentUserChanged(){
    	this.set("messages", []);
    },

    receiveMessage( message ){
    	console.log('dialog-messages::receiveMessage');
    	console.log( message );
    	if( message.userID === this.get('userID') ){
	    	this.get('messages').pushObject(message);
    	}
    },

    readMessage( read_info ){
        // Если прочиитали соообщения для пользователя с которым в диалоге
        if( read_info.user_id === this.get('userID') ){
            this.get('messages').forEach(function(item, index, enumerable) {
                if( Ember.get(item, 'out') === read_info.out ){
                    Ember.set(item, "readState", 1);   
                }
            });
        }
    },

    goToDialog( user_id ){
    	console.log('dialog-messages::goToDialog');
        this.set("messages", []);

        if(!this.get('VKSpy').user){
        	return;
        }
        this.set('userID',user_id);
        _this = this;
		this.get('VKSpy').getHistory( user_id, MESSAGE_COUNT, 0, this.parseGetHistoryAnswer);
    },

    parseGetHistoryAnswer( data ){
        console.log('parseGetHistoryAnswer');
        console.log(data);
        for (let i = data.response.items.length - 1; i >= 0; i--) {
            let message = VKMessage.create();
            message.initMessage( data.response.items[i] );
            _this.get("messages").pushObject(message);
        }
    },

    actions: 
    {
        toggleBody() {
        	console.log('toggleBody');
            this.get('controller').send( 'toggleBody' );
        },

	    moreMessages(){
	    	_this = this;
	    	this.get('VKSpy').getHistory( this.get('userID'), MESSAGE_COUNT, this.get('messages').length, this.parseGetHistoryAnswer );
		},

        setActivity(){
        	this.get('VKSpy').setActivity( this.get('userID') );
        },

        sendMessage(){
        	this.get('VKSpy').sendMessage( this.get('userID'), this.get('messageText') );
            this.set('messageText', '');
        },
	},
	
});
