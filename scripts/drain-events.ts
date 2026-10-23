import { readFileSync, lstatSync } from 'node:fs';
import { resolve } from 'node:path';
import { createDatabase } from '../server/database.js';
import { EventService } from '../server/events.js';

// One bounded pass. An external scheduler must call this again; it is not an agent timer.
const args=process.argv.slice(2);
let database='.local/hearing-union.sqlite', keyPath='.local/auth.json.event-key',limit=25;
try {
  for(let i=0;i<args.length;i++) {
    const option=args[i],value=args[++i];
    if(!value) throw new Error('Missing argument');
    if(option==='--database')database=value;
    else if(option==='--key')keyPath=value;
    else if(option==='--limit')limit=Number(value);
    else throw new Error('Unknown option');
  }
  const stat=lstatSync(resolve(keyPath));
  if(!stat.isFile()||(stat.mode&0o077)!==0)throw new Error('Key file permissions');
  const encryptionKey=readFileSync(resolve(keyPath));
  const db=createDatabase(resolve(database));
  try { console.log(JSON.stringify(await new EventService(db,{encryptionKey}).drain(Date.now(),limit))); }
  finally { db.close(); }
} catch {
  console.error('Event drain failed. Check the selected local database, key file, options and network access. No credentials are printed.');
  process.exitCode=1;
}
