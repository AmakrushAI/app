import { io } from 'socket.io-client';


const URL =  "wss://ts.gpt3.samagra.io" ;

export const socket = io(URL, {
	// transportOptions: {
	// 	polling: {
	// 		extraHeaders: {
	// 			Authorization: `-----BEGIN PUBLIC KEY-----
	// 			MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmPw09w/sAcleZy+A4XJs
	// 			ncT2oYZv5I3f4vQ/Pucet1EKrgpxRsZF1KFQLM29+9d29BJvAMevpz8dHoyb/S4/
	// 			COurBFSnDkrKTa9Zl9y7K4Udq6dtjCOL+WHaDdeHVHXYI/c8U3eq5YStM/PWjWX5
	// 			r3TsQ2OniFrLNMJaNdGg72kj3YrvJYf5AaGyE9JrMrfTxxyLrnERULjvZkHCXthQ
	// 			jXld7bpL3gMOlzDDrScIQsEVSAOOSzaxu47tvoBC7JALyOe127YneKTCKuTLd4Mp
	// 			BhDJeg9x3UvKydoGmHTc1ckPEW7rJHU3DJ+Llwvgk5QE895fVBOSwTGRzz31YFdD
	// 			swIDAQAB
	// 			-----END PUBLIC KEY-----` ,
	// 			channel: 'akai'
	// 		}
	// 	}
	// },
	query: {
		deviceId: `phone:7398050181`
	},
	autoConnect: false
});


