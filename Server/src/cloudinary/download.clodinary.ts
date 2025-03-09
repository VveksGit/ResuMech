// import { rejects } from "assert";
// import axios from "axios";
// import fs from "fs";
// import { resolve } from "path";

// const downloadPdfFromClodinary = async (
//   cloudinaryUrl: string,
//   savePath: string
// ): Promise<void> => {
//   try {
//     const response = await axios({
//       url: cloudinaryUrl,
//       method: "GET",
//       responseType: "stream",
//     });

//     const writer = fs.createWriteStream(savePath);
//     response.data.pipe(writer);

//     return new Promise((resolve, reject) => {
//       writer.on("finish", () => {
//         console.log(`PDF downloaded successfully: ${savePath}`);
//         resolve();
//       });
//       writer.on("error", reject);
//     });
//   } catch (error) {
//     console.error("Error downloading PDF:", error);
//   }
// };

// export default downloadPdfFromClodinary;
