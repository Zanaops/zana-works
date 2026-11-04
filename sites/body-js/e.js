// The router: one cable, many contacts, a computer decides which contact
// carries which sense. Nothing routes inside tissue; the map is in silicon.
function Router(nContacts){
  this.n=nContacts;
  this.map=new Array(nContacts).fill(null);
  this.used=0;
}
Router.prototype.assign=function(sense,idx){
  for(let i=0;i<this.n;i++){
    if(this.map[i]===null){ this.map[i]={sense,idx}; this.used++; return i; }
  }
  return -1;   // out of contacts: this is the wall, in one line
};
Router.prototype.route=function(sense,idx,rate){
  for(let i=0;i<this.n;i++){
    const m=this.map[i];
    if(m&&m.sense===sense&&m.idx===idx) return {contact:i,rate};
  }
  return null;
};