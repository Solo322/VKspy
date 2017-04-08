import Ember from 'ember';
import VKMessage from './../objects/vk-message';
import VKUser from './../objects/vk-user';

const VK_METHOD_URL = "https://api.vk.com/method/";
const VK_API_VERSION = "&v=5.63";

export default Ember.Service.extend({

	/**
	 * Текущий пользователь под которым работаем
	 * @type {Object}
	 */
	user: null,
	/**
	 * Нужно ли показывать его онлайн
	 * @type {Boolean}
	 */
	isOnline: null,
	/**
	 * Нужно ли показывать сообщения "печатает..."
	 * @type {Boolean}
	 */
	isTyping: null,
	/**
	 * Нужно ли прочитывать сообщения при переходе к диалогу
	 * @type {Boolean}
	 */
	isReading: null,

    usersChanged: function() {
        // При каких либо изменения в users запишем это в файл
        // TODO сделать запись один раз при выходе из программы!
        this.writeCfg();
    }.observes('user'),

    isOnlineChange: function(){
    	this.writeCfg();
    }.observes('isOnline'),

    isTypingChange: function(){
    	this.writeCfg();
    }.observes('isTyping'),

        isReadingChange: function(){
    	this.writeCfg();
    }.observes('isReading'),


	init(){
		this.readCfg();
	},

	readCfg(){
		console.log( 'VKSpy::readCfg' );
        let fs = require('fs');
        if (fs.existsSync('cfg.json')) {
            let contents = fs.readFileSync('cfg.json', 'utf-8');
            if( contents.length ){
            	let obj = JSON.parse(contents);
            	let user = VKUser.create( obj.user );
            	this.set('user', user );
            	this.set('isOnline', obj.isOnline);
            	this.set('isTyping', obj.isTyping);
            	this.set('isReading', obj.isReading);
            	console.log( obj );
            }
        }
	},

	writeCfg(){
		console.log( 'VKSpy::writeCfg' );
        var fs = require('fs');
        let obj = {
        	user: this.get('user'),
        	isOnline: this.get('isOnline'),
        	isTyping: this.get('isTyping'),
        	isReading: this.get('isReading'),
        };
        fs.writeFile('cfg.json', JSON.stringify(obj, null, 2), 'utf8', function(){} ); 
	},


	// VK Api

	/**
	 * @param  {String} token - токен пользователя, для которого надо получить инфу 
	 * @param  {Function} callback при получение ответа вызовем функцию
	 * @return {Object} получаем данные о пользователи с указанным токеном
	 */
    userGet( token, callback ){  
        let url = VK_METHOD_URL + "users.get?access_token=" + token;
        url += "&fields=photo_50";
        $.getJSON(url).then(data =>{
                console.log('VKSpy::userGet');
                callback( data );
        });
    },

    /**
     * Сделать пользователя онлайн
     */
    setOnline(){
    	// Делаем пользователя онлайн только если включена эта опция
    	if( this.get('isOnline') && this.get('user') ){
	        let url = VK_METHOD_URL + "account.setOnline?access_token=" + this.get('user').token + "&voip=0";
	        $.getJSON(url).then(data =>{
	                console.log('VKSpy::setOnline');
	        }); 
    	}
    },

    /**
     * Просигнализировать собеседнику, что мы набираем сообщение
     * @param {String} user_id идентификатор пользователя
     */
    setActivity( user_id ){
    	if( this.get('isTyping') && this.get('user') ){
	        let url = VK_METHOD_URL + "messages.setActivity?access_token=" + this.get('user').token;
	        url += "&user_id=" + user_id;
	        url += "&type=typing";
	        $.getJSON(url).then(data =>{
	            console.log('setActivity');
	        });
    	}
    },

    /**
     * Отправить сообщение собеседнику
     * @param  {String} user_id - ид собеседника
     * @param  {String} text текст сообщения
     */
    sendMessage( user_id, text ){

    	if( this.get('user') && text ){
	    	this.setOnline();
		    let url = VK_METHOD_URL + "messages.send?access_token=" + this.get('user').token;
		    url += "&message=" + encodeURIComponent( text );
		    url += "&user_id=" + user_id;
		    $.getJSON(url);
    	}
    },

    /**
     * Получить список диалогов
     * @param  {Integer}   count_dlg нужное кол-во диалогов
     * @param  {Function} callback  когда результат будет получен вызовится эта функция
     * @return {[type]}             [description]
     */
    getDialogs( count_dlg, callback ){
        console.log('VKSpy::getDialogs');
        if( !this.get('user') ){
        	console.log('Не выбран пользователь');
            return;
        }
        let url = VK_METHOD_URL + "messages.getDialogs?access_token=" + this.get('user').token;
        url += "&count=" + count_dlg;
        url += "&unread=0";
        url += VK_API_VERSION;
        $.getJSON(url).then(data => {
            if( data.error ){
                alert('Пользователь не авторизован');
                this.set('user', null);
                return;
            }
            callback( data );
        });
    },

    /**
     * Получить список сообщений диалога
     * @param  {String}   user_id   пользователь, с которым в диалоге
     * @param  {Integer}   count_msg количество сообщений
     * @param  {Integer}   offset    отступ, начиная с которого надо получить сообщение
     * @param  {Function} callback  вернется результат
     * @return {[type]}             [description]
     */
    getHistory( user_id, count_msg, offset, callback ){
    	console.log('VKSpy::getHistory');
        if(!this.get('user')){
        	console.log('Не выбран пользователь');
        	return;
        }

        this.readMessage ( user_id );

        let url = VK_METHOD_URL + "messages.getHistory?access_token=" + this.get('user').token;
        url += "&count=" + count_msg;
        url += "&user_id=" + user_id;
        if( offset ){
        	url += "&offset=" + offset;
        }
        url += VK_API_VERSION;

        $.getJSON(url).then(data => {
        	callback( data );
        });
    },

    /**
     * Получить сообщение по идентификатору
     * @param  {[type]}   message_id идентификатор сообщения
     * @param  {Function} callback   вернется результат
     * @return {[type]}              [description]
     */
    getMessageByID( message_id, callback ){
    	console.log('VKSpy::getMessageByID');
        if(!this.get('user')){
        	console.log('Не выбран пользователь');
        	return;
        }
        let url = VK_METHOD_URL + "messages.getById?access_token=" + this.get('user').token;
        url += "&message_ids=" + message_id;
        url += VK_API_VERSION;

        $.getJSON(url).then(data => {
        	console.log('getMessageByID answer');
        	console.log(data);
        	if( !data.response || !data.response.items ){
        		return;
        	}
        	// TODO можно получить неесколько сообщений по нескольким ИД-шникам
        	if( data.response.items.length === 0 ){
        		return;
        	}
            let message = VKMessage.create();
            message.initMessage(data.response.items[0]);
        	callback( message );
        });
    },

    readMessage( user_id ){
     	console.log('VKSpy::readMessage');
        if(!this.get('user')){
        	console.log('Не выбран пользователь');
        	return;
        }
        if( !this.get('isReading') )
        	return;	
        let url = VK_METHOD_URL + "messages.markAsRead?access_token=" + this.get('user').token;
        url += "&peer_id=" + user_id;
    	$.getJSON(url);
    },
});
