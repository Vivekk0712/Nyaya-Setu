# Vertex AI Setup Guide

## Why Vertex AI?
- ✅ Much higher quotas than AI Studio
- ✅ Better rate limits
- ✅ Production-ready
- ✅ Pay-as-you-go pricing
- ✅ No daily free tier limits

## Setup Steps

### 1. Create Google Cloud Project
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Note your PROJECT_ID

### 2. Enable Vertex AI API
```bash
gcloud services enable aiplatform.googleapis.com
```

Or via Console:
1. Go to https://console.cloud.google.com/apis/library
2. Search for "Vertex AI API"
3. Click "Enable"

### 3. Create Service Account
```bash
# Create service account
gcloud iam service-accounts create nyaya-setu-ai \
    --display-name="Nyaya Setu AI Service Account"

# Grant Vertex AI User role
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:nyaya-setu-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/aiplatform.user"

# Create and download key
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=nyaya-setu-ai@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

Or via Console:
1. Go to IAM & Admin > Service Accounts
2. Create Service Account
3. Grant role: "Vertex AI User"
4. Create JSON key and download

### 4. Configure Environment

Update `backend/.env`:
```env
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

Place the `service-account-key.json` file in the `backend/` directory.

### 5. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 6. Test the Setup
```bash
python -c "import vertexai; vertexai.init(project='YOUR_PROJECT_ID', location='us-central1'); print('✅ Vertex AI configured successfully!')"
```

### 7. Start Backend
```bash
python main_simple.py
```

## Pricing

Vertex AI Gemini pricing (as of 2024):
- **Gemini 2.0 Flash**: $0.075 per 1M input tokens, $0.30 per 1M output tokens
- **Much cheaper than rate-limited free tier!**

Example cost for 1000 chat messages:
- Average 200 tokens input + 150 tokens output per message
- Cost: ~$0.06 for 1000 messages

## Troubleshooting

### Error: "Permission denied"
**Solution:** Ensure service account has "Vertex AI User" role

### Error: "API not enabled"
**Solution:** Enable Vertex AI API in your project

### Error: "Quota exceeded"
**Solution:** Request quota increase in Google Cloud Console

### Error: "Invalid credentials"
**Solution:** Check that GOOGLE_APPLICATION_CREDENTIALS path is correct

## Regions

Available regions for Vertex AI:
- `us-central1` (Iowa) - Recommended
- `us-east4` (Virginia)
- `europe-west4` (Netherlands)
- `asia-southeast1` (Singapore)

Choose the region closest to your users for lower latency.

## Security Notes

⚠️ **Important:**
- Never commit `service-account-key.json` to git
- Add it to `.gitignore`
- Rotate keys regularly
- Use least privilege (only Vertex AI User role)

## Migration from AI Studio

The code has been updated to use Vertex AI. Changes made:
1. ✅ Replaced `google-generativeai` with `google-cloud-aiplatform`
2. ✅ Updated `interpreter.py` to use Vertex AI SDK
3. ✅ Updated environment variables
4. ✅ Updated requirements.txt

No changes needed in frontend - API remains the same!

## Benefits

**Before (AI Studio):**
- ❌ 50 requests per day (free tier)
- ❌ Rate limits hit quickly
- ❌ Not suitable for production

**After (Vertex AI):**
- ✅ 60 requests per minute
- ✅ 1000+ requests per day
- ✅ Production-ready
- ✅ Scalable

---

**Ready to go!** Once configured, your chat will work without rate limits! 🎉
