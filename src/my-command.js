import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

export default function() {
 
  let document = sketch.getSelectedDocument();
  let sharedTextStyles = document.sharedTextStyles;

  sharedTextStyles = sharedTextStyles.filter((sharedTextStyle) =>
    sharedTextStyle.getLibrary()
  );

  let libraryNames = sharedTextStyles.map(
    (sharedTextStyle) => sharedTextStyle.getLibrary().name
  );

   libraryNames = Array.from(new Set(libraryNames))  
  if (libraryNames.length === 0) {
    sketch.UI.message("This document does not have text styles from libraries 😅")
  } else {
    detachTextStyles(sharedTextStyles, libraryNames);
  }
}


const detachTextStyles = (sharedTextStyles, libraryNames) => { 
  sketch.UI.getInputFromUser(
    "From which library do you want to detach?",
    {
      type: sketch.UI.INPUT_TYPE.selection,
      possibleValues: libraryNames,
    },
    (err, chosenLibrary) => {

      sharedTextStyles = sharedTextStyles.filter(
        (sharedTextStyle) => sharedTextStyle.getLibrary().name === chosenLibrary
      );
      let detachCounter = 0;
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

        layersWithSharedStyle.forEach((layerWithStyle) => {
          let outOfSync = layerWithStyle.style.isOutOfSyncWithSharedStyle(
            sharedStyle
          );
          if (outOfSync) {
            layerWithStyle.sharedStyle = 0;
            detachCounter++;
          }
        });
      });

      if (detachCounter === 0) {
        sketch.UI.message(`No layers with out of sync text styles from ${chosenLibrary} 🙌`)
      } else {
        sketch.UI.message(`Successfully detached ${detachCounter} textLayer${getPlural(detachCounter)} from ${chosenLibrary} 🙌`)

      }
      if (err) {
        // most likely the user canceled the input
        return;
      }
    }
  );
}

const getPlural = (number) => {
  if (number > 1) {
    return "s"
  } else {
    return ""
  }
}