import { io } from 'socket.io-client';


const URL =  "wss://ts.gpt3.samagra.io" ;

export const socket = io(URL, {
	// transportOptions: {
	// 	polling: {
	// 		extraHeaders: {
	// 			Authorization: '' ,
	// 			channel: 'akai'
	// 		}
	// 	}
	// },
	query: {
		deviceId: `phone:7398050181`
	},
	autoConnect: false
});


