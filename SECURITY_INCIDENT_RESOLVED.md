# 🔒 Security Incident - SMTP Credentials Exposed

## ⚠️ What Happened

GitGuardian detected that Brevo SMTP credentials were briefly exposed in commit `3989b90` (which was later amended to `6b1477f`).

**Status:** ✅ **RESOLVED** - Credentials removed from git history

## ✅ What Was Done

1. ✅ Removed exposed credentials from `BACKEND_RESTORED_CHECKLIST.md`
2. ✅ Amended commit to remove the secret
3. ✅ Force pushed clean commit
4. ✅ Verified secret is not in git history

## 🚨 IMPORTANT: You Must Revoke the Exposed Key

Even though the credentials are removed from git, they were briefly visible. You should:

### Step 1: Revoke Old SMTP Key

1. Login to Brevo: https://app.brevo.com/
2. Go to: **Settings** → **SMTP & API**
3. Click **SMTP** tab
4. Find the exposed key and click **Delete/Revoke**

### Step 2: Create New SMTP Key

1. Click **"Create a new SMTP key"**
2. Name it: "UniEd OTP - New"
3. Copy the new key
4. **Save it securely!**

### Step 3: Update Your .env File

Update `backend/.env` with the new key:

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_USER=9eb8f7001@smtp-brevo.com
EMAIL_PASSWORD=your-new-smtp-key-here
EMAIL_FROM=UniEd <dhimanaditya56@gmail.com>
```

### Step 4: Restart Backend

```bash
cd backend
npm start
```

### Step 5: Test

Register with a test email to verify the new key works.

## 🔐 Security Best Practices

### ✅ DO:
- Keep `.env` files in `.gitignore` (already done ✅)
- Use `.env.example` for documentation (already done ✅)
- Revoke exposed credentials immediately
- Use environment variables for secrets

### ❌ DON'T:
- Commit `.env` files
- Put real credentials in documentation files
- Share SMTP keys in code or docs
- Ignore security alerts

## 📋 Verification Checklist

- ✅ Secret removed from git history
- ✅ Clean commit pushed to GitHub
- ⏳ **TODO:** Revoke old SMTP key in Brevo
- ⏳ **TODO:** Generate new SMTP key
- ⏳ **TODO:** Update backend/.env with new key
- ⏳ **TODO:** Test email sending works

## 🎯 Current Status

**Git Repository:** ✅ Clean (no secrets)
**Brevo Account:** ⚠️ **Action Required** - Revoke old key and create new one

## 📞 Need Help?

If you have questions about:
- Revoking keys: Check Brevo documentation
- Security: Follow the best practices above
- Testing: Use the test scripts in `backend/test-otp.js`

---

**Remember:** Always revoke exposed credentials, even if they're removed from git!
