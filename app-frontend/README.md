# 🔐 Bookstore App - Frontend

Mobile app built with Expo Router, TypeScript, and React Native.

## ⚡ Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx expo start
```

Then press `i` for iOS, `a` for Android, or `w` for Web.

## 📁 Project Structure

```
app/
├── _layout.tsx              # Root layout with AuthProvider
├── (auth)/                  # Authentication screens
│   ├── login.tsx           # Login screen
│   └── register.tsx        # Register screen
└── (tabs)/                  # Main app (protected routes)
    ├── index.tsx           # Home screen
    └── explore.tsx         # Explore screen

src/
├── hooks/
│   └── useAuth.tsx         # Auth context & logic
├── components/
│   └── AuthForm.tsx        # Reusable form component
├── api/
│   └── auth.ts             # API functions (mock for now)
└── utils/
    └── storage.ts          # Token storage
```

## 🎯 Features

- ✅ **Authentication:** Login/Register with validation
- ✅ **Token Persistence:** Auto-login on app restart
- ✅ **Protected Routes:** Automatic redirect based on auth state
- ✅ **Error Handling:** User-friendly error messages
- ✅ **TypeScript:** Full type safety
- ✅ **File-based Routing:** Using Expo Router

## 🔧 Development

### Using Auth Hook

```tsx
import { useAuth } from '@/src/hooks/useAuth';

function MyComponent() {
  const { user, login, logout, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!user) return <LoginPrompt />;
  
  return <Content user={user} />;
}
```

### Connecting to Backend

Update `src/api/auth.ts` to replace mock API with real endpoints:

```typescript
export const apiLogin = async (credentials: LoginCredentials) => {
  const response = await fetch('YOUR_API_URL/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  
  if (!response.ok) throw new Error('Login failed');
  return response.json();
};
```

## 🧪 Testing

**Login:** `test@example.com` / `123456`  
**Error Test:** Use `error@test.com` (login) or `taken@test.com` (register)

## 🛠️ Scripts

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android
npm run ios            # Run on iOS
npm run lint           # Run ESLint
npx tsc --noEmit       # Type check
```

## 📦 Tech Stack

- Expo SDK 54
- Expo Router 6
- TypeScript
- React Context API
- AsyncStorage

## 🔐 Production Checklist

- [ ] Connect to real backend API
- [ ] Switch to Expo SecureStore for tokens
- [ ] Implement refresh token flow
- [ ] Add forgot password feature
- [ ] Add social login options

---

**Built with Expo Router + TypeScript** 🚀
