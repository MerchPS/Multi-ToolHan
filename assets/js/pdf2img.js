// PDF to Image functionality

let pdfFile = null;
let pdfDoc = null;
let renderedPages = [];

// HTML template for PDF to image tool
function getPdf2ImgHTML() {
    return `
    <div class="space-y-6">
        <div class="dropzone" id="pdf-dropzone">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
            <p class="text-gray-600">Drag & drop file PDF di sini atau klik untuk mengupload</p>
            <input type="file" id="pdf-input" accept=".pdf" class="hidden">
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label for="quality-select" class="block text-sm font-medium text-gray-700 mb-1">Kualitas Output:</label>
                <select id="quality-select" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
                    <option value="low">Rendah (ukuran kecil)</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">Tinggi (ukuran besar)</option>
                </select>
            </div>
            
            <div>
                <label for="format-select" class="block text-sm font-medium text-gray-700 mb-1">Format Output:</label>
                <select id="format-select" class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500">
                    <option value="png">PNG (kualitas terbaik)</option>
                    <option value="jpeg" selected>JPEG (ukuran kecil)</option>
                </select>
            </div>
        </div>
        
        <div id="pdf-info" class="hidden bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 class="font-medium text-blue-800">Informasi PDF</h3>
            <p id="pdf-name" class="text-blue-700"></p>
            <p id="pdf-pages" class="text-blue-700"></p>
            <p id="pdf-size" class="text-blue-700"></p>
        </div>
        
        <div id="page-previews" class="preview-grid hidden"></div>
        
        <div class="flex justify-end space-x-4">
            <button id="render-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <i class="fas fa-image mr-2"></i>Render Halaman
            </button>
            
            <button id="download-all-btn" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <i class="fas fa-download mr-2"></i>Download Semua
            </button>
        </div>
    </div>
    `;
}

// Initialize PDF to image tool
function initPdf2Img() {
    const dropzone = document.getElementById('pdf-dropzone');
    const fileInput = document.getElementById('pdf-input');
    const renderBtn = document.getElementById('render-btn');
    const downloadAllBtn = document.getElementById('download-all-btn');
    
    // Setup dropzone
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('active');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('active');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('active');
        
        if (e.dataTransfer.files.length > 0 && e.dataTransfer.files[0].type === 'application/pdf') {
            handlePdfFile(e.dataTransfer.files[0]);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0 && e.target.files[0].type === 'application/pdf') {
            handlePdfFile(e.target.files[0]);
        }
    });
    
    renderBtn.addEventListener('click', renderPdfPages);
    downloadAllBtn.addEventListener('click', downloadAllPages);
}

// Handle uploaded PDF file
function handlePdfFile(file) {
    pdfFile = file;
    pdfDoc = null;
    renderedPages = [];
    
    // Display PDF info
    const pdfInfo = document.getElementById('pdf-info');
    const pdfName = document.getElementById('pdf-name');
    const pdfPages = document.getElementById('pdf-pages');
    const pdfSize = document.getElementById('pdf-size');
    
    pdfName.textContent = `Nama: ${file.name}`;
    pdfSize.textContent = `Ukuran: ${utils.formatFileSize(file.size)}`;
    pdfPages.textContent = 'Jumlah halaman: Memuat...';
    
    pdfInfo.classList.remove('hidden');
    
    // Enable render button
    document.getElementById('render-btn').disabled = false;
    document.getElementById('download-all-btn').disabled = true;
    
    // Load PDF to get page count
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const typedArray = new Uint8Array(e.target.result);
        
        // Load PDF.js library dynamically
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
        script.onload = function() {
            pdfjsLib = window['pdfjs-dist/build/pdf'];
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            
            // Get PDF document
            pdfjsLib.getDocument(typedArray).promise.then(doc => {
                pdfDoc = doc;
                pdfPages.textContent = `Jumlah halaman: ${doc.numPages}`;
            }).catch(error => {
                console.error('Error loading PDF:', error);
                alert('Terjadi kesalahan saat memuat PDF. Silakan coba lagi.');
            });
        };
        
        document.head.appendChild(script);
    };
    
    reader.readAsArrayBuffer(file);
}

