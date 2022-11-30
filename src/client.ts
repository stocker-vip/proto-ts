import md5 from 'md5'
import { v4 } from "uuid";
import { WebSocket } from 'ws'

import type { RPCImpl , RPCImplCallback } from "protobufjs";

import { decode, encode } from "./utils";

export class Client {
	private todo: Uint8Array[] = [];
	private callbacks: Map<string, RPCImplCallback> = new Map();
	private ws: WebSocket;

	constructor(url: string) {
		this.ws = new WebSocket(url);
		this.pool();
	}
	private pool() {
		this.ws.on("open", () => {
			this.ws.on("message", (msg) => {
                let msgInfo = decode(msg as Uint8Array);
				let callback = this.callbacks.get(msgInfo.id);
				if (callback) {
					this.callbacks.delete(msgInfo.id);
					callback(null, msgInfo.data);
				}
			});
			if (this.todo.length > 0) {
				this.todo.forEach((it) => {
					this.ws.send(it);
				});
				this.todo = [];
			}
		});
	}

	public Rpc(): RPCImpl {
		return (method, data, callback) => {
            let id = v4();
			this.callbacks.set(id, callback);
			const bufferData = encode(id, md5(method.toString()), data);
			if (this.ws.readyState !== 1) {
				this.todo.push(bufferData);
			} else {
				this.ws.send(bufferData);
			}
		};
	}

    public close(){
         this.ws.close()
    }
}