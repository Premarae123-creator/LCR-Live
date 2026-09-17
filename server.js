const express=require('express');const http=require('http');const {Server}=require('socket.io');const path=require('path');
const app=express(),server=http.createServer(app),io=new Server(server);app.use(express.static(path.join(__dirname,'public')));const rooms={};
const code=()=>Math.random().toString(36).slice(2,6).toUpperCase();
const publicRoom=r=>({code:r.code,started:r.started,center:r.center,turn:r.turn,players:r.players.map(p=>({id:p.id,name:p.name,chips:p.chips})),winner:r.winner,last:r.last});
function emit(r){io.to(r.code).emit('state',publicRoom(r));}
function nextTurn(r){if(r.players.filter(p=>p.chips>0).length<=1){r.winner=r.players.find(p=>p.chips>0)?.id||null;return;}let i=r.turn;do{i=(i+1)%r.players.length;}while(r.players[i].chips===0);r.turn=i;}
io.on('connection',s=>{
 s.on('create',({name},cb)=>{let c;do c=code();while(rooms[c]);rooms[c]={code:c,host:s.id,started:false,center:0,turn:0,winner:null,last:null,players:[{id:s.id,name:(name||'Host').slice(0,20),chips:3}]};s.join(c);cb({ok:true,code:c});emit(rooms[c]);});
 s.on('join',({name,code:c},cb)=>{c=(c||'').toUpperCase();const r=rooms[c];if(!r)return cb({ok:false,msg:'Room not found'});if(r.started)return cb({ok:false,msg:'Game already started'});if(r.players.length>=20)return cb({ok:false,msg:'Room is full'});r.players.push({id:s.id,name:(name||'Player').slice(0,20),chips:3});s.join(c);cb({ok:true,code:c});emit(r);});
 s.on('start',c=>{const r=rooms[c];if(!r||r.host!==s.id||r.players.length<2)return;r.started=true;r.turn=0;r.center=0;r.winner=null;r.last=null;r.players.forEach(p=>p.chips=3);emit(r);});
 s.on('roll',c=>{const r=rooms[c];if(!r||!r.started||r.winner)return;const p=r.players[r.turn];if(p.id!==s.id||p.chips<1)return;const n=Math.min(3,p.chips),faces=['L','R','C','•','•','•'],rolls=[];for(let k=0;k<n;k++)rolls.push(faces[Math.floor(Math.random()*6)]);const li=(r.turn-1+r.players.length)%r.players.length,ri=(r.turn+1)%r.players.length;for(const f of rolls){if(f==='L'){p.chips--;r.players[li].chips++;}else if(f==='R'){p.chips--;r.players[ri].chips++;}else if(f==='C'){p.chips--;r.center++;}}r.last={player:p.name,rolls};nextTurn(r);emit(r);});
 s.on('restart',c=>{const r=rooms[c];if(!r||r.host!==s.id)return;r.started=false;r.center=0;r.turn=0;r.winner=null;r.last=null;r.players.forEach(p=>p.chips=3);emit(r);});
 s.on('disconnect',()=>{for(const c of Object.keys(rooms)){const r=rooms[c],i=r.players.findIndex(p=>p.id===s.id);if(i<0)continue;if(r.started){r.players[i].name+=' (left)';}else r.players.splice(i,1);if(!r.players.length){delete rooms[c];continue;}if(r.host===s.id)r.host=r.players[0].id;if(r.turn>=r.players.length)r.turn=0;emit(r);}});
});server.listen(process.env.PORT||3000,()=>console.log('LCR Live running'));
