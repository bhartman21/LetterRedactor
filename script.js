const PDF_MAX_SIZE = 20 * 1024 * 1024; // 20 MB limit
const JPEG_QUALITY = 0.8;

const fileInput = document.getElementById('pdfFile');
const redactBtn = document.getElementById('redactBtn');
const viewerContainer = document.getElementById('pdf-viewer-container');
const sizeWarning = document.getElementById('fileSizeWarning');
const instructionText = document.getElementById('instruction-text');

let pdfData = null; 
let pdfDoc = null; 
let originalFileName = '';
let redactionAreas = []; 
let isDrawing = false;
let startX, startY; // Pixel coordinates relative to the canvas
let currentCanvas = null; // Reference to the canvas being drawn on

// Initialize jsPDF
const { jsPDF } = window.jspdf;

// --- UTILITY FUNCTIONS ---

/**
 * Converts canvas coordinates (pixels) to PDF coordinates (points) for a specific page.
 * @param {number} x_canvas - X coordinate relative to canvas (pixels)
 * @param {number} y_canvas - Y coordinate relative to canvas (pixels)
 * @param {object} viewport - The dynamically scaled viewport object from PDF.js
 */
function toPDFCoords(x_canvas, y_canvas, viewport) {
    const scaleFactor = viewport.scale; 
    const x_pdf = x_canvas / scaleFactor;
    const y_pdf_top = y_canvas / scaleFactor; 
    const pdf_height = viewport.height / scaleFactor;
    const y_pdf = pdf_height - y_pdf_top;
    return { x: x_pdf, y: y_pdf };
}

/**
 * Redraws all visual elements on the canvas (initial PDF rendering + temporary drawing guide).
 * NOTE: This is only for the *temporary* red box during mouse move.
 */
async function redrawPage(canvas, pageIndex, tempRect = null) {
    const context = canvas.getContext('2d');
    const page = await pdfDoc.getPage(pageIndex + 1);
    const viewport = page.getViewport({ scale: canvas.width / page.getViewport({ scale: 1 }).width });

    // 1. Clear and redraw PDF content
    const renderContext = { canvasContext: context, viewport: viewport };
    await page.render(renderContext).promise;

    // 2. Redraw existing permanent black boxes (from previous valid endDrawing events)
    const existingBoxes = redactionAreas.filter(area => area.pageIndex === pageIndex);
    for (const box of existingBoxes) {
        context.fillStyle = 'black';
        context.fillRect(box.minX_px, box.minY_px, box.width_px, box.height_px);
    }
    
    // 3. Draw temporary red box during mouse move
    if (tempRect) {
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        context.fillStyle = 'rgba(255, 0, 0, 0.3)';
        context.strokeRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h);
        context.fillRect(tempRect.x, tempRect.y, tempRect.w, tempRect.h);
    }
}


// --- RENDERING & INTERACTION ---

/**
 * Renders a single PDF page to a canvas and attaches event listeners.
 */
async function renderPage(pageNumber) {
    const page = await pdfDoc.getPage(pageNumber);
    const originalViewport = page.getViewport({ scale: 1 }); 

    const viewerWidth = viewerContainer.clientWidth - 40; 
    const renderScale = viewerWidth / originalViewport.width; 
    const viewport = page.getViewport({ scale: renderScale }); 

    const pageContainer = document.createElement('div');
    pageContainer.className = 'pdf-page-container';

    const canvas = document.createElement('canvas');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    canvas.setAttribute('data-page-index', pageNumber - 1); 

    const context = canvas.getContext('2d');
    const renderContext = { canvasContext: context, viewport: viewport };
    await page.render(renderContext).promise;

    pageContainer.appendChild(canvas);
    viewerContainer.appendChild(pageContainer);

    // Get the viewport object and pass it to the handlers
    canvas.addEventListener('mousedown', (e) => startDrawing(e, viewport));
    canvas.addEventListener('mousemove', (e) => drawRectangle(e));
    canvas.addEventListener('mouseup', (e) => endDrawing(e, viewport));
}

/**
 * Handles the start of a drag to mark a redaction area.
 */
function startDrawing(e, viewport) {
    if (e.button !== 0) return; 

    isDrawing = true;
    currentCanvas = e.currentTarget;

    // Use e.offsetX/Y for coordinates relative to the canvas
    startX = e.offsetX;
    startY = e.offsetY; 
    
    e.preventDefault();
}

/**
 * Handles the dragging action to size the redaction area.
 */
function drawRectangle(e) {
    if (!isDrawing || !currentCanvas) return;

    // Use e.offsetX/Y for coordinates relative to the canvas
    const currentX = e.offsetX;
    const currentY = e.offsetY;

    const minX = Math.min(startX, currentX);
    const minY = Math.min(startY, currentY);
    const width = Math.abs(startX - currentX);
    const height = Math.abs(startY - currentY);

    const pageIndex = parseInt(currentCanvas.getAttribute('data-page-index'));
    
    // Redraw the page with the temporary red box
    redrawPage(currentCanvas, pageIndex, { x: minX, y: minY, w: width, h: height });
}

/**
 * Finalizes the redaction area, converts coordinates, and stores the data.
 */
