var SuperInteractorsSingleton = function(environment) {
  var modulesMan=environment.modules;
  var cachedInterfaces=[];
  this.SuperInteractor = function(myHardware) {
    environment.on('module created', function(evt) {
      if (!(engagedInterface || myModuleCreator.engaged)) {
        updateHardware();
      }
    });
  }
}