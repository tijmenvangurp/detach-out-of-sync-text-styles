var onRun = function (context) {
  let sketch = require("sketch");
  let UI = require("sketch/ui");
  let document = sketch.getSelectedDocument();
  let sharedTextStyles = document.sharedTextStyles;

  sharedTextStyles = sharedTextStyles.filter((sharedTextStyle) =>
    sharedTextStyle.getLibrary()
  );

  let libraryNames = sharedTextStyles.map(
    (sharedTextStyle) => sharedTextStyle.getLibrary().name
  );
   libraryNames = Array.from(new Set(libraryNames))  

  UI.getInputFromUser(
    "Which library do you want to detach out of sync text styles from?",
    {
      type: UI.INPUT_TYPE.selection,
      possibleValues: libraryNames,
    },
    (err, chosenLibrary) => {
      sharedTextStyles = sharedTextStyles.filter(
        (sharedTextStyle) => sharedTextStyle.getLibrary().name === chosenLibrary
      );
      sharedTextStyles.forEach((sharedStyle) => {
        let layersWithSharedStyle = sharedStyle.getAllInstancesLayers();

        if (layersWithSharedStyle.length == 0) {
          const success = sharedStyle.unlinkFromLibrary();
          if (success) {
            log(
              `${sharedStyle.name} is not applied on any layer in the document and is removed from this document`
            );
          } else {
            log("unable to detach style");
          }
        }
        // log(layersWithSharedStyle.map(layer => layer.name))
        layersWithSharedStyle.forEach((layerWithStyle) => {
          let outOfSync = layerWithStyle.style.isOutOfSyncWithSharedStyle(
            sharedStyle
          );
          if (outOfSync) {
            layerWithStyle.sharedStyle = 0;
          }
        });
      });
      if (err) {
        // most likely the user canceled the input
        return;
      }
    }
  );
};
