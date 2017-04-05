import Ember from 'ember';

const METHOD_URL = "https://api.vk.com/method/";

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
            	this.set('user', obj.user);
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
        let url = METHOD_URL + "users.get?access_token=" + token;
        $.getJSON(url).then(data =>{
                console.log('VKSpy::userGet');
                callback( data );
        });
    },

    setOnline(){
    	// Делаем пользователя онлайн только если включена эта опция
    	if( this.get('isOnline') ){
	        let url = METHOD_URL + "account.setOnline?access_token=" + this.get('user').token + "&voip=0";
	        $.getJSON(url).then(data =>{
	                console.log('VKSpy::setOnline');
	        }); 
    	}
    },

    

});
