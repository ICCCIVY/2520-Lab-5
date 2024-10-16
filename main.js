const path = require("path");
const fs = require("fs");

const IOhandler = require("./IOhandler");
const zipFilePath = path.join(__dirname, "myfile.zip");
const pathUnzipped = path.join(__dirname, "unzipped");
const pathProcessed = path.join(__dirname, "grayscaled");

(async () => {
    try {
      // Step 1: Unzip the file
      console.log(`Unzipping file from ${zipFilePath} to ${pathUnzipped}`);
      await IOhandler.unzip(zipFilePath, pathUnzipped);
  
      // Step 2: Read all PNG files from the unzipped directory
      console.log(`Reading PNG files from ${pathUnzipped}`);
      const pngFiles = await IOhandler.readDir(pathUnzipped);
  
      // Ensure the processed (grayscaled) directory exists
      await fs.promises.mkdir(pathProcessed, { recursive: true });
  
      // Step 3: Apply grayscale filter to each image
      for (const pngFile of pngFiles) {
        const outputImagePath = path.join(pathProcessed, path.basename(pngFile));  // Get output path
        console.log(`Processing file ${pngFile} and saving as ${outputImagePath}`);
        await IOhandler.grayScale(pngFile, outputImagePath);  // Apply grayscale
      }
  
      console.log("Grayscale transformation complete for all images.");
    } catch (error) {
      console.error("Error during processing:", error);
    }
  })();