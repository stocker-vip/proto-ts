import { Msg, ReturnMsg } from "./types";

export const str2buffer = (str: string): Uint8Array =>
	new Uint8Array(str.split("").map((it) => it.charCodeAt(0)));

export const str2Array = (str: string) => [...str2buffer(str)];

export const bufferAdd = (a: Uint8Array, b: Uint8Array) =>
	new Uint8Array([...a, ...b]);

export const buffer2str = (a: Uint8Array) => String.fromCharCode(...[...a]);

export const encode = (id: string, md5id: string, b: Uint8Array | null) => {
	let a = str2buffer(`${id}|${md5id}|`);
	if (!b) return a;
	let c = bufferAdd(a, b);
	return c;
};

export const decodeInit =<T>(c:Uint8Array,fn:(p1:string,p2:string,p3:Uint8Array|null)=>T) =>{
    let points = [];
	const carray = [...c];
	for (let i = 0; i < carray.length; i++) {
		if (carray[i] === 124) {
			points.push(i);
			if (points.length >= 2) break;
		}
	}
    return fn(buffer2str(c.slice(0, points[0])), buffer2str(c.slice(points[0] + 1, points[1])),c.length === points[1]+1 ? null : c.slice(points[1] + 1))
}

export const decode = (c: Uint8Array): Msg => {
	return decodeInit(c,(p1,p2,data)=>({
        id:p1,
        method:p2,
        data
    }))
};

export const decodeReturnMsg = (c:Uint8Array):ReturnMsg =>{
    return decodeInit(c,(p1,p2,data)=>({
        id:p1,
        status:p2,
        data
    }))
}

export const parseMsg = (msg: Msg) => encode(msg.id, msg.method, msg.data);
export const parseReturnMsg = (msg: ReturnMsg) =>
	encode(msg.id, msg.status, msg.data);
