// Image to PDF functionality

let imageFiles = [];
let processedImages = [];

// HTML template for image to PDF tool
function getImg2PdfHTML() {
    return `
    <div class="space-y-6">
        <div class="dropzone" id="img-dropzone">
            <i class="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-2"></i>
            <p class="text-gray-600">Drag & drop gambar di sini atau klik untuk mengupload</p>
            <p class="text-sm text-gray-500 mt-1">Format yang didukung: JPG, PNG, GIF</p>
            <input type="file" id="img-input" accept="image/*" multiple class="hidden">
        </div>
        
        <div class="flex items-center">
            <input type="checkbox" id="enhanced-mode" class="mr-2 h-4 w-4 text-blue-600">
            <label for="enhanced-mode" class="text-sm font-medium text-gray-700">Aktifkan Enchanted Scan Mode (grayscale, contrast, sharpen)</label>
        </div>
        
        <div id="image-previews" class="preview-grid hidden"></div>
        
        <div class="flex justify-end">
            <button id="convert-btn" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                <i class="fas fa-file-pdf mr-2"></i>Convert to PDF
            </button>
        </div>
        
        <div id="pdf-result" class="hidden text-center">
            <i class="fas fa-file-pdf text-6xl text-red-500 mb-4"></i>
            <p class="text-gray-700">PDF berhasil dibuat!</p>
            <button id="download-pdf" class="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                <i class="fas fa-download mr-2"></i>Download PDF
            </button>
        </div>
    </div>
    `;
}

// Initialize image to PDF tool
function initImg2Pdf() {
    const dropzone = document.getElementById('img-dropzone');
    const fileInput = document.getElementById('img-input');
    const convertBtn = document.getElementById('convert-btn');
    
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
        
        if (e.dataTransfer.files.length > 0) {
            handleImageFiles(e.dataTransfer.files);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleImageFiles(e.target.files);
        }
    });
    
    convertBtn.addEventListener('click', convertToPdf);
}

// Handle uploaded image files
function handleImageFiles(files) {
    imageFiles = [];
    processedImages = [];
    
    // Filter only image files
    for (let i = 0; i < files.length; i++) {
        if (files[i].type.startsWith('image/')) {
            imageFiles.push(files[i]);
        }
    }
    
    if (imageFiles.length === 0) {
        alert('Tidak ada file gambar yang valid. Silakan upload file dengan format JPG, PNG, atau GIF.');
        return;
    }
    
    // Display previews
    displayImagePreviews(imageFiles);
    
    // Enable convert button
    document.getElementById('convert-btn').disabled = false;
}

// Display image previews
function displayImagePreviews(files) {
    const previewContainer = document.getElementById('image-previews');
    previewContainer.innerHTML = '';
    
    files.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="Preview">
                <div class="remove-btn" data-index="${index}">
                    <i class="fas fa-times text-red-500"></i>
                </div>
            `;
            
            previewContainer.appendChild(previewItem);
            
            // Add remove button event
            previewItem.querySelector('.remove-btn').addEventListener('click', (event) => {
                event.stopPropagation();
                removeImage(index);
            });
        };
        
        reader.readAsDataURL(file);
    });
    
    previewContainer.classList.remove('hidden');
}

// Remove image from preview
function removeImage(index) {
    imageFiles.splice(index, 1);
    
    if (imageFiles.length === 0) {
        document.getElementById('image-previews').classList.add('hidden');
        document.getElementById('convert-btn').disabled = true;
    } else {
        displayImagePreviews(imageFiles);
    }
}

// Convert images to PDF
function convertToPdf() {
    const enhancedMode = document.getElementById('enhanced-mode').checked;
    
    // Show loading
    document.getElementById('loading').classList.remove('hidden');
    
    // Process images
    processImages(enhancedMode).then(() => {
        // Create PDF
        createPDF();
        document.getElementById('loading').classList.add('hidden');
    }).catch(error => {
        console.error('Error processing images:', error);
        alert('Terjadi kesalahan saat memproses gambar. Silakan coba lagi.');
        document.getElementById('loading').classList.add('hidden');
    });
}

// Process images with optional enhancement
function processImages(enhancedMode) {
    return new Promise((resolve, reject) => {
        processedImages = [];
        let processedCount = 0;
        
        if (imageFiles.length === 0) {
            reject('No images to process');
            return;
        }
        
        imageFiles.forEach((file, index) => {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = new Image();
                img.onload = function() {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    
                    // Set canvas dimensions
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0);
                    
                    if (enhancedMode) {
                        // Apply image enhancements
                        applyImageEnhancements(ctx, canvas.width, canvas.height);
                    }
                    
                    // Get image data URL
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                    processedImages.push(dataUrl);
                    
                    processedCount++;
                    
                    if (processedCount === imageFiles.length) {
                        resolve();
                    }
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = function() {
                reject('Error reading file');
            };
            
            reader.readAsDataURL(file);
        });
    });
}

// Apply image enhancements
function applyImageEnhancements(ctx, width, height) {
    // Get image data
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Convert to grayscale and adjust contrast
    for (let i = 0; i < data.length; i += 4) {
        // Grayscale (luminosity method)
        const gray = 0.3 * data[i] + 0.59 * data[i + 1] + 0.11 * data[i + 2];
        
        // Increase contrast
        const contrast = 1.5;
        const adjusted = (gray - 128) * contrast + 128;
        
        // Set RGB to the adjusted grayscale value
        data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, adjusted));
    }
    
    // Put modified image data back
    ctx.putImageData(imageData, 0, 0);
}

// Create PDF from processed images
function createPDF() {
    // Load jsPDF library dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = function() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        processedImages.forEach((imgData, index) => {
            if (index > 0) {
                doc.addPage();
            }
            
            // Get image dimensions
            const img = new Image();
            img.src = imgData;
            
            // Calculate dimensions to fit page
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            
            let imgWidth = pageWidth - 20; // Margin
            let imgHeight = (img.height * imgWidth) / img.width;
            
            // If image height exceeds page height, scale down
            if (imgHeight > pageHeight - 20) {
                imgHeight = pageHeight - 20;
                imgWidth = (img.width * imgHeight) / img.height;
            }
            
            // Center image on page
            const x = (pageWidth - imgWidth) / 2;
            const y = (pageHeight - imgHeight) / 2;
            
            // Add image to PDF
            doc.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
        });
        
        // Generate PDF data URL
        const pdfDataUrl = doc.output('datauristring');
        
        // Show download button
        const pdfResult = document.getElementById('pdf-result');
        pdfResult.classList.remove('hidden');
        
        // Set up download button
        const downloadBtn = document.getElementById('download-pdf');
        downloadBtn.onclick = function() {
            const link = document.createElement('a');
            link.href = pdfDataUrl;
            link.download = 'converted-images.pdf';
            link.click();
        };
    };
    
    document.head.appendChild(script);
}

// Export functions for global access
window.getImg2PdfHTML = getImg2PdfHTML;
window.initImg2Pdf = initImg2Pdf;