# Backend API Testing - Price Fields

## Issue
Frontend error: "Invalid book price data: {}"

## Root Cause
Backend `BookDetailDto` is returning empty price fields OR backend wasn't rebuilt after C# changes.

## Test Steps

### 1. Verify Backend Changes Were Applied

Check if these files have the price fields:

**Backend Files to Verify:**
- ✅ `BE/Core/BookStore.Application/Dtos/Catalog/Book/BookDetailDto.cs`
  - Should have: `CurrentPrice`, `DiscountPrice`, `StockQuantity`, `AverageRating`, `TotalReviews`
  
- ✅ `BE/Core/BookStore.Application/Mappers/Catalog/Book/BookMapper.cs`
  - `ToDetailDto()` method should populate price fields from `book.Prices`

### 2. Rebuild Backend

```bash
cd BE
dotnet clean
dotnet build
dotnet run --project Core/BookStore.API
```

### 3. Test API Endpoint

**Open browser or Postman:**
```
GET http://localhost:5000/api/book/{bookId}
```

**Expected Response Structure:**
```json
{
  "id": "guid",
  "title": "Book Title",
  "isbn": "123456789",
  "currentPrice": 100000,        ⬅️ MUST BE PRESENT
  "discountPrice": 80000,        ⬅️ MUST BE PRESENT (or null)
  "stockQuantity": 50,           ⬅️ MUST BE PRESENT
  "averageRating": 4.5,          ⬅️ MUST BE PRESENT (or null)
  "totalReviews": 100,           ⬅️ MUST BE PRESENT
  "publisher": { ... },
  "authors": [ ... ],
  "categories": [ ... ],
  "images": [ ... ],
  "files": [ ... ],
  "metadata": [ ... ]
}
```

### 4. Check Database

Verify that books have prices in the database:

```sql
-- Check if book has prices
SELECT b.Title, p.Amount, p.IsCurrent, p.EffectiveFrom, p.EffectiveTo, p.DiscountId
FROM Books b
LEFT JOIN BookPrices p ON b.Id = p.BookId
WHERE b.Id = 'your-book-guid'
ORDER BY p.EffectiveFrom DESC;

-- If no prices exist, add test data:
INSERT INTO BookPrices (Id, BookId, Amount, IsCurrent, EffectiveFrom, CreatedAt)
VALUES (NEWID(), 'your-book-guid', 150000, 1, GETUTCDATE(), GETUTCDATE());
```

### 5. Frontend Console Logs

After rebuilding backend, check browser console when visiting book detail page:

```javascript
// You should see:
Raw book data from API: {
  id: "...",
  title: "...",
  currentPrice: 150000,     ⬅️ Should have value
  discountPrice: 120000,    ⬅️ Should have value or undefined
  stockQuantity: 50,        ⬅️ Should have value
  averageRating: 4.5,       ⬅️ Should have value or undefined
  totalReviews: 100         ⬅️ Should have value
}

// If you see this, backend is NOT returning price fields:
Raw book data from API: {
  id: "...",
  title: "...",
  currentPrice: undefined,  ⬅️ PROBLEM!
  discountPrice: undefined,
  stockQuantity: undefined,
  ...
}
```

## Solution Checklist

- [ ] Verify C# files have price fields
- [ ] Run `dotnet clean` and `dotnet build`
- [ ] Restart backend API
- [ ] Test API endpoint with Postman/browser
- [ ] Verify database has BookPrices data
- [ ] Check frontend console logs
- [ ] No more "Invalid book price data" errors

## If Still Not Working

**Check C# Serialization:**

The backend might be using PascalCase (C# convention) but frontend expects camelCase (JavaScript convention).

**Verify API response casing:**
- Backend returns: `CurrentPrice` (PascalCase)
- Frontend expects: `currentPrice` (camelCase)

**Solution:** ASP.NET Core should auto-convert via `JsonSerializerOptions` in `Program.cs`:

```csharp
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });
```

This should already be configured in your `Program.cs`.
