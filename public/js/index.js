if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js').then(function(reg) {
        console.log(reg);
    }).catch(function(error){
        console.log(error);
    });
  }