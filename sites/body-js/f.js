// Budget: how many contacts each sense eats, and what is left over.
function budget(n){
  const r=new Router(n);
  const needs=[['sight',100],['touch',24],['hearing',16],['taste',5],['balance',6],['motor',8]];
  const out=[];
  for(const [name,k] of needs){
    let got=0;
    for(let i=0;i<k;i++) if(r.assign(name,i)>=0) got++;
    out.push([name,k,got]);
  }
  return {rows:out,used:r.used,free:n-r.used};
}