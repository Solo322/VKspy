import Ember from 'ember';

export default Ember.Object.extend({
	
    /**
     * Идентификатор пользователя
     * @type {String}
     */
    userID: null,
    /**
	 * Текст сообщения
	 * @type {String}
	 */
    text: null,
    /**
     * Дата получения/отправки сообщения
     * @type {Date}
     */
    date: null,
    /**
     * Тип сообщения. Док, картинка, стикер и т.п
     * @type {String}
     */
    type: null,
    /**
     * Тип сообщения (0 — полученное, 1 — отправленное, не возвращается для пересланных сообщений).
     * @type {Integer}
     */
    out: null,
    /**
     * Статус сообщения (0 — не прочитано, 1 — прочитано, не возвращается для пересланных сообщений).
     * @type {[type]}
     */
    readState: null, 
    /**
     * Изображение сообщения
     * @type {String}
     */
    Img: null,

    initMessage( vk_message ){
        this.set( 'userID', vk_message.user_id );
        this.set( 'text', vk_message.body );
        this.set( 'date', vk_message.date );
        this.set( 'out', vk_message.out );
        this.set( 'readState', vk_message.read_state );
        this.initImg( vk_message );
        this.initType( vk_message );
    },

    initImg( vk_message ){
        if (vk_message.attachments) {
            if (vk_message.attachments[0].type === "sticker") {
                this.set( 'Img', vk_message.attachments[0].sticker.photo_128 );
            }
            else if (vk_message.attachments[0].type === "photo") {
                this.set( 'Img', vk_message.attachments[0].photo.photo_130 );
            }
            else if (vk_message.attachments[0].type === "gift") {
                this.set( 'Img', vk_message.attachments[0].gift.thumb_96 );
            }
        }
    },

    initType( vk_message ){
        if (vk_message.attachments) {
            this.set( 'type', vk_message.attachments[0].type );
        }
        else if (vk_message.fwd_messages) {
            this.set( 'type', "forward messages" );
        }
    },
});