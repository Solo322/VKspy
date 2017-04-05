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
		console.log( 'vk-spy::readCfg' );
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
		console.log( 'vk-spy::writeCfg' );
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

	
});
