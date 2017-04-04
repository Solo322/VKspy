import Ember from 'ember';
import VKMessage from './../objects/vk-message';

const MESSAGE_COUNT = 10;

export default Ember.Component.extend({

	userID: null,


    messages: [],
    messagesSortingDesc: ['date'],
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

        let url = "https://api.vk.com/method/messages.getHistory?access_token=";
        url += this.get('authUsers').getCurrentUser().token;
        url += "&count=" + MESSAGE_COUNT;
        url += "&user_id=";
        url += user_id;
        this.set('userID',user_id);
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

    actions: 
    {
        toggleBody() {
        	console.log('toggleBody');
            this.get('controller').send( 'toggleBody' );
        },

	    moreMessages(){
		    let url = "https://api.vk.com/method/messages.getHistory?access_token=";
		    url += this.get('authUsers').getCurrentUser().token;
		    url += "&offset=" + this.get('messages').length;
		    url += "&count=" + MESSAGE_COUNT;
		    url += "&user_id=";
		    url += this.get('userID');

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

        setActivity(){
            let url = "https://api.vk.com/method/messages.setActivity?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&user_id=" + this.get('userID');
            url += "&type=typing";
            $.getJSON(url).then(data =>{
                console.log('setActivity');
            });
        },

        sendMessage(){
            let url = "https://api.vk.com/method/messages.send?access_token=";
            url += this.get('authUsers').getCurrentUser().token;
            url += "&message=";
            url += encodeURIComponent(this.get('messageText'));
            url += "&user_id=";
            url += this.get('userID');
            $.getJSON(url);
            this.set('messageText', '');
        },
	},
	
});
