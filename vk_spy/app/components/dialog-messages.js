import Ember from 'ember';
import VKMessage from './../objects/vk-message';

const MESSAGE_COUNT = 10;

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

    didReceiveAttrs() {
        this._super(...arguments);
		this.get('controller').on('goToDialog', this, this.goToDialog);
		this.get('controller').on('currentUserChanged', this, this.currentUserChanged);
    },

    currentUserChanged(){
    	console.log( arguments );
    	this.set("messages", []);
    },

    goToDialog( user_id ){
    	console.log('dialog-messages::goToDialog');
        this.set("messages", []);

        if(!this.get('VKSpy').user){
        	return;
        }

        let url = "https://api.vk.com/method/messages.getHistory?access_token=";
        url += this.get('VKSpy').user.token;
        url += "&count=" + MESSAGE_COUNT;
        url += "&user_id=";
        url += user_id;
        this.set('userID',user_id);
        $.getJSON(url).then(data => {
        	console.log(data);
            data.response.shift();
            for (var i = data.response.length - 1; i >= 0; i--) {
                let type = null;
                let img = null;
                if (data.response[i].attachments) {
                    type = data.response[i].attachments[0].type;
	                if (data.response[i].attachments[0].type === "sticker") {
                        img = data.response[i].attachments[0].sticker.photo_128;
                    }
                    else if (data.response[i].attachments[0].type === "photo") {
                        img = data.response[i].attachments[0].photo.photo_130;
                    }
                    else if (data.response[i].attachments[0].type === "gift") {
                        img = data.response[i].attachments[0].gift.thumb_96;
	            	}
	            	else if (data.response[i].fwd_messages) {
	                	type = "forward messages";
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
                        Img: img,
                    });
                this.get("messages").pushObject(message);
            }
            console.log('getHistory');
            console.log(data);
        });
    },

    actions: 
    {
        toggleBody() {
        	console.log('toggleBody');
            this.get('controller').send( 'toggleBody' );
        },

	    moreMessages(){
		    let url = "https://api.vk.com/method/messages.getHistory?access_token=";
		    url += this.get('VKSpy').user.token;
		    url += "&offset=" + this.get('messages').length;
		    url += "&count=" + MESSAGE_COUNT;
		    url += "&user_id=";
		    url += this.get('userID');

		    $.getJSON(url).then(data => {
		        data.response.shift();
		        for (var i = data.response.length - 1; i >= 0; i--) {
		            let type = null;
		            let img = null;
		            if (data.response[i].attachments) {
		                type = data.response[i].attachments[0].type;
		                console.log();
		                if (data.response[i].attachments[0].type === "sticker") {
                            img = data.response.items[i].attachments[0].sticker.photo_128;
                        }
                        else if (data.response.items[i].attachments[0].type === "photo") {
                            img = data.response.items[i].attachments[0].photo.photo_130;
                        }
                        else if (data.response.items[i].attachments[0].type === "gift") {
                            img = data.response.items[i].attachments[0].gift.thumb_96;
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
		                    Img: img,
		                });
		             this.get("messages").pushObject(message);
		        }
		        console.log('getHistory');
		        console.log(data);
		    }});
		},

        setActivity(){
            let url = "https://api.vk.com/method/messages.setActivity?access_token=";
            url += this.get('VKSpy').user.token;
            url += "&user_id=" + this.get('userID');
            url += "&type=typing";
            $.getJSON(url).then(data =>{
                console.log('setActivity');
            });
        },

        sendMessage(){
            let url = "https://api.vk.com/method/messages.send?access_token=";
            url += this.get('VKSpy').user.token;
            url += "&message=";
            url += encodeURIComponent(this.get('messageText'));
            url += "&user_id=";
            url += this.get('userID');
            $.getJSON(url);
            this.set('messageText', '');
        },
	},
	
});
