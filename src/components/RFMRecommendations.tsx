// ==========================================
// RFM Recommendations Component
// ==========================================
// Segment-specific actionable recommendations

import { useMemo } from 'react';
import type { RFMSegment } from '../lib/rfm';

interface Recommendation {
  action: string;
  rationale: string;
  products?: string[];
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

// Segment-specific recommendations
const SEGMENT_RECOMMENDATIONS: Record<RFMSegment, Recommendation[]> = {
  CHAMPION: [
    {
      action: 'Berikan Exclusive Rewards',
      rationale: 'Nasabah terbaik perlu dipertahankan dengan benefit khusus',
      products: ['Lounge Akses', 'Priority Service', 'Cashback Eksklusif'],
      priority: 'HIGH'
    },
    {
      action: 'Tawarkan Referral Program',
      rationale: 'Champion dapat menjadi ambassador untuk akuisisi nasabah baru',
      priority: 'MEDIUM'
    },
    {
      action: 'Early Access Produk Baru',
      rationale: 'Beri privilege untuk mencoba fitur/produk sebelum launch umum',
      products: ['Deposito Premium', 'Kartu Kredit Platinum'],
      priority: 'MEDIUM'
    }
  ],
  LOYAL: [
    {
      action: 'Cross-sell Produk Komplementer',
      rationale: 'Tingkatkan share of wallet dengan produk yang relevan',
      products: ['Asuransi', 'Investasi Reksadana', 'KPR'],
      priority: 'HIGH'
    },
    {
      action: 'Upsell ke Tier Lebih Tinggi',
      rationale: 'Dorong untuk naik ke segment Priority/Private',
      products: ['Tabungan Martabe Plus', 'Kartu Kredit Gold'],
      priority: 'MEDIUM'
    }
  ],
  POTENTIAL: [
    {
      action: 'Edukasi Fitur Digital Banking',
      rationale: 'Tingkatkan frequency dengan memperkenalkan fitur mobile/internet banking',
      priority: 'HIGH'
    },
    {
      action: 'Promo Transaksi Pertama',
      rationale: 'Dorong aktivitas lebih sering dengan insentif transaksi',
      products: ['Cashback Transfer', 'Poin Reward'],
      priority: 'HIGH'
    },
    {
      action: 'Personal Check-in Call',
      rationale: 'Bangun relationship di awal untuk meningkatkan engagement',
      priority: 'MEDIUM'
    }
  ],
  AT_RISK: [
    {
      action: 'Segera Hubungi (Win-back Call)',
      rationale: 'Nasabah bernilai tinggi yang mulai tidak aktif perlu perhatian segera',
      priority: 'HIGH'
    },
    {
      action: 'Tawarkan Special Retention Offer',
      rationale: 'Berikan insentif khusus untuk kembali aktif',
      products: ['Bonus Bunga Deposito', 'Fee Waiver'],
      priority: 'HIGH'
    },
    {
      action: 'Survey Kepuasan',
      rationale: 'Identifikasi masalah yang menyebabkan penurunan aktivitas',
      priority: 'MEDIUM'
    }
  ],
  HIBERNATING: [
    {
      action: 'Re-engagement Campaign',
      rationale: 'Kirim komunikasi untuk mengingatkan benefit yang tersedia',
      priority: 'MEDIUM'
    },
    {
      action: 'Promo Reaktivasi',
      rationale: 'Tawarkan insentif untuk transaksi pertama setelah dormant',
      products: ['Bonus Deposit', 'Cashback Aktivasi'],
      priority: 'MEDIUM'
    }
  ],
  LOST: [
    {
      action: 'Low-cost Reactivation',
      rationale: 'Gunakan channel murah (email/SMS) untuk mencoba reach-out',
      priority: 'LOW'
    },
    {
      action: 'Passive Monitoring',
      rationale: 'Monitor jika ada aktivitas, siap follow-up',
      priority: 'LOW'
    }
  ]
};

interface RFMRecommendationsProps {
  segment: RFMSegment;
}

export function RFMRecommendations({ segment }: RFMRecommendationsProps) {
  const recommendations = useMemo(() => 
    SEGMENT_RECOMMENDATIONS[segment] || [], 
    [segment]
  );

  const priorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'HIGH': return 'var(--color-error)';
      case 'MEDIUM': return 'var(--color-warning)';
      case 'LOW': return 'var(--color-text-muted)';
    }
  };

  return (
    <div className="rfm-recommendations">
      <h3 className="rfm-recommendations-title">
        💡 Aksi yang Disarankan
      </h3>
      <ul className="rfm-recommendations-list">
        {recommendations.map((rec, i) => (
          <li key={i} className="rfm-recommendation-item">
            <div className="rfm-recommendation-header">
              <span 
                className="rfm-recommendation-priority"
                style={{ backgroundColor: priorityColor(rec.priority) }}
              >
                {rec.priority}
              </span>
              <span className="rfm-recommendation-action">{rec.action}</span>
            </div>
            <p className="rfm-recommendation-rationale">{rec.rationale}</p>
            {rec.products && (
              <div className="rfm-recommendation-products">
                {rec.products.map(p => (
                  <span key={p} className="rfm-product-chip">{p}</span>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
