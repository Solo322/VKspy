import Ember from 'ember';

export default Ember.Object.extend({
	/**
	 * Пользователь с которым ведем диалог
	 * @type {Object VKUser}
	 */
    user: null,
    /**
     * Последнее сообщение диалога
     * @type {Object VKMessage}
     */
    message: null,
    /**
     * Количество непрочитанные сообщений в этом диалоге
     * @type {Integer}
     */
    unread: null,
});