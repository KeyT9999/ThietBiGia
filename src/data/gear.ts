export interface GearArsenalCategory {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  items: {
    name: string;
    spec: string;
    tag: string;
  }[];
}

export const GEAR_ARSENAL: GearArsenalCategory[] = [
  {
    id: "cinema-bodies",
    code: "01 // CINEMA & HYBRID BODIES",
    title: "Hệ Thống Thân Máy Quay & Chụp",
    subtitle: "Đáp ứng từ TVC 4K/6K RAW, MV thiếu sáng đến chụp thương mại 100MP.",
    items: [
      { name: "Sony FX6 & FX3 Cinema Line", spec: "4K 120fps • 15+ Stops S-Log3 • Dual Base ISO", tag: "CINEMA" },
      { name: "RED Komodo 6K", spec: "Global Shutter • 6K REDCODE RAW • Cinelifter Ready", tag: "RAW 6K" },
      { name: "Fujifilm GFX100S", spec: "102MP Medium Format • 16-bit RAW Editorial", tag: "PHOTO" },
      { name: "Sony A1 & A7RV", spec: "50MP 30fps Burst • Stage & Commercial Master", tag: "HYBRID" },
    ],
  },
  {
    id: "optics",
    code: "02 // ANAMORPHIC & PRIME OPTICS",
    title: "Dàn Ống Kính Điện Ảnh & G-Master",
    subtitle: "Chất ảnh từ sắc nét hiện đại đến cổ điển giàu cảm xúc.",
    items: [
      { name: "Atlas Orion Anamorphic Set", spec: "40mm / 65mm / 100mm T2.0 • 2x Squeeze Flare", tag: "SCOPE" },
      { name: "Cooke SP3 Full-Frame Primes", spec: "25 / 32 / 50 / 75 / 100mm • Classic Cooke Look", tag: "PRIME" },
      { name: "Sony FE G-Master II Trinity", spec: "16-35 / 24-70 / 70-200mm f/2.8 GM II", tag: "ZOOM" },
      { name: "PC-E 24mm Tilt-Shift & Leica M", spec: "Kiến trúc chuẩn trục & Phim 35mm đường phố", tag: "SPECIAL" },
    ],
  },
  {
    id: "lighting-grip",
    code: "03 // LIGHTING, FPV & GRIP",
    title: "Ánh Sáng, Chuyển Động Máy & FPV",
    subtitle: "Làm chủ bối cảnh từ studio kín đến đại cảnh ngoài trời ban đêm.",
    items: [
      { name: "Aputure 1200d Pro & 600c Pro", spec: "CRMX Wireless • Khung tản 12x12 & Spotlight", tag: "LIGHT" },
      { name: "Astera Titan Tube (Bộ 8 ống)", spec: "Pixel-mappable RGBMintAmber cho MV & Set", tag: "TUBE" },
      { name: "Cinelifter 8-inch + DJI Inspire 3", spec: "Bay xuyên không gian hẹp & Đại cảnh 8K", tag: "AERIAL" },
      { name: "Tilta Hydra Alien & Dana Dolly", spec: "Car-Mount tốc độ cao & Đường ray êm tuyệt đối", tag: "GRIP" },
    ],
  },
  {
    id: "post-suite",
    code: "04 // POST-PRODUCTION & 3D",
    title: "Phòng Dựng Màu, Âm Thanh & 3D VFX",
    subtitle: "Quy trình khép kín từ Ingest hiện trường đến bản Master cuối cùng.",
    items: [
      { name: "DaVinci Resolve Studio + Panel", spec: "ACEScct Color Pipeline • Màn chuẩn màu EIZO", tag: "COLOR" },
      { name: "Cinema 4D, Houdini & Redshift", spec: "3D Motion, Key Visual & Stage LED Visuals", tag: "3D VFX" },
      { name: "Trạm Same-Day Edit Lưu Động", spec: "MacBook Pro M3 Max • NAS RAID 10GbE tại sự kiện", tag: "SDE" },
      { name: "Pro Tools & Sennheiser MKH 416", spec: "Thu âm hiện trường, Sound Design & Mastering", tag: "AUDIO" },
    ],
  },
];
