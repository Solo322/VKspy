import Ember from 'ember';

export default Ember.Object.extend({
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
});