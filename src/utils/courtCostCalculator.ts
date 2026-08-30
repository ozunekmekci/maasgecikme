export interface CourtCostBreakdown {
  claimAmount: number;
  
  // Harçlar (492 Sayılı Harçlar Kanunu)
  applicationFee: number;       // Başvurma Harcı
  advanceProportionalFee: number; // Peşin Nisbi Karar ve İlam Harcı (1/4)
  fullProportionalFee: number;    // Toplam Nisbi Karar ve İlam Harcı (Binde 68,31)
  remainingJudgmentFee: number;   // Dava Sonunda Ödenecek Kalan Harç (3/4)
  proxyFee: number;              // Vekalet Harcı
  baroStamp: number;             // Baro Pulu
  totalInitialFees: number;      // Toplam Peşin Harçlar

  // Gider Avansı (HMK Gider Avansı Tarifesi)
  notificationCost: number;      // Tebligat Masrafı (2 Taraf)
  expertCost: number;            // Resmi Bilirkişi Ücreti
  postalAndMiscCost: number;     // Posta ve Diğer İşlem Masrafları
  totalAdvanceCost: number;      // Toplam Gider Avansı

  // Toplam Açılış Masrafı
  totalInitialLawsuitCost: number; // Peşin Harçlar + Gider Avansı

  // Avukatlık Ücreti (AAÜT - 1136 Sayılı Avukatlık Kanunu)
  statutoryAttorneyFee: number;    // Mahkemece Hükmedilecek Karşı Vekalet Ücreti

  // Kazanım Durumu İade & Tahsilat
  recoverableCosts: number;        // Davalıdan Tahsil Edilecek Toplam Masraf
  totalNetRecovery: number;        // Davacının Net Tahsil Edeceği Tutar (Alacak + Masraflar)
}

/**
 * 492 Sayılı Harçlar Kanunu, HMK ve AAÜT uyarınca dava harç ve masraflarını hesaplar
 */
export function calculateCourtCosts(claimAmount: number): CourtCostBreakdown {
  const safeClaim = Math.max(0, claimAmount || 0);

  // 1. Harçlar (2026 İş Mahkemesi Tarifesi)
  const applicationFee = 427.60; // Maktu Başvuru Harcı
  const proxyFee = 60.80;        // Vekalet Harcı
  const baroStamp = 96.00;       // Baro Pulu

  // Nisbi Karar ve İlam Harcı: Binde 68,31 (%6.831)
  const fullProportionalFee = safeClaim * (68.31 / 1000);
  // Peşin Harç: 1/4'ü
  const advanceProportionalFee = fullProportionalFee / 4;
  // Bakiye Kalan Harç: 3/4'ü (Hükümle birlikte davalıdan tahsil edilir)
  const remainingJudgmentFee = fullProportionalFee - advanceProportionalFee;

  const totalInitialFees = applicationFee + proxyFee + baroStamp + advanceProportionalFee;

  // 2. Gider Avansı (HMK)
  const notificationCost = 560.00;   // 2 taraf x 2 tebligat x 140 TL
  const expertCost = 2500.00;        // İş Hukuku Bilirkişi İnceleme Ücreti
  const postalAndMiscCost = 450.00;  // Dosya, müzekkere ve posta avansı
  const totalAdvanceCost = notificationCost + expertCost + postalAndMiscCost;

  // Toplam Dava Açılış Masrafı (Davacının cebinden peşin çıkacak tutar)
  const totalInitialLawsuitCost = totalInitialFees + totalAdvanceCost;

  // 3. AAÜT Nisbi Karşı Vekalet Ücreti (Kademeli Tarife)
  let attorneyFee = 0;
  let remainingAmount = safeClaim;

  // Dilim 1: İlk 400.000 TL için %16
  const b1 = Math.min(remainingAmount, 400000);
  attorneyFee += b1 * 0.16;
  remainingAmount = Math.max(0, remainingAmount - 400000);

  // Dilim 2: Sonraki 400.000 TL için (400.001 - 800.000) %15
  if (remainingAmount > 0) {
    const b2 = Math.min(remainingAmount, 400000);
    attorneyFee += b2 * 0.15;
    remainingAmount = Math.max(0, remainingAmount - 400000);
  }

  // Dilim 3: Sonraki 800.000 TL için (800.001 - 1.600.000) %14
  if (remainingAmount > 0) {
    const b3 = Math.min(remainingAmount, 800000);
    attorneyFee += b3 * 0.14;
    remainingAmount = Math.max(0, remainingAmount - 800000);
  }

  // Dilim 4: Sonraki 1.600.000 TL için (1.600.001 - 3.200.000) %11
  if (remainingAmount > 0) {
    const b4 = Math.min(remainingAmount, 1600000);
    attorneyFee += b4 * 0.11;
    remainingAmount = Math.max(0, remainingAmount - 1600000);
  }

  // Dilim 5: Sonraki tutar için %8
  if (remainingAmount > 0) {
    attorneyFee += remainingAmount * 0.08;
  }

  // Maktu asgari ücret kontrolü (Asliye / İş Mahkemesi alt sınırı: 30.000 TL)
  const statutoryAttorneyFee = Math.max(30000, attorneyFee);

  // 4. Dava Kabul Edildiğinde Karşı Taraftan Alınacak Masraflar
  const recoverableCosts = totalInitialLawsuitCost + statutoryAttorneyFee;
  const totalNetRecovery = safeClaim + recoverableCosts;

  return {
    claimAmount: Number(safeClaim.toFixed(2)),
    applicationFee: Number(applicationFee.toFixed(2)),
    advanceProportionalFee: Number(advanceProportionalFee.toFixed(2)),
    fullProportionalFee: Number(fullProportionalFee.toFixed(2)),
    remainingJudgmentFee: Number(remainingJudgmentFee.toFixed(2)),
    proxyFee: Number(proxyFee.toFixed(2)),
    baroStamp: Number(baroStamp.toFixed(2)),
    totalInitialFees: Number(totalInitialFees.toFixed(2)),
    notificationCost: Number(notificationCost.toFixed(2)),
    expertCost: Number(expertCost.toFixed(2)),
    postalAndMiscCost: Number(postalAndMiscCost.toFixed(2)),
    totalAdvanceCost: Number(totalAdvanceCost.toFixed(2)),
    totalInitialLawsuitCost: Number(totalInitialLawsuitCost.toFixed(2)),
    statutoryAttorneyFee: Number(statutoryAttorneyFee.toFixed(2)),
    recoverableCosts: Number(recoverableCosts.toFixed(2)),
    totalNetRecovery: Number(totalNetRecovery.toFixed(2))
  };
}
