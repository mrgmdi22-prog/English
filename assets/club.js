// Remembers the last page a student opened, so the home page can offer "continue where you left off".
(function(){
  try{
    var p = location.pathname;
    if(!/\/index\.html$|\/$/.test(p) || /\/capsules\/(index\.html)?$/.test(p)){
      localStorage.setItem('club-last', JSON.stringify({p:p, t:Date.now()}));
    }
  }catch(e){}
})();