// Render PDF pages to images
function renderPdfPages() {
    if (!pdfDoc) {
        alert('Silakan upload file PDF terlebih dahulu!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Get quality and format settings
    const quality = document.getElementById('quality-select').value;
    const format = document.getElementById('format-select').value;
    
    // Determine scale based on quality
    let scale = 1.5; // Default for medium quality
    
    if (quality === 'low') {
        scale = 1.0;
    } else if (quality === 'high') {
        scale = 2.0;
    }
    
    // Clear previous renders
    renderedPages = [];
    const previewContainer = document.getElementById('page-previews');
    previewContainer.innerHTML = '';
    
    // Render each page
    const renderPromises = [];
    
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        renderPromises.push(renderPage(i, scale, format));
    }
    
    // Wait for all pages to render
    Promise.all(renderPromises).then(() => {
        // Display page previews
        displayPagePreviews();
        
        // Enable download all button
        document.getElementById('download-all-btn').disabled = false;
        
        document.getElementById('loading').classList.add('hidden');
    }).catch(error => {
        console.error('Error rendering PDF pages:', error);
        alert('Terjadi kesalahan saat merender halaman PDF. Silakan coba lagi.');
        document.getElementById('loading').classList.add('hidden');
    });
}

// Render a single PDF page
function renderPage(pageNumber, scale, format) {
    return new Promise((resolve, reject) => {
        pdfDoc.getPage(pageNumber).then(page => {
            const viewport = page.getViewport({ scale });
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            const renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            
            page.render(renderContext).promise.then(() => {
                // Get image data URL
                let quality = 0.8;
                if (format === 'png') {
                    quality = 1.0;
                }
                
                const imageData = canvas.toDataURL(`image/${format}`, quality);
                
                // Store rendered page
                renderedPages.push({
                    pageNumber,
                    imageData,
                    format
                });
                
                resolve();
            }).catch(reject);
        }).catch(reject);
    });
}

// Display page previews
function displayPagePreviews() {
    const previewContainer = document.getElementById('page-previews');
    previewContainer.innerHTML = '';
    
    renderedPages.forEach(page => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        
        previewItem.innerHTML = `
            <img src="${page.imageData}" alt="Halaman ${page.pageNumber}">
            <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-center py-1">
                Halaman ${page.pageNumber}
            </div>
            <div class="absolute top-0 right-0 m-1">
                <button class="download-page-btn bg-blue-500 text-white rounded-full p-1" data-page="${page.pageNumber}">
                    <i class="fas fa-download text-xs"></i>
                </button>
            </div>
        `;
        
        previewContainer.appendChild(previewItem);
        
        // Add download button event
        previewItem.querySelector('.download-page-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            downloadPage(page.pageNumber);
        });
    });
    
    previewContainer.classList.remove('hidden');
}

// Download a single page
function downloadPage(pageNumber) {
    const page = renderedPages.find(p => p.pageNumber === pageNumber);
    
    if (!page) {
        alert('Halaman tidak ditemukan!');
        return;
    }
    
    const link = document.createElement('a');
    link.href = page.imageData;
    link.download = `halaman-${pageNumber}.${page.format}`;
    link.click();
}

// Download all pages as ZIP
function downloadAllPages() {
    if (renderedPages.length === 0) {
        alert('Tidak ada halaman yang di-render!');
        return;
    }
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Load JSZip library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = function() {
        const JSZip = window.JSZip;
        const zip = new JSZip();
        
        // Add each page to the zip
        renderedPages.forEach(page => {
            // Convert data URL to blob
            const blob = dataURLToBlob(page.imageData);
            
            // Add to zip
            zip.file(`halaman-${page.pageNumber}.${page.format}`, blob);
        });
        
        // Generate zip file
        zip.generateAsync({ type: 'blob' }).then(content => {
            // Create download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${pdfFile.name.replace('.pdf', '')}-images.zip`;
            link.click();
            
            // Clean up
            URL.revokeObjectURL(link.href);
            
            document.getElementById('loading').classList.add('hidden');
        }).catch(error => {
            console.error('Error creating ZIP:', error);
            alert('Terjadi kesalahan saat membuat file ZIP. Silakan coba lagi.');
            document.getElementById('loading').classList.add('hidden');
        });
    };
    
    document.head.appendChild(script);
}

// Convert data URL to blob
function dataURLToBlob(dataURL) {
    const parts = dataURL.split(';base64,');
    const contentType = parts[0].split(':')[1];
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    
    for (let i = 0; i < raw.length; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
    }
    
    return new Blob([uInt8Array], { type: contentType });
}

// Export functions for global access
window.getPdf2ImgHTML = getPdf2ImgHTML;
window.initPdf2Img = initPdf2Img;