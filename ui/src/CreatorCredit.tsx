import {useState} from 'react';
import type {Block} from './types';
export function CreatorCredit({tone}:{tone:NonNullable<Block['tone3000']>}) {
 const [failed,setFailed]=useState(false),name=tone.user?.username||'Unknown creator';
 let avatar='';try{const url=new URL(tone.user?.avatar_url||'');if(url.protocol==='https:'&&!url.username&&!url.password)avatar=url.href;}catch{/* Offline/manual captures may have no avatar. */}
 return <div className="creator-credit" aria-label={`Capture by ${name}`}><span className="creator-icon" aria-hidden="true">{avatar&&!failed?<img src={avatar} alt="" referrerPolicy="no-referrer" onError={()=>setFailed(true)}/>:name.replace(/^@/,'').slice(0,1).toUpperCase()}</span><span><small>CAPTURE BY</small><strong>@{name.replace(/^@/,'')}</strong></span></div>;
}
