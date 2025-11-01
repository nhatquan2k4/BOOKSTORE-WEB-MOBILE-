import { NextRequest, NextResponse } from 'next/server';

// Thông tin tài khoản ngân hàng nhận tiền
const BANK_CONFIG = {
  accountNumber: '2230333906939',
  accountName: 'HOANG THO TU',
  bankCode: '970422', // MB Bank
  template: 'compact',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, orderId, type, bookId, planId, description } = body;

    // Validate required fields
    if (!amount || !orderId) {
      return NextResponse.json(
        { success: false, message: 'Thiếu thông tin thanh toán' },
        { status: 400 }
      );
    }

    // Validate amount
    const amountInt = Number.parseInt(amount);
    if (Number.isNaN(amountInt) || amountInt <= 0) {
      return NextResponse.json(
        { success: false, message: 'Số tiền không hợp lệ' },
        { status: 400 }
      );
    }

    // Generate transfer content
    const transferContent = description || (type === 'rent' 
      ? `THUE ${bookId} ${planId}` 
      : `MUA ${orderId}`);

    // Create VietQR URL (free, no API key needed)
    const vietQRUrl = `https://img.vietqr.io/image/${BANK_CONFIG.bankCode}-${BANK_CONFIG.accountNumber}-${BANK_CONFIG.template}.jpg?amount=${amountInt}&addInfo=${encodeURIComponent(transferContent)}&accountName=${encodeURIComponent(BANK_CONFIG.accountName)}`;
    
    // Return QR code data
    return NextResponse.json({
      success: true,
      qrCodeUrl: vietQRUrl,
      orderId: orderId,
      accountNumber: BANK_CONFIG.accountNumber,
      accountName: BANK_CONFIG.accountName,
      transferContent: transferContent,
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server khi tạo mã QR',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
