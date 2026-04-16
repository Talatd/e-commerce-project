// Review data for SmartStore AI
// Each review is linked to a product by productId
// This data simulates a real review database

export const reviews = [
  // ===== Product 1: Wireless Noise-Cancelling Headphones (ownerId: 1) =====
  {
    id: 1,
    productId: 1,
    userId: "user_a1",
    userName: "Ayşe K.",
    rating: 5,
    title: "Best headphones I've ever owned!",
    comment: "The noise cancellation is incredible. I use them daily for work calls and music. Battery lasts forever and the sound quality is top-notch. Highly recommended!",
    date: "2024-03-15",
    verified: true,
    helpful: 42
  },
  {
    id: 2,
    productId: 1,
    userId: "user_b2",
    userName: "Mehmet D.",
    rating: 4,
    title: "Great sound, slightly tight fit",
    comment: "Sound quality is amazing and ANC works very well. Only complaint is they feel a bit tight after 3+ hours of continuous use. Otherwise perfect.",
    date: "2024-03-10",
    verified: true,
    helpful: 28
  },
  {
    id: 3,
    productId: 1,
    userId: "user_c3",
    userName: "Sarah L.",
    rating: 5,
    title: "Worth every penny",
    comment: "I compared these with many other brands before buying. The build quality and audio experience are premium. The multi-device pairing feature is a game changer.",
    date: "2024-02-28",
    verified: true,
    helpful: 35
  },
  {
    id: 4,
    productId: 1,
    userId: "user_d4",
    userName: "Can Y.",
    rating: 4,
    title: "Excellent for travel",
    comment: "Used these on a 12-hour flight and they were fantastic. ANC blocked out all engine noise. Touch controls are intuitive. Quick charge feature is very handy.",
    date: "2024-02-20",
    verified: true,
    helpful: 19
  },
  {
    id: 5,
    productId: 1,
    userId: "user_e5",
    userName: "Emma W.",
    rating: 5,
    title: "Professional quality audio",
    comment: "As a music producer, I can say these headphones deliver exceptional clarity across all frequencies. The Hi-Res Audio certification is well-deserved.",
    date: "2024-01-30",
    verified: true,
    helpful: 51
  },

  // ===== Product 2: Ultra-Slim Laptop 15 Pro (ownerId: 1) =====
  {
    id: 6,
    productId: 2,
    userId: "user_f6",
    userName: "Ali R.",
    rating: 5,
    title: "Perfect for software development",
    comment: "This laptop handles everything I throw at it - Docker, VS Code with multiple projects, Chrome with 50 tabs. The 4K OLED display is stunning for coding.",
    date: "2024-03-12",
    verified: true,
    helpful: 67
  },
  {
    id: 7,
    productId: 2,
    userId: "user_g7",
    userName: "Zeynep B.",
    rating: 5,
    title: "Lightweight powerhouse",
    comment: "I carry this to university every day. At 1.6kg, it's incredibly portable yet powerful enough for my engineering software. Battery easily lasts through the day.",
    date: "2024-03-05",
    verified: true,
    helpful: 44
  },
  {
    id: 8,
    productId: 2,
    userId: "user_h8",
    userName: "David M.",
    rating: 4,
    title: "Great laptop, wish it had more RAM",
    comment: "Performance is excellent and the display is gorgeous. The 16GB RAM is sufficient for most tasks but I wish there was a 32GB option for heavy multitasking.",
    date: "2024-02-25",
    verified: true,
    helpful: 32
  },
  {
    id: 9,
    productId: 2,
    userId: "user_i9",
    userName: "Fatma S.",
    rating: 4,
    title: "Beautiful display, solid build",
    comment: "The OLED display makes colors pop like no other laptop I've used. Build quality feels premium. Thunderbolt 4 ports are very convenient.",
    date: "2024-02-15",
    verified: true,
    helpful: 22
  },

  // ===== Product 3: Smart Fitness Watch X3 (ownerId: 1) =====
  {
    id: 10,
    productId: 3,
    userId: "user_j10",
    userName: "Burak Ö.",
    rating: 5,
    title: "Transformed my fitness routine",
    comment: "The accuracy of the heart rate monitor and SpO2 sensor is impressive. Sleep tracking helped me improve my sleep habits. The 7-day battery is not a lie!",
    date: "2024-03-18",
    verified: true,
    helpful: 89
  },
  {
    id: 11,
    productId: 3,
    userId: "user_k11",
    userName: "Laura P.",
    rating: 4,
    title: "Great fitness companion",
    comment: "Love the variety of workout modes. GPS tracking is accurate during outdoor runs. The only thing I'd improve is the notification management from the watch.",
    date: "2024-03-01",
    verified: true,
    helpful: 36
  },
  {
    id: 12,
    productId: 3,
    userId: "user_l12",
    userName: "Emre K.",
    rating: 5,
    title: "Best value smartwatch",
    comment: "For the price, you get an incredible amount of features. Water resistance is legit - I swim with it regularly. The AMOLED display is crisp and bright.",
    date: "2024-02-22",
    verified: true,
    helpful: 55
  },
  {
    id: 13,
    productId: 3,
    userId: "user_m13",
    userName: "Selin T.",
    rating: 4,
    title: "Perfect for daily use",
    comment: "Comfortable to wear all day and night. The step counter and calorie tracking are reliable. I especially love the customizable watch faces.",
    date: "2024-02-10",
    verified: true,
    helpful: 27
  },
  {
    id: 14,
    productId: 3,
    userId: "user_n14",
    userName: "Mark J.",
    rating: 5,
    title: "Exceeded my expectations",
    comment: "Coming from a basic fitness band, this is a massive upgrade. The health insights are detailed and the app integration is seamless. Highly recommend for fitness enthusiasts!",
    date: "2024-01-28",
    verified: true,
    helpful: 41
  },
  {
    id: 15,
    productId: 3,
    userId: "user_o15",
    userName: "Deniz A.",
    rating: 3,
    title: "Good but could be better",
    comment: "The watch itself is solid but the companion app needs work. Some features are buried in menus. Heart rate occasionally shows inconsistent readings during HIIT.",
    date: "2024-01-20",
    verified: true,
    helpful: 18
  },

  // ===== Product 4: 4K Ultra HD Action Camera (ownerId: 1) =====
  {
    id: 16,
    productId: 4,
    userId: "user_p16",
    userName: "Oğuz H.",
    rating: 5,
    title: "Perfect for my YouTube channel",
    comment: "The 4K footage at 60fps is buttery smooth. HyperSmooth stabilization makes handheld shots look like they were filmed on a gimbal. Audio quality is also surprisingly good.",
    date: "2024-03-20",
    verified: true,
    helpful: 73
  },
  {
    id: 17,
    productId: 4,
    userId: "user_q17",
    userName: "Anna F.",
    rating: 4,
    title: "Great adventure companion",
    comment: "Took this scuba diving and the underwater footage was incredible. Battery life could be longer though - I carry 3 batteries for a full day of shooting.",
    date: "2024-03-08",
    verified: true,
    helpful: 45
  },
  {
    id: 18,
    productId: 4,
    userId: "user_r18",
    userName: "Kerem V.",
    rating: 5,
    title: "Slow motion is insane",
    comment: "240fps at 1080p creates the most epic slow-motion shots. I use this for skateboarding videos and the quality is unmatched. Voice control feature is very practical.",
    date: "2024-02-28",
    verified: true,
    helpful: 38
  },

  // ===== Product 5: Ergonomic Mechanical Keyboard (ownerId: 1) =====
  {
    id: 19,
    productId: 5,
    userId: "user_s19",
    userName: "Hakan M.",
    rating: 5,
    title: "My wrist pain is gone!",
    comment: "After switching to this ergonomic keyboard, my chronic wrist pain disappeared within a week. The Cherry MX Brown switches have the perfect tactile feel. RGB is gorgeous.",
    date: "2024-03-22",
    verified: true,
    helpful: 112
  },
  {
    id: 20,
    productId: 5,
    userId: "user_t20",
    userName: "Jessica R.",
    rating: 5,
    title: "Best keyboard for programmers",
    comment: "I code 10+ hours daily and this keyboard is a dream. The split design, programmable keys, and build quality are exceptional. The aluminum frame feels premium.",
    date: "2024-03-15",
    verified: true,
    helpful: 87
  },
  {
    id: 21,
    productId: 5,
    userId: "user_u21",
    userName: "Murat C.",
    rating: 5,
    title: "Incredible build quality",
    comment: "Heavy, solid, and beautifully crafted. The detachable wrist rest is comfortable. Key travel is smooth and consistent. This is endgame keyboard territory.",
    date: "2024-03-02",
    verified: true,
    helpful: 64
  },
  {
    id: 22,
    productId: 5,
    userId: "user_v22",
    userName: "Lisa T.",
    rating: 4,
    title: "Amazing but takes getting used to",
    comment: "The split ergonomic layout is unfamiliar at first. After a week, my typing speed actually improved. Sound is satisfying without being too loud for office use.",
    date: "2024-02-20",
    verified: true,
    helpful: 39
  },
  {
    id: 23,
    productId: 5,
    userId: "user_w23",
    userName: "Barış N.",
    rating: 5,
    title: "RGB heaven + perfect typing",
    comment: "The per-key RGB customization is incredible. I created a custom color profile that highlights different key zones. Perfect for both gaming and typing.",
    date: "2024-02-08",
    verified: true,
    helpful: 52
  },
  {
    id: 24,
    productId: 5,
    userId: "user_x24",
    userName: "Sophie K.",
    rating: 4,
    title: "Professional keyboard",
    comment: "Using this at my office and it's been great for productivity. The N-key rollover is perfect for fast typing. Only minor issue is the USB-C cable could be longer.",
    date: "2024-01-25",
    verified: true,
    helpful: 21
  },
  {
    id: 25,
    productId: 5,
    userId: "user_y25",
    userName: "Ege D.",
    rating: 5,
    title: "Endgame keyboard for real",
    comment: "I've tried dozens of mechanical keyboards and this is hands down the best. The ergonomic design, premium switches, and aluminum construction are unmatched at this price.",
    date: "2024-01-15",
    verified: true,
    helpful: 95
  },

  // ===== Product 6: Portable Bluetooth Speaker (ownerId: 2) =====
  {
    id: 26,
    productId: 6,
    userId: "user_z26",
    userName: "Tolga A.",
    rating: 5,
    title: "Pool party essential",
    comment: "Took this to several pool parties and it survived every splash. Sound quality is impressive for its size. 24-hour battery means it outlasts any party.",
    date: "2024-03-14",
    verified: true,
    helpful: 33
  },
  {
    id: 27,
    productId: 6,
    userId: "user_a27",
    userName: "Rachel G.",
    rating: 4,
    title: "Great portable speaker",
    comment: "The 360° sound fills rooms nicely. Bass is punchy for such a compact speaker. I deducted one star because the Bluetooth range could be better in open areas.",
    date: "2024-02-28",
    verified: true,
    helpful: 25
  },
  {
    id: 28,
    productId: 6,
    userId: "user_b28",
    userName: "İlker S.",
    rating: 4,
    title: "Perfect for outdoor adventures",
    comment: "The carabiner clip is super handy for hiking. Sound is clear even at max volume. IPX7 waterproofing gives me peace of mind on rainy trails.",
    date: "2024-02-10",
    verified: true,
    helpful: 19
  },

  // ===== Product 7: Smart Home Hub Pro (ownerId: 2) =====
  {
    id: 29,
    productId: 7,
    userId: "user_c29",
    userName: "Gökhan T.",
    rating: 4,
    title: "Central command for smart home",
    comment: "Controls all my smart devices from one screen. Zigbee and Z-Wave support means compatibility is excellent. The energy monitoring dashboard is a nice bonus.",
    date: "2024-03-16",
    verified: true,
    helpful: 28
  },
  {
    id: 30,
    productId: 7,
    userId: "user_d30",
    userName: "Nicole H.",
    rating: 5,
    title: "Made my home truly smart",
    comment: "Setting up automations was surprisingly easy. The 7-inch touch display is responsive and bright. Camera feed integration works flawlessly.",
    date: "2024-03-05",
    verified: true,
    helpful: 34
  },

  // ===== Product 8: Professional Drone X500 (ownerId: 2) =====
  {
    id: 31,
    productId: 8,
    userId: "user_e31",
    userName: "Yusuf K.",
    rating: 5,
    title: "Cinematic aerial footage",
    comment: "The 3-axis gimbal produces incredibly smooth footage. 45-minute flight time is best in class. Obstacle avoidance saved me multiple times on forest flights.",
    date: "2024-03-19",
    verified: true,
    helpful: 56
  },
  {
    id: 32,
    productId: 8,
    userId: "user_f32",
    userName: "Patricia M.",
    rating: 4,
    title: "Professional quality drone",
    comment: "I use this for real estate photography and clients are always impressed. The foldable design makes it easy to transport. 10km video transmission range is incredible.",
    date: "2024-03-08",
    verified: true,
    helpful: 42
  },
  {
    id: 33,
    productId: 8,
    userId: "user_g33",
    userName: "Onur B.",
    rating: 5,
    title: "Best drone I've owned",
    comment: "Upgraded from a budget drone and the difference is night and day. Return to home works perfectly. Intelligent flight modes make capturing complex shots effortless.",
    date: "2024-02-25",
    verified: true,
    helpful: 31
  },
  {
    id: 34,
    productId: 8,
    userId: "user_h34",
    userName: "Karen L.",
    rating: 4,
    title: "Impressive capabilities",
    comment: "Great for both photos and video. The 48MP sensor captures incredible detail. Wind resistance is good but struggles a bit in very gusty conditions.",
    date: "2024-02-14",
    verified: true,
    helpful: 22
  },

  // ===== Product 9: Wireless Charging Pad Duo (ownerId: 3) =====
  {
    id: 35,
    productId: 9,
    userId: "user_i35",
    userName: "Cem Ö.",
    rating: 4,
    title: "Clean desk essential",
    comment: "Charges my phone and earbuds simultaneously. The fabric top looks elegant on my desk. Charging speed is good with the included 36W adapter.",
    date: "2024-03-17",
    verified: true,
    helpful: 18
  },
  {
    id: 36,
    productId: 9,
    userId: "user_j36",
    userName: "Maria S.",
    rating: 5,
    title: "Works perfectly every time",
    comment: "No fiddling to find the sweet spot - it starts charging immediately. LED indicator is subtle enough for bedside use. Case-friendly charging is a big plus.",
    date: "2024-03-02",
    verified: true,
    helpful: 29
  },
  {
    id: 37,
    productId: 9,
    userId: "user_k37",
    userName: "Volkan E.",
    rating: 4,
    title: "Good value charging pad",
    comment: "Does exactly what it promises. 15W fast charging on both pads is nice. Foreign object detection gives peace of mind. Ultra-thin profile doesn't take much desk space.",
    date: "2024-02-18",
    verified: true,
    helpful: 14
  },
  {
    id: 38,
    productId: 9,
    userId: "user_l38",
    userName: "Emma B.",
    rating: 3,
    title: "Decent but not amazing",
    comment: "Works fine for charging but sometimes my phone doesn't register on the first placement. The anti-slip surface could be more grippy. Overall a decent product.",
    date: "2024-02-05",
    verified: true,
    helpful: 11
  },

  // ===== Product 10: Gaming Mouse Ultra (ownerId: 3) =====
  {
    id: 39,
    productId: 10,
    userId: "user_m39",
    userName: "Kaan G.",
    rating: 5,
    title: "Esports weapon of choice",
    comment: "At 58g, this mouse feels like air. The 25K DPI sensor is overkill but I love having the precision available. Won my first tournament with this mouse!",
    date: "2024-03-21",
    verified: true,
    helpful: 78
  },
  {
    id: 40,
    productId: 10,
    userId: "user_n40",
    userName: "Victoria C.",
    rating: 5,
    title: "Perfect for FPS games",
    comment: "The sensor tracking is flawless. PTFE glide feet make it slide like butter on my mousepad. 100-hour battery life means I rarely need to charge.",
    date: "2024-03-10",
    verified: true,
    helpful: 62
  },
  {
    id: 41,
    productId: 10,
    userId: "user_o41",
    userName: "Berk S.",
    rating: 4,
    title: "Lightweight and responsive",
    comment: "Great shape for claw grip users. The optical switches feel crisp and responsive. RGB is tasteful. Only wish it had more side buttons for MMO games.",
    date: "2024-02-28",
    verified: true,
    helpful: 35
  },
  {
    id: 42,
    productId: 10,
    userId: "user_p42",
    userName: "James W.",
    rating: 5,
    title: "Best wireless gaming mouse",
    comment: "Zero perceptible input lag in wireless mode. The dual-mode connectivity (2.4GHz + wired) is fantastic. On-board memory means my settings travel with me.",
    date: "2024-02-15",
    verified: true,
    helpful: 48
  },
  {
    id: 43,
    productId: 10,
    userId: "user_q43",
    userName: "Elif D.",
    rating: 4,
    title: "Great all-rounder",
    comment: "I use this for both work and gaming. Comfortable for long sessions, accurate tracking, and the programmable buttons boost my productivity in design software.",
    date: "2024-02-01",
    verified: true,
    helpful: 29
  },
  {
    id: 44,
    productId: 10,
    userId: "user_r44",
    userName: "Tom H.",
    rating: 5,
    title: "Can't go back to heavy mice",
    comment: "After using this 58g marvel, every other mouse feels like a brick. The sensor is best-in-class, glide is perfect, and the shape fits my hand like a glove.",
    date: "2024-01-20",
    verified: true,
    helpful: 56
  }
];

