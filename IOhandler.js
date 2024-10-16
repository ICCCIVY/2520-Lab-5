const fs = require("fs");
const PNG = require("pngjs").PNG;
const path = require("path");
const yauzl = require('yauzl-promise');
const { pipeline } = require('stream/promises');
/**
 * Description: decompress file from given pathIn, write to given pathOut
 *
 * @param {string} pathIn
 * @param {string} pathOut
 * @return {promise}
 */
const unzip =  async (pathIn, pathOut) => {
  
  try {
    const zip = await yauzl.open(pathIn);
    await fs.promises.mkdir(pathOut, { recursive: true });
    try{
      for await (const entry of zip) {
      const filePath = path.join(pathOut, entry.filename);
      console.log(`Processing file: ${filePath}`);
      if (entry.filename.endsWith("/")) {
        await fs.promises.mkdir(filePath, { recursive: true });
        console.log(`Created directory: ${filePath}`);
      } else {
        const readStream = await entry.openReadStream();
        const writeStream = fs.createWriteStream(filePath);
        await pipeline(readStream, writeStream);
        console.log(`Extracted file: ${filePath}`);
      } 
    }
  } finally {
    await zip.close();
  }
  console.log("Uzipped");
 } catch (err) {
  console.error("Error unzipping file:", err);
}
};




/**
 * Description: read all the png files from given directory and return Promise containing array of each png file path
 *
 * @param {string} path
 * @return {promise}
 */
const readDir = async (dir) => {
  return fs.promises.readdir(dir)
    .then(files => {
      const pngFiles = files.filter(file => file.endsWith('.png'));
      return pngFiles.map(file => path.join(dir, file));
    })
    .catch(err => {
      console.error('Error reading directory:', err);
      throw err; 
    });

};

/**
 * Description: Read in png file by given pathIn,
 * convert to grayscale and write to given pathOut
 *
 * @param {string} filePath
 * @param {string} pathProcessed
 * @return {promise}
 */
const grayScale = (pathIn, pathOut) => {
  return new Promise((resolve, reject) => {
    // Read the input PNG file as a stream and parse it
    fs.createReadStream(pathIn)
      .pipe(new PNG()) // Parse the PNG file
      .on("parsed", function () {
        // Loop through each pixel (each pixel has 4 values: R, G, B, and A)
        for (let i = 0; i < this.data.length; i += 4) {
          const avg = (this.data[i] + this.data[i + 1] + this.data[i + 2]) / 3; // Average of RGB values
          this.data[i] = this.data[i + 1] = this.data[i + 2] = avg; // Set R, G, B to the average (grayscale)
        }

        // Pack the modified image data and write it to the output file
        this.pack()
          .pipe(fs.createWriteStream(pathOut))
          .on("finish", () => {
            console.log(`Grayscaled image saved to ${pathOut}`);
            resolve(); // Resolve the promise when finished
          })
          .on("error", reject); // Handle errors during writing
      })
      .on("error", reject); // Handle errors during reading/parsing
  });
};


module.exports = {
  unzip,
  readDir,
  grayScale,
};


