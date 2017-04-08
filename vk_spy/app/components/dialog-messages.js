import Ember from 'ember';
import VKMessage from './../objects/vk-message';

const MESSAGE_COUNT = 30;

// Чота как то фуфуфу
// Но пока хз как по другому
let _this = null;

export default Ember.Component.extend({

	/**
	 * Пользователя с которым находимся в диалоге
	 * @type {String}
	 */
    user:null,
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

    didRender() {
        this._super(...arguments);
        let totalHeight = 0; 
        $("div.message-wrap").each(function(index){ 
            totalHeight += parseInt($(this).height(), 10); 
        }); 
        if(totalHeight >= 650){
            $(".im-history").css("justify-content", "none");
            $(".im-history-wrapper .nano").nanoScroller();
            $(".im-history-wrapper .nano").nanoScroller({ scroll: 'bottom' });
            $(".im-history-wrapper .nano").bind("scrolltop", function(e){
                console.log('scrolltop');
                _this.moreMessages();
            });
        }
    },

    currentUserChanged(){
    	this.set('messages', []);
        this.set('user', null);
    },

    receiveMessage( message ){
    	console.log('dialog-messages::receiveMessage');
    	console.log( message );
    	if( this.get('user') && message.userID === this.get('user').id ){
	    	this.get('messages').pushObject(message);
            this.get('VKSpy').readMessage( this.get('user').id );
    	}
    },

    readMessage( read_info ){
        // Если прочиитали соообщения для пользователя с которым в диалоге
        if( this.get('user') && read_info.user_id === this.get('user').id ){
            this.get('messages').forEach(function(item, index, enumerable) {
                if( Ember.get(item, 'out') === read_info.out ){
                    Ember.set(item, "readState", 1);   
                }
            });
        }
    },

    goToDialog( user ){
    	console.log('dialog-messages::goToDialog');
        this.set("messages", []);
        this.set('user', user);
        _this = this;
		this.get('VKSpy').getHistory( user.id, MESSAGE_COUNT, 0, this.parseGetHistoryAnswer);
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

    moreMessages(){
        _this.get('VKSpy').getHistory( _this.get('user').id, MESSAGE_COUNT, _this.get('messages').length, _this.parseGetHistoryAnswer );
    },

    actions: 
    {
        toggleBody() {
        	console.log('toggleBody');
            this.get('controller').send( 'toggleBody' );
        },

        setActivity(){
            if( this.get('user') ){
        	   this.get('VKSpy').setActivity( this.get('user').id );
            }
        },

        sendMessage(){
            if( this.get('user') ){
                this.get('VKSpy').sendMessage( this.get('user').id, this.get('messageText') );
                this.set('messageText', '');
            }
        },
	},
	
});