// ===== Service layer functions =====

/**
 * Get all reviews for a specific product
 */
export function getReviewsByProductId(productId) {
  return reviews
    .filter(r => r.productId === parseInt(productId))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get review statistics for a product
 */
export function getReviewStats(productId) {
  const productReviews = reviews.filter(r => r.productId === parseInt(productId));
  if (productReviews.length === 0) {
    return { average: 0, total: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };
  }

  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let total = 0;

  productReviews.forEach(r => {
    distribution[r.rating]++;
    total += r.rating;
  });

  return {
    average: Math.round((total / productReviews.length) * 10) / 10,
    total: productReviews.length,
    distribution
  };
}

/**
 * Get review count for each product (for AI context)
 */
export function getReviewCountByProduct() {
  const counts = {};
  reviews.forEach(r => {
    counts[r.productId] = (counts[r.productId] || 0) + 1;
  });
  return counts;
}

/**
 * Get review summary for AI - includes review data for the products of a user
 */
export function getReviewsSummaryForAI(productIds) {
  const summary = {};
  productIds.forEach(pid => {
    const productReviews = reviews.filter(r => r.productId === pid);
    const stats = getReviewStats(pid);
    summary[pid] = {
      totalReviews: productReviews.length,
      averageRating: stats.average,
      ratingDistribution: stats.distribution,
      recentReviews: productReviews
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
        .map(r => ({
          userName: r.userName,
          rating: r.rating,
          title: r.title,
          comment: r.comment,
          date: r.date
        }))
    };
  });
  return summary;
}

/**
 * Add a new review (in-memory - resets on server restart)
 */
let nextReviewId = reviews.length + 1;
export function addReview(productId, reviewData) {
  const newReview = {
    id: nextReviewId++,
    productId: parseInt(productId),
    userId: reviewData.userId || 'anonymous',
    userName: reviewData.userName || 'Anonymous',
    rating: reviewData.rating,
    title: reviewData.title,
    comment: reviewData.comment,
    date: new Date().toISOString().split('T')[0],
    verified: true,
    helpful: 0
  };
  reviews.push(newReview);
  return newReview;
}
