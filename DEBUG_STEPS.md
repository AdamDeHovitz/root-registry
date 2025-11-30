# Debug Steps for OCR Upload Error

## To prove the issue, please do the following:

### 1. Check Browser Console (Network Tab)
1. Open DevTools (F12 or right-click → Inspect)
2. Go to Network tab
3. Try uploading the image
4. Click on the `/api/ocr` request
5. Look at:
   - Request Headers → Content-Length (this is the size being sent)
   - Response tab → What error message is actually returned
   - Preview/Response → Full error text

### 2. Check if compression is running
1. Open DevTools Console tab
2. Try uploading the image
3. Look for any console.log or console.warn messages
4. Should see compression happening before upload

### 3. Test with a tiny image
1. Take a screenshot that's very small (like 500x500px)
2. Try uploading that
3. If it works, confirms it's a size issue

### 4. Check deployment
- Is this production (Vercel) or local development?
- If production, has the latest commit been deployed?

## What we're looking for:
- Request size > 4MB → proves size is the issue
- Error message from server → tells us actual problem
- If small images work but large ones don't → confirms size hypothesis
