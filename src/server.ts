import md5 from "md5";
import { WebSocketServer } from "ws";
import { decode, parseReturnMsg } from "./utils";

type Fn = (input: Uint8Array | null) => Uint8Array;

export class Server {
	private table: Map<string, Fn> = new Map();
	private ws: WebSocketServer;
	constructor(port: number) {
		this.ws = new WebSocketServer({ port });
        this.process()
	}

	private process() {
		this.ws.on("connection", (ws) => {
			ws.on("message", (buffer) => {
				let msg = decode(buffer as Uint8Array);
				let data = this.deal(msg.method)(msg.data);
                ws.send(parseReturnMsg({
					id: msg.id,
					status: data ? "1" : "0",
					data,
				}))
			});
		});
	}

	register(fn: Function, deal: Fn) {
		const id = md5(fn.toString());
		this.table.set(id, deal);
	}

	deal(key: string) {
		return (input: Uint8Array | null) => {
			const deal = this.table.get(key);
			if (deal) {
				return deal(input);
			}
			return null;
		};
	}
}
