import https from 'node:https';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { createHmac } from 'node:crypto';
import { DomainError } from './domain.js';
export type WebhookTransport = (url:string, body:string, headers:Record<string,string>, authorize?:()=>void|Promise<void>)=>Promise<{status:number;body:string}>;
export function callbackUrl(input:string): URL {
 let url:URL;try{url=new URL(input);}catch{throw new DomainError('INVALID_INPUT','Ugyldig callback-URL.');}
 if(url.protocol!=='https:'||url.username||url.password||url.hash||url.port&&url.port!=='443')throw new DomainError('INVALID_INPUT','Callback kræver HTTPS på port 443 uden credentials eller fragment.');
 return url;
}
function ipv6Value(input:string):bigint|undefined {
 let ip=input.toLowerCase(); if(ip.includes('%')||ip.includes('.'))return;
 const halves=ip.split('::');if(halves.length>2)return;
 const left=halves[0]?halves[0].split(':'):[],right=halves[1]?halves[1].split(':'):[];
 if(halves.length===1&&left.length!==8||halves.length===2&&left.length+right.length>=8)return;
 const groups=halves.length===2?[...left,...Array(8-left.length-right.length).fill('0'),...right]:left;
 if(groups.some(x=>!/^[0-9a-f]{1,4}$/.test(x)))return;
 return groups.reduce((n,g)=>(n<<16n)|BigInt(parseInt(g,16)),0n);
}
/** Conservative globally routable destinations only; IPv4-mapped/transition IPv6 are denied. */
export function isPublicAddress(address:string):boolean {
 const version=isIP(address);
 if(version===4){
  const [a,b,c]=address.split('.').map(Number);
  return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&b===168||a===100&&b>=64&&b<=127||a===192&&b===0||a===192&&b===88&&c===99||a===192&&b===0&&c===2||a===198&&(b===18||b===19)||a===198&&b===51&&c===100||a===203&&b===0&&c===113);
 }
 if(version===6){
  const n=ipv6Value(address);if(n===undefined)return false;
  // Only 2000::/3, excluding IETF special-use, documentation and transition ranges.
  if((n>>125n)!==1n)return false;
  if((n>>105n)===(ipv6Value('2001::')!>>105n))return false;
  if((n>>96n)===(ipv6Value('2001:db8::')!>>96n))return false;
  if((n>>112n)===0x2002n)return false;
  if((n>>108n)===(ipv6Value('3fff::')!>>108n))return false;
  return true;
 }
 return false;
}
export function decodeSigningSecret(secret:string):Buffer {
 if(!/^whsec_[A-Za-z0-9+/]+={0,2}$/.test(secret))throw new DomainError('INVALID_INPUT','Ugyldig webhooksigneringsnøgle.');
 const raw=secret.slice(6),bytes=Buffer.from(raw,'base64');
 if(bytes.length<24||bytes.length>64||bytes.toString('base64').replace(/=+$/,'')!==raw.replace(/=+$/,''))throw new DomainError('INVALID_INPUT','Webhooknøglen skal indeholde 24–64 bytes.');
 return bytes;
}
export function signWebhook(secret:string,id:string,body:string,now:number):Record<string,string>{
 const timestamp=String(Math.floor(now/1000));const signature=createHmac('sha256',decodeSigningSecret(secret)).update(`${id}.${timestamp}.${body}`).digest('base64');
 return {'Content-Type':'application/json','webhook-id':id,'webhook-timestamp':timestamp,'webhook-signature':`v1,${signature}`};
}
export const secureWebhook:WebhookTransport=async(input,body,headers,authorize)=>{
 const url=callbackUrl(input);const hostname=url.hostname.replace(/^\[|\]$/g,'');
 let dnsTimer:ReturnType<typeof setTimeout>|undefined;
 let addresses:{address:string;family:number}[];
 try{addresses=isIP(hostname)?[{address:hostname,family:isIP(hostname)}]:await Promise.race([lookup(hostname,{all:true,verbatim:true}),new Promise<never>((_,reject)=>{dnsTimer=setTimeout(()=>reject(new DomainError('CALLBACK_TIMEOUT','DNS fik timeout.')),5000);})]);}
 finally{if(dnsTimer)clearTimeout(dnsTimer);}
 if(!addresses.length||addresses.some(a=>!isPublicAddress(a.address)))throw new DomainError('CALLBACK_BLOCKED','Callbackdestinationen er ikke en offentlig adresse.');
 const address=addresses[0];
 // DNS lookup was asynchronous: authorization is checked again immediately before opening the pinned connection.
 await authorize?.();
 if(Buffer.byteLength(body)>256*1024)throw new DomainError('CALLBACK_TOO_LARGE','Webhookpayload er for stor.');
 return new Promise((resolve,reject)=>{
  const req=https.request(url,{method:'POST',headers:{...headers,'Content-Length':String(Buffer.byteLength(body))},agent:false,servername:isIP(hostname)?undefined:hostname,
   lookup:((_host:unknown,options:any,callback:any)=>options?.all?callback(null,[address]):callback(null,address.address,address.family)) as any,
  },res=>{
   const chunks:Buffer[]=[];let size=0;
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>64*1024){res.destroy();reject(new DomainError('CALLBACK_TOO_LARGE','Callbacksvaret er for stort.'));}else chunks.push(chunk);});
   res.on('end',()=>resolve({status:res.statusCode??0,body:Buffer.concat(chunks).toString('utf8')}));res.on('error',reject);
  });
  const deadline=setTimeout(()=>req.destroy(new DomainError('CALLBACK_TIMEOUT','Callback fik timeout.')),10000);
  req.on('close',()=>clearTimeout(deadline));
  req.setTimeout(10000,()=>req.destroy(new DomainError('CALLBACK_TIMEOUT','Callback fik timeout.')));
  req.on('error',reject);req.end(body);
 });
};
