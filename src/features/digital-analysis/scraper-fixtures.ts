export interface ScrapedIntelligenceItem {
  id: string;
  platform: "X" | "Telegram" | "NewsMedia" | "TikTok";
  accountHandle: string;
  accountName: string;
  authorBadge?: string;
  title: string;
  content: string;
  url: string;
  occurredAt: string;
  metrics: {
    views?: number;
    shares?: number;
    likes?: number;
    replies?: number;
  };
  threatCategory: "edaran" | "tautan" | "konteks_video" | "propaganda";
  broadRegion: "Barat" | "Tengah" | "Timur" | null;
  flagReason: string;
  sentiment: "negatif_tinggi" | "provokatif" | "meragukan" | "amplifikasi";
  keywords: string[];
  caseAssociation?: string;
}

export const SCRAPED_INTELLIGENCE_FEED: ScrapedIntelligenceItem[] = [
  {
    id: "SCRAPE-X-01",
    caseAssociation: "KAS-101",
    platform: "X",
    accountHandle: "@akun_contoh_a",
    accountName: "Warga Tanggap Siber",
    authorBadge: "Anonim / Unverified",
    title: "Cuitan Viral Jadwal Latihan Ditunda 10.30 WIB",
    content:
      "Perhatian semuanya! Latihan tempur gabungan Kodiklat TNI di Puslatpur hari ini diundur menjadi 10.30 WIB karena ada arahan mendadak. Cek info valid!",
    url: "https://x.example/akun_contoh_a/status/189201928",
    occurredAt: "2026-11-17T07:50:00+07:00",
    metrics: { views: 142300, shares: 1420, likes: 8940, replies: 148 },
    threatCategory: "edaran",
    broadRegion: "Tengah",
    flagReason:
      "Menyebarkan perubahan jadwal fiktif yang bertentangan dengan Surat Edaran Kodiklat",
    sentiment: "provokatif",
    keywords: ["jadwal", "latihan", "kodiklat", "ditunda", "puslatpur"],
  },
  {
    id: "SCRAPE-X-02",
    caseAssociation: "KAS-101",
    platform: "X",
    accountHandle: "@akun_contoh_b",
    accountName: "Info Jateng Cepat",
    authorBadge: "Botnet Cluster #4",
    title: "Retweet Amplifikasi Otomatis oleh Jaringan Bot",
    content:
      "RT @akun_contoh_a: Perhatian semuanya! Latihan tempur gabungan Kodiklat TNI diundur jadi 10.30 WIB. Jangan sampai salah jadwal lur #KodiklatTNI #InfoMiliter",
    url: "https://x.example/akun_contoh_b/status/189202301",
    occurredAt: "2026-11-17T08:05:00+07:00",
    metrics: { views: 34100, shares: 620, likes: 1200, replies: 42 },
    threatCategory: "edaran",
    broadRegion: "Barat",
    flagReason: "Terdeteksi pola amplifikasi otomatis dengan interval posting < 2 detik",
    sentiment: "amplifikasi",
    keywords: ["retweet", "amplifikasi", "botnet", "kodiklat", "jadwal"],
  },
  {
    id: "SCRAPE-TG-01",
    caseAssociation: "KAS-101",
    platform: "Telegram",
    accountHandle: "t.me/WartaMasyarakatTNI",
    accountName: "Kanal Komunitas Militer Independen",
    authorBadge: "Channel Publik (48K Subs)",
    title: "Broadcast Forward PDF Edaran Jadwal Palsu",
    content:
      "FORWARD DARI SUMBER INTERNAL: Beredar edaran darurat penyesuaian jam kick-off gladi lapangan Kodiklat menjadi pukul 10.30 WIB. Peserta diminta menunggu di holding area Krapyak.",
    url: "https://t.me/WartaMasyarakatTNI/4412",
    occurredAt: "2026-11-17T08:12:00+07:00",
    metrics: { views: 28400, shares: 890 },
    threatCategory: "edaran",
    broadRegion: "Tengah",
    flagReason: "Mencatut nama institusi Kodiklat tanpa stempel naskah dinas resmi",
    sentiment: "negatif_tinggi",
    keywords: ["telegram", "broadcast", "forward", "krapyak", "holding area"],
  },
  {
    id: "SCRAPE-NEWS-01",
    caseAssociation: "KAS-101",
    platform: "NewsMedia",
    accountHandle: "radar-terkini.example",
    accountName: "Radar Terkini Siber",
    authorBadge: "Media Agregator",
    title: "Portal Berita: Beredar Kabar Penundaan Latihan Kodiklat TNI di Medsos",
    content:
      "SEMARANG — Lini masa media sosial X diramaikan oleh narasi dugaan pergeseran waktu pelaksanaan latihan Kodiklat TNI dari pukul 08.00 WIB menjadi 10.30 WIB. Hingga kini pihak berwenang belum memberikan rilis resmi.",
    url: "https://radar-terkini.example/berita/militer/jadwal-kodiklat-ramai",
    occurredAt: "2026-11-17T08:22:00+07:00",
    metrics: { views: 56000, shares: 310 },
    threatCategory: "edaran",
    broadRegion: "Tengah",
    flagReason: "Pemberitaan agregasi tanpa konfirmasi langsung ke Penerangan Kodiklat",
    sentiment: "meragukan",
    keywords: ["radar", "berita", "portal", "semarang", "penundaan"],
  },
  {
    id: "SCRAPE-X-03",
    caseAssociation: "KAS-102",
    platform: "X",
    accountHandle: "@link_rekrutmen_palsu",
    accountName: "Pendaftaran Bintara & Tamtama 2026",
    authorBadge: "Suspicious Account",
    title: "Tautan Formulir Phishing Pendaftaran Kursus Militer",
    content:
      "Dibuka pendaftaran gelombang khusus calon siswa Kodiklat TNI jalur mandiri! Isi biodata NIK & nomor rekening pendaftaran di: https://daftar-kodiklat.tiruan.example/form (Kuota terbatas!)",
    url: "https://x.example/link_rekrutmen_palsu/status/189204550",
    occurredAt: "2026-11-17T08:20:00+07:00",
    metrics: { views: 88500, shares: 2100, likes: 4500, replies: 310 },
    threatCategory: "tautan",
    broadRegion: "Timur",
    flagReason: "Domain tiruan bukan mil.id, mengumpulkan data kependudukan NIK dan rekening",
    sentiment: "negatif_tinggi",
    keywords: ["rekrutmen", "pendaftaran", "phishing", "tautan palsu", "biodata"],
  },
  {
    id: "SCRAPE-NEWS-02",
    caseAssociation: "KAS-102",
    platform: "NewsMedia",
    accountHandle: "tribun-siber.example",
    accountName: "Tribun Siber Jawa",
    authorBadge: "Media Siber Daerah",
    title: "Berita Hoaks Rekrutmen Catut Nomenklatur Lembaga Pendidikan TNI",
    content:
      "Mabes TNI mengimbau warga agar mewaspadai peredaran link pendaftaran seleksi yang mengatasnamakan Kodiklat TNI di media sosial karena tidak terafiliasi dengan rekrutmen-tni.mil.id.",
    url: "https://tribun-siber.example/nasional/waspada-link-kodiklat-hoaks",
    occurredAt: "2026-11-17T08:40:00+07:00",
    metrics: { views: 41000, shares: 720 },
    threatCategory: "tautan",
    broadRegion: "Barat",
    flagReason: "Artikel klarifikasi awal oleh media independen",
    sentiment: "meragukan",
    keywords: ["rekrutmen", "klarifikasi", "waspada", "tribun"],
  },
  {
    id: "SCRAPE-TIKTOK-01",
    caseAssociation: "KAS-103",
    platform: "TikTok",
    accountHandle: "@lensa_lapangan_09",
    accountName: "Lensa Militer Rakyat",
    authorBadge: "Creator Publik",
    title: "Video Potongan Suasana Latihan Tanpa Konteks Narasi",
    content:
      "Video 15 detik memperlihatkan iring-iringan kendaraan taktis berhenti di tepi jalan arteri Jawa Tengah, dinarasikan secara keliru sebagai 'latihan batal digelar karena kekurangan amunisi'.",
    url: "https://tiktok.example/@lensa_lapangan_09/video/7391029410",
    occurredAt: "2026-11-17T08:15:00+07:00",
    metrics: { views: 245000, shares: 5400, likes: 18900, replies: 920 },
    threatCategory: "konteks_video",
    broadRegion: "Tengah",
    flagReason: "Disinformasi konteks visual (misleading video narration)",
    sentiment: "negatif_tinggi",
    keywords: ["tiktok", "video", "konteks", "iring-iringan", "batal"],
  },
  {
    id: "SCRAPE-X-04",
    caseAssociation: "KAS-103",
    platform: "X",
    accountHandle: "@provokasi_warga_01",
    accountName: "Suara Rakyat Merdeka",
    authorBadge: "Botnet Cluster #4",
    title: "Narasi Hoaks Perusakan Fasilitas Warga Saat Latihan",
    content:
      "Latihan militer Kodiklat di daerah permukiman dikabarkan merusak kebun warga sekitar Puslatpur tanpa ada ganti rugi! Viralkan supaya didengar komandan!",
    url: "https://x.example/provokasi_warga_01/status/189205112",
    occurredAt: "2026-11-17T08:35:00+07:00",
    metrics: { views: 19200, shares: 410, likes: 890, replies: 55 },
    threatCategory: "propaganda",
    broadRegion: "Tengah",
    flagReason: "Tuduhan provokasi tidak berdasar tanpa bukti lokasi spesifik",
    sentiment: "provokatif",
    keywords: ["propaganda", "perusakan", "hoaks", "puslatpur", "ganti rugi"],
  },
];

export function getScrapedItemsForCase(
  caseId: string,
  category?: string,
  showAllGlobal: boolean = false
): ScrapedIntelligenceItem[] {
  if (showAllGlobal) {
    return SCRAPED_INTELLIGENCE_FEED;
  }
  return SCRAPED_INTELLIGENCE_FEED.filter((item) => {
    if (item.caseAssociation === caseId) return true;
    if (category && item.threatCategory === category) return true;
    return false;
  });
}
