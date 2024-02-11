const path = require('path');
const { randomUUID } = require('crypto');

const FILE_DIR = 'tmp';

/**
 * Convert byte to mb
 * @param {number} byte 
 * @returns {number}
 */
function byteToMb(byte) {
  return byte / 1_000_000;
}

/**
 * Rename file in tmp dir
 * @param {import('express-fileupload').UploadedFile} file 
 * @returns {Promise<{ originalFileName: string, randomName: string, size: string, mimetype: string }>}
 */
async function renameTmpFile(file) {
  const originalFileName = file.name;
  const randomName = randomFileName(file);

  const filePath = path.join(FILE_DIR, randomName);

  return new Promise((resolve ,reject) => {
    file.mv(filePath, (error) => {
      if (error) return reject(error);
      resolve({
        originalFileName,
        randomName,
        size: file.size,
        mimetype: file.mimetype
      });
    })
  })
}

/**
 * Random a new file name using UUID
 * @param {import('express-fileupload').UploadedFile} file 
 * @returns {string}
 */
function randomFileName(file) {
  const uuid = randomUUID();
  const ext = path.extname(file.name);

  return uuid + ext;
}

module.exports = {
  byteToMb,
  renameTmpFile,
  randomFileName
}