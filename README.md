# VET-Redact 🛡️

**A Secure, Client-Side Tool for Redacting PII in Veteran Documents**

VET-Redact is a free, secure web application designed specifically for veterans to protect their personal information when sharing claim letters, decision letters, and other sensitive documents. Built by a veteran, for veterans.

## 🎯 Purpose

When veterans need to share their VA claim letters or decision letters for assistance, advice, or advocacy, they often contain sensitive personal information including:
- Social Security Numbers
- Service member identification numbers
- Personal addresses
- Medical information
- Financial details
- Other personally identifiable information (PII)

VET-Redact allows you to safely blackout this sensitive information and download a "flattened" PDF where the redacted areas are permanently removed and cannot be recovered.

## 🔒 Security & Privacy

- **100% Client-Side Processing**: Your documents never leave your computer
- **No Server Uploads**: All processing happens locally in your browser
- **No Data Storage**: Nothing is saved, logged, or transmitted
- **Permanent Redaction**: Creates flattened PDFs where redacted content cannot be recovered
- **Open Source**: Code is transparent and auditable

## ✨ Features

- **Simple Drag-and-Drop Interface**: Easy to use for veterans of all technical levels
- **Visual Redaction**: Click and drag to mark areas for blackout
- **Real-Time Preview**: See exactly what will be redacted before downloading
- **Multiple Page Support**: Works with multi-page documents
- **High-Quality Output**: Maintains document clarity while securing your information
- **File Size Limit**: 20MB maximum for optimal performance
- **Free Forever**: No subscriptions, no hidden costs, no registration required

## 🚀 How to Use

1. **Upload Your Document**
   - Click "Choose File" and select your PDF
   - Supports files up to 20MB
   - Common formats: VA claim letters, decision letters, medical records

2. **Mark Areas to Redact**
   - Click and drag over any text or information you want to blackout
   - Draw rectangles around Social Security Numbers, addresses, or other PII
   - You can create multiple redaction areas on each page
   - Red preview boxes show what will be redacted

3. **Download Secure Document**
   - Click "Blackout & Download Flattened"
   - Your redacted document will download automatically
   - Filename will include "_REDACTED" for easy identification
   - Share the redacted version safely

## 📋 System Requirements

- **Modern Web Browser**: Chrome, Firefox, Safari, or Edge (latest versions)
- **JavaScript Enabled**: Required for document processing
- **Sufficient RAM**: At least 4GB recommended for large documents

## 🛠️ Technical Details

- **Frontend**: HTML5, CSS3, JavaScript
- **PDF Processing**: PDF.js library for viewing and manipulation
- **PDF Generation**: jsPDF library for creating flattened output
- **Image Quality**: JPEG compression (80% quality) for optimal file size
- **Canvas Rendering**: High-fidelity document rasterization

## 📱 Browser Compatibility

| Browser | Version | Support | Notes |
|---------|---------|---------|-------|
| Chrome | 63+ | ✅ Full Support | Recommended for best performance |
| Firefox | 78+ | ✅ Full Support | |
| Safari | 14+ | ✅ Full Support | iOS Safari 14+ also supported |
| Edge | 79+ | ✅ Full Support | Chromium-based Edge |
| Internet Explorer | Any | ❌ Not Supported | Use modern browser instead |

**Requirements:** ES6+ support, Canvas API, FileReader API, and modern JavaScript features

## 🤝 For Veterans, By Veterans

This tool was created by a veteran who understands the importance of protecting sensitive information while still being able to seek help and advocacy. Whether you're:

- Seeking help with a claim denial
- Sharing documents with a Veterans Service Officer (VSO)
- Getting assistance from other veterans
- Consulting with legal representation
- Posting in veteran support forums

VET-Redact ensures your personal information stays protected.

## 🔧 Running Locally

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. No server setup required - runs entirely in your browser

## 🐛 Troubleshooting

**Q: My PDF won't load**
- Ensure the file is a valid PDF format
- Check that the file size is under 20MB
- Try a different browser if issues persist

**Q: Redaction areas aren't showing**
- Make sure you're clicking and dragging, not just clicking
- Ensure the rectangle is large enough (minimum 5x5 pixels)
- Try refreshing the page and re-uploading

**Q: Download isn't working**
- Check that popups are allowed for this site
- Ensure you have sufficient disk space
- Try using a different browser

## 📄 License

This project is released under the MIT License. Free to use, modify, and distribute.

## 🙏 Support

If you find this tool helpful, please:
- Share it with other veterans who might need it
- Report any issues or suggest improvements
- Consider contributing to the codebase

## ⚠️ Important Notes

- Always review your redacted document before sharing
- This tool is for informational redaction only - not legal advice
- For highly sensitive documents, consult with appropriate professionals
- Keep original documents secure and backed up

---

**Made with ❤️ for the veteran community**

*Semper Fi, Hooah, Hooyah, Oorah, Semper Paratus* 🇺🇸
