if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
        console.log(reg);
        reg.update();
    }).catch(function(error){
        console.log(error);
    });
  }