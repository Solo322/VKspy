/* global require */
import Ember from 'ember';
const {remote} = require('electron');
const {BrowserWindow, ipcMain} = remote;

export default Ember.Route.extend({
	actions: {
		toggleBody(){
            // ссылка на текущий BrowserWindow
			const current = BrowserWindow.getFocusedWindow();

            // создаем новое окно по нажатии с необходимым URL
			let vkWindow = new BrowserWindow({
        		width: 800,
        		height: 600,
        		parent: current
    		});

    		vkWindow.loadURL('https://oauth.vk.com/authorize?client_id=5927655&redirect_uri=https://oauth.vk.com/blank.html&scope=messages,friends,video,offline&display=popup&response_type=token');

            // подписываем главное окно на событие query
            // и в случае перехвата алертим его данные
    		ipcMain.on('query', (event, message) => {
    			alert(message);
    		});

            // в созданном окне по завершении загрузки
            // отсылаем событие query с данными в виде ссылки окна 
    		vkWindow.webContents.on('dom-ready', (event) => {
    			vkWindow.webContents.executeJavaScript(
    				"const {ipcRenderer} = require('electron');" + 
    				"let message = document.location.href;" +
    				"ipcRenderer.send('query', message);"
    				);
    		});
    	}
	}
});
