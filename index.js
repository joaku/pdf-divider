const { PDFDocument } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const basePath = path.resolve(process.cwd());
const inputDir = path.join(basePath, 'input');
const outputDir = path.join(basePath, 'output');

async function splitPdfByPage(filePath, outputFolderPath) {
    const existingPdfBytes = fs.readFileSync(filePath);
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const numberOfPages = pdfDoc.getPageCount();
    const originalFileName = path.basename(filePath, '.pdf'); // Obtiene el nombre del archivo sin la extensión .pdf

    for (let i = 0; i < numberOfPages; i++) {
        const newPdfDoc = await PDFDocument.create();
        const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [i]);
        newPdfDoc.addPage(copiedPage);

        const pdfBytes = await newPdfDoc.save();
        const outputFilePath = path.join(outputFolderPath, `${originalFileName}_${i + 1}.pdf`);
        fs.writeFileSync(outputFilePath, pdfBytes);
        console.log(`Página ${i + 1} guardada como ${outputFilePath}`);
    }
}

function ensureOutputDirExists(outputPath) {
    if (!fs.existsSync(outputPath)) {
        fs.mkdirSync(outputPath, { recursive: true });
    }
}

function ensureDirectoriesExist() {
  if (!fs.existsSync(inputDir)){
      fs.mkdirSync(inputDir);
  }
  if (!fs.existsSync(outputDir)){
      fs.mkdirSync(outputDir);
  }
}

function processInputDirectory() {
  ensureDirectoriesExist(); // Asegura que input y output existan antes de proceder
  fs.readdir(inputDir, (err, files) => {
        if (err) {
            console.error("Error al listar archivos del directorio 'input':", err);
            return;
        }

        files.forEach(file => {
            if (path.extname(file).toLowerCase() === '.pdf') {
                const inputFilePath = path.join(inputDir, file);
                const outputFolderPath = path.join(outputDir, path.basename(file, '.pdf'));
                ensureOutputDirExists(outputFolderPath);

                splitPdfByPage(inputFilePath, outputFolderPath).catch(console.error);
            }
        });
    });
}

processInputDirectory();
