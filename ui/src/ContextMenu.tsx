import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import type {Actions,Section} from './types';
interface Target {id?:string;slot?:string;x:number;y:number;origin:HTMLElement}
export function ContextMenu({actions}:{actions:Actions}) {
 const [target,setTarget]=useState<Target|null>(null),menu=useRef<HTMLDivElement>(null);
 const close=(restore=false)=>{if(restore)target?.origin.focus();setTarget(null);};
 useEffect(()=>{
  const open=(e:MouseEvent|KeyboardEvent)=>{
   if(e instanceof KeyboardEvent && !(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')))return;
   const source=e.target instanceof Element?e.target:null;
   if(!source||source.closest('input,textarea,select')||document.querySelector('dialog[open]'))return;
   const item=source.closest<HTMLElement>('[data-block],[data-slot],[data-node-bypass],[data-stomp],[data-context-block]');
   if(!item||!item.closest('#chain,#device-overview,#stomps,#editor'))return;
   e.preventDefault();e.stopImmediatePropagation();
   const rect=item.getBoundingClientRect();const mouse=e instanceof MouseEvent&&e.button===2;
   setTarget({id:item.dataset.block||item.dataset.contextBlock||item.dataset.nodeBypass||item.dataset.stomp,slot:item.dataset.slot,x:mouse?e.clientX:rect.left+20,y:mouse?e.clientY:rect.top+20,origin:item});
  };
  document.addEventListener('contextmenu',open,true);document.addEventListener('keydown',open,true);
  return()=>{document.removeEventListener('contextmenu',open,true);document.removeEventListener('keydown',open,true);};
 },[]);
 useLayoutEffect(()=>{if(!target||!menu.current)return;const m=menu.current,r=m.getBoundingClientRect();m.style.left=`${Math.max(8,Math.min(target.x,innerWidth-r.width-8))}px`;m.style.top=`${Math.max(8,Math.min(target.y,innerHeight-r.height-8))}px`;m.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();},[target]);
 useEffect(()=>{if(!target)return;const outside=(e:Event)=>{if(!menu.current?.contains(e.target as Node))setTarget(null);};const escape=(e:KeyboardEvent)=>{if(/^[1-8]$/.test(e.key)){e.preventDefault();e.stopImmediatePropagation();return;}if(e.key==='Escape'||e.key==='Tab'){e.preventDefault();e.stopImmediatePropagation();target.origin.focus();setTarget(null);}};const dismiss=()=>setTarget(null);document.addEventListener('pointerdown',outside,true);document.addEventListener('keydown',escape,true);window.addEventListener('resize',dismiss);document.addEventListener('scroll',outside,true);return()=>{document.removeEventListener('pointerdown',outside,true);document.removeEventListener('keydown',escape,true);window.removeEventListener('resize',dismiss);document.removeEventListener('scroll',outside,true);};},[target]);
 if(!target)return null;
 const rig=actions.snapshot(),b=rig.blocks.find(b=>b.id===target.id),d=b&&window.DeviceShelf.definition(b);
 const run=(fn:()=>void)=>{close();fn();};
 const move=(section:Section)=>run(()=>actions.move(b!.id,section));
 return <div ref={menu} className="device-context-menu" role="menu" aria-label={d?`${d.name} actions`:'Add device actions'} style={{left:target.x,top:target.y}} onKeyDown={e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const buttons=Array.from(menu.current!.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const i=buttons.indexOf(document.activeElement as HTMLButtonElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus();}}><div className="context-title">{d?.name||'Empty slot'}</div>{b?<><button role="menuitem" onClick={()=>run(()=>actions.edit(b.id))}>Edit controls <kbd>↵</kbd></button><button role="menuitem" onClick={()=>run(()=>actions.bypass(b.id))}>{rig.scenes[rig.scene][b.id].on?'Bypass':'Enable'}</button><button role="menuitem" onClick={()=>run(()=>actions.replace(b.id))}>Replace device…</button><button role="menuitem" disabled={rig.blocks.length>=24} onClick={()=>run(()=>actions.duplicate(b.id))}>Duplicate with scene settings</button><div role="separator"/>{(['pre','loop','post'] as Section[]).map(section=><button key={section} role="menuitem" onClick={()=>move(section)}>Move to {{pre:'Before amp',loop:'FX loop',post:'After cab',amp:'Amp',cab:'Cab'}[section]}</button>)}<div role="separator"/><button role="menuitem" className="context-delete" onClick={()=>run(()=>actions.remove(b.id))}>Remove from rig <small>Undo available</small></button></>:<button role="menuitem" onClick={()=>run(()=>actions.add(target.slot!))}>Add device…</button>}</div>;
}
