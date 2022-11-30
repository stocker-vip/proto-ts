export interface Msg {
	id: string;
	method: string;
	data: Uint8Array | null;
}

export interface ReturnMsg {
	id: string;
	status: string;
	data: Uint8Array | null;
}
