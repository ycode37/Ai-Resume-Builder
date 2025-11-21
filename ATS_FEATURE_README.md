# ATS Score Checker Feature

This feature has been successfully implemented with the following components:

## Frontend Components (Already Created)
1. **ATSScoreChecker.jsx** - Located at `Frontend/src/components/custom/ATSScoreChecker.jsx`
   - Button added to the navbar
   - Opens a dialog window on click
   - Two options: Upload from PC or Select existing resume
   - 10-second analysis delay before showing results
   - Displays ATS score with color-coded results
   - Shows strengths, improvements, and detected keywords

2. **Header.jsx** - Updated to include ATS Score Checker button

## Backend Components (Newly Created)
1. **ats.controller.js** - Located at `Backend/src/controller/ats.controller.js`
   - AI-powered resume analysis using Google Gemini
   - Handles both file uploads and existing resumes
   - Generates ATS scores with detailed feedback

2. **ats.routes.js** - Located at `Backend/src/routes/ats.routes.js`
   - `/api/ats/check-file` - Endpoint for uploaded files
   - `/api/ats/check-existing` - Endpoint for existing resumes
   - File validation for PDF and DOCX (max 5MB)

3. **app.js** - Updated to include ATS routes

## Required Environment Variables

Make sure your backend `.env` file includes:
```
GEMENI_API_KEY=your_google_gemini_api_key_here
MONGODB_URI=your_mongodb_uri
PORT=5001
JWT_SECRET_KEY=your_jwt_secret
JWT_SECRET_EXPIRES_IN="1d"
NODE_ENV=Dev
ALLOWED_SITE=http://localhost:5173
```

Make sure your frontend `.env` file includes:
```
VITE_GEMENI_API_KEY=your_google_gemini_api_key_here
VITE_APP_URL=http://localhost:5001/
```

## How It Works

1. User clicks "ATS Score Checker" button in the navbar
2. A dialog opens with two options:
   - **Upload from PC**: Upload a PDF or DOCX resume file
   - **Select Existing Resume**: Choose from resumes already created in the app
3. User clicks "Analyze Resume" button
4. The system shows a loading state for 10 seconds
5. After 10 seconds, AI analyzes the resume and displays:
   - ATS Compatibility Score (0-100)
   - Rating (Excellent/Good/Fair/Poor)
   - Strengths
   - Areas for Improvement
   - Detected Keywords

## Testing the Feature

### 1. Start the Backend
```bash
cd Backend
# Make sure you have a .env file with GEMENI_API_KEY
npm run dev
```

### 2. Start the Frontend
```bash
cd Frontend
npm run dev
```

### 3. Test Scenarios
- Login to the application
- Click "ATS Score Checker" in the navbar
- Test uploading a PDF/DOCX file
- Test selecting an existing resume
- Verify the 10-second loading delay
- Check the ATS score results display

## Dependencies Installed
- `multer` - For handling file uploads in backend
- `@google/generative-ai` - For AI-powered resume analysis

## Future Enhancements (Optional)
1. Add actual PDF/DOCX text extraction using libraries like:
   - `pdf-parse` for PDF files
   - `mammoth` for DOCX files
2. Add resume parsing to extract structured data from uploaded files
3. Add comparison feature to compare multiple resumes
4. Add historical ATS score tracking
