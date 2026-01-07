// ==========================================
// RFM Talking Points Helper
// ==========================================
// Segment-specific talking points for RM conversations

import type { RFMSegment } from './rfm';

// Get talking points for RM based on segment
export function getTalkingPoints(segment: RFMSegment): string[] {
  const points: Record<RFMSegment, string[]> = {
    CHAMPION: [
      'Terima kasih atas kepercayaan Bapak/Ibu selama ini',
      'Sebagai nasabah premium, kami ingin menawarkan benefit eksklusif',
      'Ada produk baru yang mungkin sesuai dengan profil Bapak/Ibu'
    ],
    LOYAL: [
      'Kami sangat menghargai loyalitas Bapak/Ibu',
      'Apakah ada kebutuhan finansial lain yang bisa kami bantu?',
      'Kami punya penawaran khusus untuk nasabah setia seperti Bapak/Ibu'
    ],
    POTENTIAL: [
      'Terima kasih sudah menjadi nasabah Bank Sumut',
      'Apakah Bapak/Ibu sudah mencoba fitur mobile banking kami?',
      'Ada banyak kemudahan yang bisa Bapak/Ibu manfaatkan'
    ],
    AT_RISK: [
      'Kami perhatikan aktivitas Bapak/Ibu menurun, apakah ada yang bisa kami bantu?',
      'Apakah ada kendala dengan layanan kami?',
      'Kami ingin memastikan Bapak/Ibu mendapat layanan terbaik'
    ],
    HIBERNATING: [
      'Lama tidak bertransaksi, apakah ada yang bisa kami bantu?',
      'Ada banyak fitur baru yang mungkin Bapak/Ibu belum ketahui',
      'Kami punya penawaran khusus untuk nasabah yang kembali aktif'
    ],
    LOST: [
      'Apakah masih berkenan menjadi nasabah Bank Sumut?',
      'Ada kendala yang membuat Bapak/Ibu tidak aktif?'
    ]
  };

  return points[segment] || [];
}