function endDrawing(e, viewport) {
    if (!isDrawing || !currentCanvas) return;
    isDrawing = false;
    
    const canvas = currentCanvas;

    // Use e.offsetX/Y for coordinates relative to the canvas
    const endX = e.offsetX;
    const endY = e.offsetY;

    // Calculate final pixel coordinates
    const minX_px = Math.min(startX, endX);
    const minY_px = Math.min(startY, endY);
    const width_px = Math.abs(startX - endX);
    const height_px = Math.abs(startY - endY);

    // If the box is too small, cancel the action
    if (width_px < 5 || height_px < 5) {
        const pageIndex = parseInt(canvas.getAttribute('data-page-index'));
        redrawPage(canvas, pageIndex); // Redraw without the temporary box
        currentCanvas = null;
        return;
    }

    // Draw the FINAL permanent black box directly on the canvas
    const context = canvas.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(minX_px, minY_px, width_px, height_px);

    // Store the pixel coordinates for final rasterization verification
    const redaction = {
        pageIndex: parseInt(canvas.getAttribute('data-page-index')),
        minX_px,
        minY_px,
        width_px,
        height_px
    };
    redactionAreas.push(redaction);

    currentCanvas = null;
}

// --- RASTERIZATION & DOWNLOAD LOGIC ---

async function applyRedactionsAndDownload() {
    if (!redactionAreas.length) {
        alert("Please upload a PDF and mark at least one area for blackout.");
        return;
    }

    if (!originalFileName) {
        // Fallback name if for some reason the name wasn't captured on upload
        originalFileName = 'document.pdf'; 
    }

    redactBtn.disabled = true;
    redactBtn.textContent = 'Processing...';

    try {
        const doc = new jsPDF(); // Initialize jsPDF document
        const pdfPages = document.querySelectorAll('.pdf-page-container canvas');

        for (let i = 0; i < pdfPages.length; i++) {
            const canvas = pdfPages[i];
            
            // NOTE: The redaction boxes were drawn during the 'endDrawing' phase, 
            // so canvas.toDataURL() will now capture the black pixels.
            //const imgData = canvas.toDataURL('image/png'); 
            const imgData = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

            if (i > 0) {
                doc.addPage();
            }

            // Calculations to fit the image onto the jsPDF page
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const pdfWidth = doc.internal.pageSize.getWidth();
            const pdfHeight = doc.internal.pageSize.getHeight();

            const widthRatio = pdfWidth / imgWidth;
            const heightRatio = pdfHeight / imgHeight;
            const ratio = Math.min(widthRatio, heightRatio);

            const finalImgWidth = imgWidth * ratio;
            const finalImgHeight = imgHeight * ratio;

            const xOffset = (pdfWidth - finalImgWidth) / 2;
            const yOffset = (pdfHeight - finalImgHeight) / 2;
            
            //doc.addImage(imgData, 'PNG', xOffset, yOffset, finalImgWidth, finalImgHeight);
            doc.addImage(imgData, 'JPEG', xOffset, yOffset, finalImgWidth, finalImgHeight);
        }

        const baseName = originalFileName.replace(/\.pdf$/i, ''); // Remove .pdf (case-insensitive)
        const newFileName = `${baseName}_REDACTED.pdf`;

        doc.save(newFileName); // Save the new, flattened PDF

        alert("Blackout complete! The securely flattened document has been downloaded. The text should no longer be selectable.");

    } catch (error) {
        console.error("Error during rasterization and PDF generation:", error);
        alert("Failed to create flattened PDF. Check the console for details.");
    } finally {
        redactBtn.disabled = false;
        redactBtn.textContent = '1. Blackout & Download Flattened';
    }
}

// --- EVENT HANDLERS ---

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    originalFileName = file.name;

    // 1. File size check (20MB limit)
    if (file.size > PDF_MAX_SIZE) {
        sizeWarning.textContent = `Error: File size exceeds the ${PDF_MAX_SIZE / 1024 / 1024}MB limit.`;
        fileInput.value = ''; 
        return;
    }
    sizeWarning.textContent = '';
    
    // Reset state
    redactionAreas = []; 
    viewerContainer.innerHTML = ''; 
    instructionText.style.display = 'none'; 

    redactBtn.disabled = true;

    // 2. Read file as ArrayBuffer
    const reader = new FileReader();
    reader.onload = async () => {
        pdfData = reader.result;
        try {
            pdfDoc = await pdfjsLib.getDocument({ data: pdfData }).promise;
            
            // 3. Render all pages
            const numPages = pdfDoc.numPages;
            for (let i = 1; i <= numPages; i++) {
                await renderPage(i); 
            }
            redactBtn.disabled = false;
            redactBtn.textContent = '1. Blackout & Download Flattened'; 
            alert("PDF loaded. Draw your blackout boxes, then click '1. Blackout & Download Flattened'.");

        } catch (error) {
            console.error("Error loading PDF:", error);
            alert("Failed to load PDF. Is it a valid file?");
            viewerContainer.innerHTML = '<p class="warning">Error loading PDF. Please try a different file.</p>';
            redactBtn.disabled = true;
        }
    };
    reader.readAsArrayBuffer(file);
});


redactBtn.addEventListener('click', applyRedactionsAndDownload);