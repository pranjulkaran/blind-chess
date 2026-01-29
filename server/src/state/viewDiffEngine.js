export function diffViews(prev={},next={}){

  const diff={};

  const keys=new Set([
    ...Object.keys(prev),
    ...Object.keys(next)
  ]);

  for(const k of keys){
    const a=prev[k];
    const b=next[k];

    if(JSON.stringify(a)!==JSON.stringify(b)){
      diff[k]=b||null;
    }
  }

  return diff;
}
