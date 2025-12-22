import { api } from './apiClient';

const parseAmount = (raw: any): number | null => {
  if (raw == null) return null;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    let s = raw.trim();
    if (s.indexOf('.') !== -1 && s.indexOf(',') !== -1) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else if (s.indexOf(',') !== -1 && s.indexOf('.') === -1) {
      s = s.replace(',', '.');
    } else {
      s = s.replace(/[^0-9.-]+/g, '');
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const priceService = {
  async getPriceByBookId(bookId: string) {
    try {
      // api.get already unwraps response.data, so raw is the actual response
      const raw = await api.get(`/api/Prices/book/${bookId}`) as any;
      
      console.log('💰 [Price API] Response for book', bookId, ':', raw);
      
      if (!raw) return null;
      
      // PriceDto has: { id, bookId, bookTitle, bookISBN, amount, currency, isCurrent, ... }
      const amount = parseAmount(raw.amount ?? raw.Amount ?? raw.price ?? raw.Price);
      const currency = raw.currency ?? raw.Currency ?? 'VND';
      
      console.log('💵 [Price API] Parsed:', { amount, currency });
      
      if (amount == null) return null;
      return { price: amount, currency };
    } catch (err) {
      console.warn('❌ [Price API] Failed for book', bookId, ':', err);
      return null;
    }
  },
};

export default priceService;
