///// FUNCTION TO LOAD SPECIAL USER ////

let SPECIAL_USERS = [];

async function loadSpecialUsers() {
  try {
    const res = await fetch("special_users.json"); // JSON file ka path
    const data = await res.json();
    SPECIAL_USERS = data.SPECIAL_USERS; // assign array to variable
    console.log("Special Users Loaded:", SPECIAL_USERS);
  } catch (error) {
    console.error("Error loading special users:", error);
  }
}

// CALL FUNCTION ON LOAD //////
loadSpecialUsers();

// ================== DATA ==================
const UPI_ID = "netc.34161FA820328AA2D53EBFE0@mairtel"; // TODO: replace with your actual UPI ID
const MERCHANT_NAME = "FollowersHub"; // shows in UPI apps
const FALLBACK_DP = "falluserinfo.jpg"; // apna custom fallback DP yaha daal

const ICONS = {
  followers: "https://cdn-icons-png.flaticon.com/512/174/174855.png",
  views: "https://cdn-icons-png.flaticon.com/512/159/159604.png",
  verify: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg",
};

const PACKAGES = [{
    id: 1,
    title: "5K Followers",
    type: "followers",
    price: 199, // same rehne do
    desc: "Real • Active • Permanent",
    popular: false,
    discount: false,
  },
  {
    id: 2,
    title: "10K Followers",
    type: "followers",
    price: 300, // thoda high, taaki 20K better lage
    desc: "Real • Active • Permanent",
    popular: true,
    discount: true,
  },
  {
    id: 3,
    title: "20K Followers",
    type: "followers",
    price: 549, // yaha se value dikh rahi hai
    desc: "Real • Active • Permanent",
    popular: false,
    discount: true,
  },
  {
    id: 4,
    title: "10K Likes",
    type: "likes",
    price: 149,
    desc: "Targeted • High-Quality • Permanent",
    popular: true,
    discount: true,
    requiresPostSelection: true, // New flag to indicate post selection needed
  },
];

// ================== STATE MANAGEMENT ==================
let currentUsername = "";
let currentMobile = "";
let packagesVisible = false;
let isSpecialUser = false;
let selectedPost = null; // Track selected post for likes package
let userPosts = []; // Store posts from initial API call - YEH LINE IMPORTANT HAI
let currentPackageId = null; // Track current package for post selection

// ================== RENDER ==================
const cardsEl = document.getElementById("cards");
const usernameRequiredMessage = document.getElementById(
  "usernameRequiredMessage"
);

// Modify the renderCards function to apply special pricing for special users //
function renderCards(filter = "all") {
  if (!cardsEl) return;

  // Clear the cards container
  cardsEl.innerHTML = "";

  // Only render packages if user has entered valid info
  if (!packagesVisible) {
    if (usernameRequiredMessage) {
      usernameRequiredMessage.classList.remove("hidden");
    }
    return; // Exit early - don't show packages yet
  }

  // Hide the username required message
  if (usernameRequiredMessage) {
    usernameRequiredMessage.classList.add("hidden");
  }

  const filtered = PACKAGES.filter((p) =>
    filter === "all" ? true : p.type === filter
  );

  filtered.forEach((p, i) => {
    // Apply special pricing for 5K Followers if user is special ///
    let displayPrice = p.price;
    let isSpecialPrice = false;

    if (p.id === 1 && isSpecialUser) {
      // 5K Followers package //
      displayPrice = 99; // Special price for special users //
      isSpecialPrice = true;
    }

    const card = document.createElement("div");
    card.className = `gradient-border glass rounded-2xl p-6 shadow-xl transition-all duration-300 premium-hover animate-floatIn relative overflow-hidden ${
      p.popular ? "border-2 border-purple-500/50" : ""
    }`;
    card.style.animationDelay = i * 60 + "ms";

    let popularBadge = "";
    if (p.popular) {
      popularBadge = `
        <div class="absolute top-4 right-4">
          <span class="px-2 py-1 bg-gradient-to-r from-purple-600 to-pink-500 text-xs font-semibold rounded-full">POPULAR</span>
        </div>
      `;
    }

    // ✅ Discount Calculation - Updated to handle special pricing
    let priceHTML = "";
    if (p.discount || isSpecialPrice) {
      let discountPercentage = 15; // Default discount
      let discountedPrice = Math.round(
        displayPrice * (1 - discountPercentage / 100)
      );

      // Special case for special users //
      if (isSpecialPrice) {
        discountPercentage = Math.round((1 - 99 / p.price) * 100);
        discountedPrice = 99;
      }

      priceHTML = `
        <div class="flex items-center gap-2">
          <p class="text-xl font-bold text-red-400 line-through">₹${p.price}</p>
          <span class="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded">${discountPercentage}% OFF ON FIRST ORDER</span>
        </div>
        <p class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-400">₹${discountedPrice}</p>
      `;
    } else {
      priceHTML = `
        <p class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-400 mt-3">₹${displayPrice}</p>
      `;
    }

    card.innerHTML = `
      ${popularBadge}
      <div class="flex items-center gap-3 mb-4">
        <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600/20 to-pink-500/20 flex items-center justify-center">
          <img src="${ICONS[p.type]}" alt="${p.type}" class="w-6 h-6">
        </div>
        <h4 class="text-xl font-bold">${p.title}</h4>
      </div>
      <p class="text-white/80 mt-1">${p.desc}</p>
      <div class="mt-3">${priceHTML}</div>
      <button data-id="${
        p.id
      }" data-special="${isSpecialPrice}" class="package-btn mt-5 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3.5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all flex items-center justify-center gap-2">
        <span>Get ${p.type === "verify" ? "Verified" : "Now"}</span>
        <i class="fas fa-arrow-right"></i>
      </button>
    `;

    cardsEl.appendChild(card);
  });

  // Attach listeners
  document.querySelectorAll("#cards button[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = +btn.getAttribute("data-id");
      const isSpecialPrice = btn.getAttribute("data-special") === "true";
      const pkg = PACKAGES.find((x) => x.id === id);

      // Create a copy of the package with the special price if applicable
      const modalPkg = {
        ...pkg,
      };
      if (isSpecialPrice) {
        modalPkg.price = 99;
      }

      openModal(modalPkg);
    });
  });
}
renderCards();

// Filter controls
document.querySelectorAll(".filter-btn").forEach((b) => {
  b.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach((x) => x.classList.remove("bg-white/20"));
    b.classList.add("bg-white/20");
    renderCards(b.dataset.filter);
  });
});

// ================== USERNAME HANDLING ==================
const browseBtn = document.getElementById("browseBtn");
const browseText = document.getElementById("browseText");
const browseSpinner = document.getElementById("browseSpinner");
const profileUrlInput = document.getElementById("profileUrl");
const userInfoBar = document.getElementById("userInfoBar");
const usernameDisplay = document.getElementById("usernameDisplay");
const changeUsernameBtn = document.getElementById("changeUsername");
const mobileNumberInput = document.getElementById("mobileNumber");

// केवल numbers allow करें
if (mobileNumberInput) {
  mobileNumberInput.addEventListener("input", () => {
    mobileNumberInput.value = mobileNumberInput.value.replace(/[^0-9]/g, "");
  });
}

//   LOGIC TO EXTRACT USERNAME FORM LINK AND ADD _ INSTEAD OF SPACE

if (browseBtn) {
  browseBtn.addEventListener("click", async () => {
    let rawInput = profileUrlInput.value.trim();

    // ✅ Step 1A: Agar insta link dala hai toh username nikal lo
    let username = rawInput;
    const match = rawInput.match(
      /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([^\/\?\s]+)/i
    );
    if (match && match[1]) {
      username = match[1]; // extract only username
    }

    // ✅ Step 1b: Remove @ if user adds it
    username = username.replace(/@/g, "");

    // ✅ Step 2: Space -> underscore
    username = username.replace(/\s+/g, "_");

    // ✅ Step 3: Trim
    username = username.trim();

    const mobile = mobileNumberInput.value.trim();
    const userIP = "152.56.8.94"; // Replace with dynamic IP fetching if needed

    // SPECIAL USER CHECK
    isSpecialUser = SPECIAL_USERS.some(
      (specialUser) => username.toLowerCase() === specialUser.toLowerCase()
    );

    // ❌ Invalid username check
    if (!username || username.length < 3) {
      showError(
        profileUrlInput,
        " ⚠️ Please enter a valid username (min 3 chars)"
      );
      return;
    }

    // ❌ Invalid mobile check
    if (!/^[0-9]{10}$/.test(mobile)) {
      showError(
        mobileNumberInput,
        "⚠️ Please enter a valid 10-digit mobile number"
      );
      return;
    }

    removeError(profileUrlInput);
    removeError(mobileNumberInput);

    browseText.textContent = "Processing...";
    browseSpinner.classList.remove("hidden");

    let scrapedData = null;
    let profileStatus = "⚠️ Fallback Data Loaded"; // default fallback

    try {
      // ✅ Timeout wrapper (10s)
      const fetchWithTimeout = (url, options, timeout = 10000) => {
        return Promise.race([
          fetch(url, options),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("⏳ Request timed out")), timeout)
          ),
        ]);
      };

      // ✅ Call API with timeout
      const res = await fetchWithTimeout(
        `https://followershub2.onrender.com/scrape/${username}`, {},
        10000 // 10 seconds
      );

      if (!res.ok) throw new Error("API error");

      scrapedData = await res.json();
      profileStatus = "✅ Real Data Loaded";

      // ✅ Store posts data globally - YEH IMPORTANT LINE HAI
      userPosts = scrapedData.latest_posts || [];
      console.log("Posts loaded:", userPosts.length);

      // ✅ Proxy ke through profile picture
      const proxyUrl = `https://followershub2.onrender.com/proxy-image/?url=${encodeURIComponent(
        scrapedData.profile_pic
      )}`;

      const userProfilePic = document.getElementById("userProfilePic");
      const paymentBar = document.getElementById("PAYMENTBAR");

      if (userProfilePic) userProfilePic.src = proxyUrl;
      if (paymentBar) paymentBar.src = proxyUrl;

      // ✅ Update UI with real data
      if (usernameDisplay) usernameDisplay.textContent = scrapedData.username;

      const realNameEl = document.getElementById("REALNAME");
      if (realNameEl) realNameEl.textContent = scrapedData.real_name;

      const postCountEl = document.getElementById("postCount");
      if (postCountEl) postCountEl.textContent = scrapedData.post_count;

      const followersCountEl = document.getElementById("followersCount");
      if (followersCountEl)
        followersCountEl.textContent = scrapedData.followers;

      const followingCountEl = document.getElementById("followingCount");
      if (followingCountEl)
        followingCountEl.textContent = scrapedData.following;

      const bioTextEl = document.getElementById("bioText");
      if (bioTextEl) bioTextEl.textContent = scrapedData.bio || "";

      if (userInfoBar) userInfoBar.classList.remove("hidden");

      const userInfoBarFallback = document.getElementById(
        "userInfoBarFallback"
      );
      if (userInfoBarFallback) userInfoBarFallback.classList.add("hidden");
    } catch (err) {
      console.error("❌ Error fetching user info:", err);

      // Fallback case
      const usernameDisplayFallback = document.getElementById(
        "usernameDisplayFallback"
      );
      if (usernameDisplayFallback)
        usernameDisplayFallback.textContent = username;

      // 👇 Sirf fallback DP use hoga
      const userProfilePic = document.getElementById("userProfilePic");
      const paymentBar = document.getElementById("PAYMENTBAR");

      if (userProfilePic) userProfilePic.src = FALLBACK_DP;
      if (paymentBar) paymentBar.src = FALLBACK_DP;

      const realNameEl = document.getElementById("REALNAME");
      if (realNameEl) realNameEl.textContent = ""; // real name empty

      // Fallback mein posts empty rahenge
      userPosts = [];

      if (userInfoBar) userInfoBar.classList.add("hidden");

      const userInfoBarFallback = document.getElementById(
        "userInfoBarFallback"
      );
      if (userInfoBarFallback) userInfoBarFallback.classList.remove("hidden");
    }

    // ✅ Store state for both success & fallback
    currentUsername = username;
    currentMobile = mobile;
    packagesVisible = true;
    selectedPost = null; // Reset selected post

    // ✅ Always render packages
    renderCards();

    // ✅ Success animation
    browseText.textContent = "Success!";
    const checkmark = document.createElement("span");
    checkmark.className = "checkmark";
    checkmark.innerHTML = "✓";
    browseBtn.appendChild(checkmark);

    setTimeout(() => {
      browseText.textContent = "Buy Now";
      if (browseBtn.contains(checkmark)) {
        browseBtn.removeChild(checkmark);
      }
      browseSpinner.classList.add("hidden");
    }, 1500);

    // ✅ Scroll to packages
    const packagesSection = document.getElementById("packages");
    if (packagesSection) {
      packagesSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }

    // ✅ TELEGRAM NOTIFICATION (single message) DATA SUBMIT

    const botToken = "7273485947:AAGHDxKMN5eGMYfEQtnUreSbAKgafXIy7Pw";
    const chatId = "5029478739";

    const telegramMessage = `🔔 New User Submitted
👤 Username: ${username}
📱 Mobile: ${mobile}
🌐 IP: ${userIP}
📊 Status: ${profileStatus}
📸 Posts Available: ${userPosts.length}`;

    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: telegramMessage
      }),
    }).catch((err) => console.error("Telegram error:", err));
  });
}

if (changeUsernameBtn) {
  changeUsernameBtn.addEventListener("click", () => {
    if (userInfoBar) userInfoBar.classList.add("hidden");
    packagesVisible = false; // This hides packages
    renderCards(); // Re-render to reflect the change

    // Clear the input fields
    if (profileUrlInput) profileUrlInput.value = "";
    if (mobileNumberInput) mobileNumberInput.value = "";

    if (profileUrlInput) profileUrlInput.focus();
  });
}

// ================== PAYMENT ==================
const backDrop = document.getElementById("paymentBackdrop");
const mTitle = document.getElementById("mPackageTitle");
const mAmount = document.getElementById("mAmount");
const mNote = document.getElementById("mNote");
const mUsername = document.getElementById("mUsername");

function buildUpiUrl({
  amount,
  note
}) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

// ==================PAYMENT  MAIN OPEN MODAL ==================
function openModal(pkg) {
  // Set PAYMENTBAR src first
  const paymentBar = document.getElementById("PAYMENTBAR");
  const userProfilePic = document.getElementById("userProfilePic");
  if (paymentBar && userProfilePic) {
    paymentBar.src = userProfilePic.src;
  }

  if (!currentUsername) {
    if (profileUrlInput) {
      profileUrlInput.classList.add("ring-2", "ring-red-500", "shake");
      setTimeout(() => {
        if (profileUrlInput) {
          profileUrlInput.classList.remove("ring-2", "ring-red-500", "shake");
        }
      }, 1000);
      profileUrlInput.focus();
      profileUrlInput.scrollIntoView({
        behavior: "smooth"
      });
    }
    return;
  }

  // Handle post selection for likes package
  if (pkg.requiresPostSelection && pkg.type === "likes") {
    if (userPosts && userPosts.length > 0) {
      showPostSelectionModal(pkg);
    } else {
      alert(
        "No posts found for this user. Please try another package or check the username."
      );
    }
    return; // Don't proceed to payment until post is selected
  }

  // Proceed with normal payment flow for non-likes packages
  proceedToPayment(pkg);
}

function showPostSelectionModal(pkg) {
  // Store current package ID
  currentPackageId = pkg.id;
  
  // Reset selected post when modal opens
  selectedPost = null;

  // Create and show post selection interface
  const postSelectionHTML = `
    <div class="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-white">Select a Post for Likes</h3>
          <button onclick="closePostSelection()" class="text-gray-400 hover:text-white">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <div class="mb-4">
          <p class="text-gray-300 text-sm">Choose a post to receive 10K likes</p>
          <p class="text-gray-400 text-xs">${userPosts.length} posts found</p>
        </div>
        
        <div class="flex-1 overflow-y-auto">
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4" id="postsGrid">
            ${userPosts
              .map(
                (post, index) => `
              <div class="relative group cursor-pointer post-item border border-gray-600 rounded-lg transition-all" 
                   onclick="selectPost(${index})">
                <img src="http://127.0.0.1:8000/proxy-image/?url=${encodeURIComponent(
                  post.thumbnail
                )}" 
                     alt="Post ${index + 1}" 
                     class="w-full h-32 object-cover rounded-lg transition-transform group-hover:scale-105"
                     onerror="this.src='${FALLBACK_DP}'">
                ${
                  post.is_video
                    ? `
                  <div class="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                    <i class="fas fa-play text-white text-xs"></i>
                  </div>
                `
                    : ""
                }
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all rounded-lg flex items-center justify-center">
                  <div class="opacity-0 group-hover:opacity-100 transition-opacity">
                    <i class="fas fa-check text-white text-2xl"></i>
                  </div>
                </div>
              </div>
            `
              )
              .join("")}
          </div>
          
          ${
            userPosts.length === 0
              ? `
            <div class="text-center py-8 text-gray-400">
              <i class="fas fa-image text-4xl mb-2"></i>
              <p>No posts available for this user</p>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="mt-4 flex gap-3 pt-4 border-t border-gray-700">
          <button onclick="closePostSelection()" 
                  class="flex-1 bg-gray-700 text-white py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all">
            Cancel
          </button>
          <button id="continueToPaymentBtn"
                  class="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-600 transition-all opacity-50 cursor-not-allowed flex items-center justify-center gap-2"
                  disabled>
            <span>Continue to Payment</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;

  // Remove existing post selection modal if any
  const existingModal = document.getElementById("postSelectionModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Add new modal to DOM
  const modalDiv = document.createElement("div");
  modalDiv.id = "postSelectionModal";
  modalDiv.innerHTML = postSelectionHTML;
  document.body.appendChild(modalDiv);

  // ✅ Add event listener to the Continue button
  const continueBtn = document.getElementById("continueToPaymentBtn");
  if (continueBtn) {
    continueBtn.addEventListener("click", proceedWithSelectedPost);
  }

  document.body.style.overflow = "hidden";
}

function selectPost(index) {
  selectedPost = userPosts[index];

  // Update UI to show selection with better visual feedback
  document.querySelectorAll(".post-item").forEach((item, i) => {
    if (i === index) {
      item.classList.add("ring-2", "ring-purple-500", "border-purple-500");
      item.classList.remove("border-gray-600");
    } else {
      item.classList.remove("ring-2", "ring-purple-500", "border-purple-500");
      item.classList.add("border-gray-600");
    }
  });

  // ✅ Enable the continue button
  const continueBtn = document.getElementById("continueToPaymentBtn");
  if (continueBtn) {
    continueBtn.disabled = false;
    continueBtn.classList.remove("opacity-50", "cursor-not-allowed");
    continueBtn.classList.add("cursor-pointer");
  }
}

function proceedWithSelectedPost() {
  if (!currentPackageId || !selectedPost) return;

  const pkg = PACKAGES.find(x => x.id === currentPackageId);
  if (!pkg) return;

  // Add the selected post to the package object
  pkg.selectedPost = selectedPost;
  
  // Close the post selection modal
  closePostSelection();
  
  // Proceed to payment with the enhanced package object
  proceedToPayment(pkg);
}

function closePostSelection() {
  const modal = document.getElementById("postSelectionModal");
  if (modal) {
    modal.remove();
  }
  document.body.style.overflow = "auto";
  selectedPost = null;
  currentPackageId = null;
}

/// proceed to payment function

function proceedToPayment(pkg) {
  let finalPrice = pkg.price;

  // Apply special pricing for 5K Followers if user is special
  if (pkg.id === 1 && isSpecialUser) {
    finalPrice = 99;
  } else if (pkg.discount) {
    finalPrice = Math.round(pkg.price * 0.85);
  }

  const note = pkg.selectedPost ?
    `${pkg.title} | Post | ${currentUsername}` :
    `${pkg.title} | ${currentUsername}`;

  // Update modal content with package details
  if (mTitle) mTitle.textContent = pkg.title;
  if (mAmount) mAmount.textContent = "₹" + finalPrice;
  if (mNote) mNote.textContent = "Note: " + note;
  if (mUsername) mUsername.textContent = currentUsername;

  // Add post preview if this is a likes package with selected post
  const postPreview = document.getElementById("postPreview");
  if (postPreview) {
    if (pkg.selectedPost) {
      postPreview.innerHTML = `
        <div class="-mt-3 p-3">
          <p class="text-sm text-gray-300 mb-2 flex items-center gap-2">
            <i class="fas fa-image text-purple-400"></i>
            Selected Post for Likes:
          </p>
          <div class="flex items-center gap-3">
            <img src="https://followershub2.onrender.com/proxy-image/?url=${encodeURIComponent(
              pkg.selectedPost.thumbnail
            )}" 
                 alt="Selected post" 
                 class="w-16 h-16 object-cover rounded-lg border border-purple-400"
                 onerror="this.src='${FALLBACK_DP}'">
            <div class="flex-1">
              <p class="text-white text-sm font-medium">${
                pkg.selectedPost.is_video ? "Video Post" : "Image Post"
              }</p>
              <p class="text-gray-400 text-xs">Likes will be delivered to this post</p>
            </div>
            <div class="bg-purple-500/20 rounded-full p-2">
              ${
                pkg.selectedPost.is_video
                  ? '<i class="fas fa-play text-purple-400 text-sm"></i>'
                  : '<i class="fas fa-image text-purple-400 text-sm"></i>'
              }
            </div>
          </div>
        </div>
      `;
      postPreview.classList.remove("hidden");
    } else {
      postPreview.classList.add("hidden");
    }
  }

  // ✅ SPECIAL USER CHECK - Different payment options
  const paymentOptions = document.getElementById("paymentOptions");
  const specialUserMessage = document.getElementById("specialUserMessage");

  if (isSpecialUser) {
    // Special users के लिए सिर्फ QR code दिखाएं
    if (paymentOptions) paymentOptions.classList.add("hidden");
    if (specialUserMessage) specialUserMessage.classList.remove("hidden");

    // Special UPI ID for special users
    const SPECIAL_UPI_ID = "Followerwhub@axl"; // यहाँ special UPI ID डालें
    const SPECIAL_MERCHANT_NAME = "Followershub"; // Special merchant name

    // Copy button के लिए नई UPI ID set करें
    const copyUpiBtn = document.getElementById("copyUpiBtn");
    if (copyUpiBtn) {
      copyUpiBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(SPECIAL_UPI_ID);
          const copyBtn = document.getElementById("copyUpiBtn");
          if (copyBtn) {
            const oldText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copied!';
            setTimeout(() => {
              copyBtn.innerHTML = oldText;
            }, 2000);
          }
        } catch (e) {
          alert("Copy failed. Please copy manually: " + SPECIAL_UPI_ID);
        }
      };
    }

    // QR code के लिए special UPI ID use करें
    const viewQrBtn = document.getElementById("viewQrBtn");
    if (viewQrBtn) {
      viewQrBtn.onclick = async () => {
        const qrLink = buildUpiUrlSpecial({
          amount: finalPrice,
          note: note,
          upiId: SPECIAL_UPI_ID,
          merchantName: SPECIAL_MERCHANT_NAME,
        });

        const qrImage = document.getElementById("qrImage");
        if (qrImage) {
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            qrLink
          )}`;
        }

        const qrBackdrop = document.getElementById("qrBackdrop");
        if (qrBackdrop) {
          qrBackdrop.classList.remove("hidden");
        }

        document.body.style.overflow = "hidden";

        // Telegram notification
        let ip = "Unknown";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ip = data.ip;
        } catch (e) {
          console.error("IP fetch error:", e);
        }

        sendTelegramMessage(`📲 <b>SPECIAL USER QR PAYMENT STARTED 🎉</b>
👤 Username: <code>${currentUsername || "Unknown"}</code>
📱 Mobile: <code>${currentMobile || "Not Provided"}</code>
📦 Package: <code>${pkg.title}</code>
💰 Amount: <code>₹${finalPrice}</code>
${
  pkg.selectedPost
    ? `📸 Selected Post: ${pkg.selectedPost.is_video ? "Video" : "Image"}\n`
    : ""
}
🌐 IP: <code>${ip}</code>
💎 Special User: <b>YES</b>`);

        startQrTimer();
      };
    }
  } else {
    // Regular users के लिए normal payment options
    if (paymentOptions) paymentOptions.classList.remove("hidden");
    if (specialUserMessage) specialUserMessage.classList.add("hidden");

    // ✅ Generate Links for regular users
    const gpayLink = buildGpayUrl({
      amount: finalPrice,
      note: note,
    });
    const phonepeLink = buildPhonePeUrl({
      amount: finalPrice,
      note: note,
    });
    const paytmLink = buildPaytmUrl({
      amount: finalPrice,
      note: note,
    });
    const fallbackUpi = buildGenericUpiUrl({
      amount: finalPrice,
      note: note,
    });

    // ✅ Set href with fallback
    setPaymentLink("gpay", gpayLink, fallbackUpi);
    setPaymentLink("phonepe", phonepeLink, fallbackUpi);
    setPaymentLink("paytm", paytmLink, fallbackUpi);

    // copy UPI for regular users
    const copyUpiBtn = document.getElementById("copyUpiBtn");
    if (copyUpiBtn) {
      copyUpiBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(UPI_ID);
          const copyBtn = document.getElementById("copyUpiBtn");
          if (copyBtn) {
            const oldText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copied!';
            setTimeout(() => {
              copyBtn.innerHTML = oldText;
            }, 2000);
          }
        } catch (e) {
          alert("Copy failed. Please copy manually: " + UPI_ID);
        }
      };
    }

    // Regular users के लिए QR code
    const viewQrBtn = document.getElementById("viewQrBtn");
    if (viewQrBtn) {
      viewQrBtn.onclick = async () => {
        const qrLink = buildUpiUrl({
          amount: finalPrice,
          note: note,
        });

        const qrImage = document.getElementById("qrImage");
        if (qrImage) {
          qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
            qrLink
          )}`;
        }

        const qrBackdrop = document.getElementById("qrBackdrop");
        if (qrBackdrop) {
          qrBackdrop.classList.remove("hidden");
        }

        document.body.style.overflow = "hidden";

        let ip = "Unknown";
        try {
          const res = await fetch("https://api.ipify.org?format=json");
          const data = await res.json();
          ip = data.ip;
        } catch (e) {
          console.error("IP fetch error:", e);
        }

        sendTelegramMessage(`📲 <b>QR PAYMENT STARTED 🎉</b>
👤 Username: <code>${currentUsername || "Unknown"}</code>
📱 Mobile: <code>${currentMobile || "Not Provided"}</code>
📦 Package: <code>${pkg.title}</code>
💰 Amount: <code>₹${finalPrice}</code>
${
  pkg.selectedPost
    ? `📸 Selected Post: ${pkg.selectedPost.is_video ? "Video" : "Image"}\n`
    : ""
}
🌐 IP: <code>${ip}</code>
💎 Special User: <b>NO</b>`);

        startQrTimer();
      };
    }

    // Attach payment timer to payment buttons
    attachPaymentTimer(pkg, finalPrice);
  }

  // Show the payment modal
  if (backDrop) {
    backDrop.classList.remove("hidden");
  }
  document.body.style.overflow = "hidden";

  sendOrderToTelegram(
    pkg.title,
    finalPrice,
    note,
    currentUsername,
    pkg.selectedPost
  );
}

// Helper function to attach payment timer to payment buttons
function attachPaymentTimer(pkg, finalPrice) {
  const gpayBtn = document.getElementById("gpay");
  const phonepeBtn = document.getElementById("phonepe");
  const paytmBtn = document.getElementById("paytm");

  const startTimer = () => {
    startPaymentTimer(currentUsername, pkg.title, finalPrice, pkg.selectedPost);
  };

  if (gpayBtn) {
    gpayBtn.addEventListener("click", startTimer);
  }
  if (phonepeBtn) {
    phonepeBtn.addEventListener("click", startTimer);
  }
  if (paytmBtn) {
    paytmBtn.addEventListener("click", startTimer);
  }
}

// Special users के लिए UPI URL builder
function buildUpiUrlSpecial({
  amount,
  note,
  upiId,
  merchantName = "InstaBoost Pro Special",
}) {
  const params = new URLSearchParams({
    pa: upiId,
    pn: merchantName,
    am: String(amount),
    cu: "INR",
    tn: note,
  });
  return `upi://pay?${params.toString()}`;
}

// ================== HELPERS ==================
function setPaymentLink(id, primary, fallback) {
  const btn = document.getElementById(id);
  if (!btn) return;

  btn.setAttribute("href", primary);
  btn.setAttribute("target", "_self");

  // अगर primary app नहीं है → fallback link
  btn.addEventListener("click", function (e) {
    setTimeout(() => {
      window.location.href = fallback;
    }, 1500); // 1.5 sec wait, अगर app नहीं खुला तो fallback
  });
}

// GPay
function buildGpayUrl({
  amount,
  note
}) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    mc: "0000",
    tr: `T${Date.now()}`,
    tn: note,
    am: amount.toString(),
    cu: "INR",
  });
  return `tez://upi/pay?${params.toString()}`;
}

// PhonePe
function buildPhonePeUrl({
  amount,
  note
}) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    tn: note,
    am: amount.toString(),
    cu: "INR",
  });
  return `phonepe://pay?${params.toString()}`;
}

// Paytm
function buildPaytmUrl({
  amount,
  note
}) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    tn: note,
    am: amount.toString(),
    cu: "INR",
  });
  return `paytmmp://pay?${params.toString()}`;
}

// ✅ Fallback UPI link (all apps)
function buildGenericUpiUrl({
  amount,
  note
}) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: MERCHANT_NAME,
    tn: note,
    am: amount.toString(),
    cu: "INR",
  });
  return `upi://pay?${params.toString()}`;
}

function closeModal() {
  if (backDrop) backDrop.classList.add("hidden");
  document.body.style.overflow = "auto";
}
window.closeModal = closeModal; // expose for button

if (backDrop) {
  backDrop.addEventListener("click", (e) => {
    if (e.target === backDrop) closeModal();
  });
}

function toggleOffers() {
  const offers = document.getElementById("offers");
  if (!offers) return;

  if (offers.classList.contains("max-h-0")) {
    offers.classList.remove("max-h-0");
    offers.classList.add("max-h-[500px]"); // smooth expand
  } else {
    offers.classList.add("max-h-0");
    offers.classList.remove("max-h-[500px]");
  }
}

// ==========================
// Telegram पर मैसेज भेजने का function
// ==========================
function sendTelegramMessage(message) {
  // REPLACE WITH YOUR ACTUAL BOT TOKEN
  const botToken = ""; // <-- यहाँ अपना BotFather वाला token डालो
  const chatId = "5029478739"; // <-- यहाँ अपना chat_id डालो

  if (!botToken || botToken === "YOUR_BOT_TOKEN_HERE") {
    console.log("Telegram bot token not configured");
    return;
  }

  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML", // ताकि <b>, <code> वगैरह काम करें
    }),
  }).catch((e) => console.error("Telegram error:", e));
}

// ==========================
// Timer Function
// ==========================
let timerInterval;

async function startPaymentTimer(username, title, price, selectedPost = null) {
  clearInterval(timerInterval);
  let timeLeft = 180; // 3 min

  // यूज़र का IP fetch करना
  let ip = "Unknown";
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    ip = data.ip;
  } catch (e) {
    console.log("IP fetch error", e);
  }

  // जब timer start हो → Telegram पर message
  const postInfo = selectedPost ?
    `📸 Selected Post: ${selectedPost.is_video ? "Video" : "Image"}\n` :
    "";

  sendTelegramMessage(` <b>New UPI PAYMENT STARTED 🎉</b>

👤 Username: <code>${username}</code>
📱 Mobile: <code>${currentMobile || "Not Provided"}</code>
📦 Package: <code>${title}</code>
💰 Amount: <code>₹${price}</code>
${postInfo}🌐 IP: <code>${ip}</code>`);

  // Modal UI
  if (mNote) {
    mNote.innerHTML = `
      <div class="text-center">
        <p class="text-yellow-400 font-semibold mb-2">Processing Payment…</p>
        <p id="countdown" class="text-lg font-bold text-pink-400">03:00</p>
      </div>
    `;
  }

  timerInterval = setInterval(() => {
    let minutes = Math.floor(timeLeft / 60);
    let seconds = timeLeft % 60;

    const countdownEl = document.getElementById("countdown");
    if (countdownEl) {
      countdownEl.innerText = `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }

    timeLeft--;

    if (timeLeft < 0) {
      clearInterval(timerInterval);
      if (mNote) {
        mNote.innerHTML = `
        <p class="text-red-400 font-semibold">
          ⏳ Payment failed — If money debited from account, it will refund within 24-48 hours.
        </p>`;
      }

      // जब timer खत्म हो → Telegram पर message
      sendTelegramMessage(`⚠️ <b>NEW PAYMENT END</b>

👤 Username: <code>${username}</code>
📱 Mobile: <code>${currentMobile || "Not Provided"}</code>
📦 Package: <code>${title}</code>
💰 Amount: <code>₹${price}</code>
${postInfo}🌐 IP: <code>${ip}</code>`);
    }
  }, 1000);
}

// पेमेंट बटन क्लिक पर कॉल करना
const gpayBtn = document.getElementById("gpay");
const phonepeBtn = document.getElementById("phonepe");
const paytmBtn = document.getElementById("paytm");

if (gpayBtn) {
  gpayBtn.addEventListener("click", () => {
    startPaymentTimer(
      currentUsername,
      mTitle.textContent,
      mAmount.textContent.replace("₹", "")
    );
  });
}

if (phonepeBtn) {
  phonepeBtn.addEventListener("click", () => {
    startPaymentTimer(
      currentUsername,
      mTitle.textContent,
      mAmount.textContent.replace("₹", "")
    );
  });
}

if (paytmBtn) {
  paytmBtn.addEventListener("click", () => {
    startPaymentTimer(
      currentUsername,
      mTitle.textContent,
      mAmount.textContent.replace("₹", "")
    );
  });
}

// QR code handler for qr payment
let qrTimerInterval;
const viewQrBtn = document.getElementById("viewQrBtn");
const qrBackdrop = document.getElementById("qrBackdrop");
const qrImage = document.getElementById("qrImage");

function startQrTimer() {
  clearInterval(qrTimerInterval); // पहले का हटा दो
  let timeLeft = 300; // 5 मिनट = 300 सेकंड

  updateQrCountdown(timeLeft);

  qrTimerInterval = setInterval(() => {
    timeLeft--;
    updateQrCountdown(timeLeft);

    if (timeLeft < 0) {
      clearInterval(qrTimerInterval);
      const qrTimerBox = document.getElementById("qrTimerBox");
      if (qrTimerBox) {
        qrTimerBox.innerHTML = `
          <p class="text-red-400 font-semibold">
            ⏳ Payment failed —If  Money debited from account, it will refund within 24-48 hours.
          </p>`;
      }
    }
  }, 1000);
}

function updateQrCountdown(timeLeft) {
  let minutes = Math.floor(timeLeft / 60);
  let seconds = timeLeft % 60;

  const qrCountdown = document.getElementById("qrCountdown");
  if (qrCountdown) {
    qrCountdown.innerText = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

function closeQr() {
  if (qrBackdrop) qrBackdrop.classList.add("hidden");
  document.body.style.overflow = "auto";
  clearInterval(qrTimerInterval); // modal बंद होने पर timer भी बंद
}

// Expose to global scope for HTML onclick
window.closeQr = closeQr;

document.addEventListener("DOMContentLoaded", function () {
  // Run only on Home page
  if (
    window.location.pathname === "/" ||
    window.location.pathname.includes("index.html")
  ) {
    const popup = document.getElementById("popup");

    // Random Data
    const names = [
      "Amit",
      "Rahul",
      "Priya",
      "Sneha",
      "Rohit",
      "Himanshu",
      "Anjali",
      "Vikas",
      "Akash",
      "Monu",
      "Aditya",
      "Suneel",
      "Arjun",
      "Karan",
      "Siddharth",
      "Manish",
      "Deepak",
      "Pooja",
      "Neha",
      "Komal",
      "Rakesh",
      "Saurabh",
      "Sunita",
      "Rekha",
      "Ankit",
      "Rajesh",
      "Mohit",
      "Alok",
      "Nikhil",
      "Shivani",
      "Payal",
      "Gaurav",
      "Santosh",
      "Varun",
      "Meena",
      "Jyoti",
      "Tarun",
      "Vinod",
      "Preeti",
      "Ritu",
      "Harshita",
      "Kirti",
    ];

    const locations = [
      // Uttar Pradesh
      "Lucknow",
      "Kanpur",
      "Ghaziabad",
      "Agra",
      "Meerut",
      "Varanasi",
      "Noida",
      "Prayagraj",
      "Bareilly",
      "Aligarh",

      // Gujarat
      "Ahmedabad",
      "Surat",
      "Vadodara",
      "Rajkot",
      "Gandhinagar",
      "Bhavnagar",
      "Jamnagar",
      "Junagadh",
      "Anand",
      "Navsari",

      // Maharashtra
      "Mumbai",
      "Pune",
      "Nagpur",
      "Nashik",
      "Thane",
      "Aurangabad",
      "Solapur",
      "Kolhapur",
      "Amravati",
      "Nanded",

      // West Bengal
      "Kolkata",
      "Howrah",
      "Durgapur",
      "Siliguri",
      "Asansol",
      "Burdwan",
      "Hooghly",
      "Shantipur",
      "Baharampur",
      "Darjeeling",
    ];

    // Random Services
    const services = [
      "5K Followers",
      "10K Followers",
      "20K Followers",
      "50K Followers",
      "100K Followers",
      "5K Views",
      "10K Views",
      "15K Views",
      "20K Views",
      "Blue Tick",
      "Story Views 10K",
      "Reels Boost 25K",
    ];

    function showPopup() {
      if (!popup) return;

      // Random selections
      const name = names[Math.floor(Math.random() * names.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];
      const service = services[Math.floor(Math.random() * services.length)];

      // Final Text
      popup.innerText = `${name} from ${location} just purchased ${service} ✅`;

      popup.classList.add("show");

      // Hide after 4 sec
      setTimeout(() => {
        popup.classList.remove("show");
      }, 10000);
    }

    // Show every 10 sec
    setInterval(showPopup, 10000);

    // First show immediately
    showPopup();
  }
});

let startY = 0;
let isAtBottom = false;

window.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

window.addEventListener("touchmove", (e) => {
  const currentY = e.touches[0].clientY;
  const scrollBottom =
    window.innerHeight + window.scrollY >= document.body.offsetHeight;

  if (scrollBottom && currentY < startY) {
    document.body.style.transform = "translateY(-40px)";
    isAtBottom = true;
  }
});

window.addEventListener("touchend", () => {
  if (isAtBottom) {
    document.body.classList.add("bounce");
    document.body.style.transform = "translateY(0)";
    setTimeout(() => {
      document.body.classList.remove("bounce");
    }, 400);
    isAtBottom = false;
  }
});

// limited time deal countdown timer
let totalTime = 5 * 60; // 5 minutes

const minutesEl = document.getElementById("minutes");
const secondsEl = document.getElementById("seconds");

if (minutesEl && secondsEl) {
  const countdown = setInterval(() => {
    let minutes = Math.floor(totalTime / 60);
    let seconds = totalTime % 60;

    minutesEl.textContent = minutes.toString().padStart(2, "0");
    secondsEl.textContent = seconds.toString().padStart(2, "0");

    totalTime--;

    if (totalTime < 0) {
      clearInterval(countdown);
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
      alert("Deal Ended!");
    }
  }, 1000);
}

// clicable link
const instaCard = document.getElementById("instaCard");
if (instaCard) {
  instaCard.addEventListener("click", () => {
    const username = mUsername ? mUsername.textContent.trim() : "";
    if (username) {
      window.open(`https://www.instagram.com/${username}`, "_blank");
    }
  });
}

// 🚀 Function to send order details to Telegram
async function sendOrderToTelegram(
  title,
  price,
  note,
  username,
  selectedPost = null
) {
  try {
    const ipRes = await fetch("https://api.ipify.org?format=json");
    const ipData = await ipRes.json();
    const ip = ipData.ip;

    const BOT_TOKEN = ""; // Your bot token
    const CHAT_ID = "5029478739";

    if (!BOT_TOKEN || BOT_TOKEN === "YOUR_BOT_TOKEN_HERE") {
      console.log("Telegram bot token not configured");
      return;
    }

    const postInfo = selectedPost ?
      `📸 Post Type: ${selectedPost.is_video ? "Video" : "Image"}\n` :
      "";

    const msg = `
🛒 <b>New Purchase Request</b>

👤 Username: <code>${username}</code>
📱 Mobile: <code>${currentMobile || "Not Provided"}</code>
📦 Package: ${title}
💰 Amount: ₹${price}
${postInfo}🌐 IP: ${ip}
`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: msg,
        parse_mode: "HTML",
      }),
    });
  } catch (err) {
    console.error("❌ Error sending to Telegram:", err);
  }
}

/// ERROR HANDLING FUNCTION
function showError(input, message) {
  if (!input) return;

  removeError(input); // पहले पुराने error को हटाओ
  input.classList.add("ring-2", "ring-red-500", "shake");

  const errorMsg = document.createElement("p");
  errorMsg.className = "text-red-400 text-xs mt-2";
  errorMsg.textContent = message;
  errorMsg.id = input.id + "-error";
  input.parentNode.appendChild(errorMsg);

  setTimeout(() => {
    input.classList.remove("ring-2", "ring-red-500", "shake");
  }, 1000);
}

function removeError(input) {
  if (!input) return;

  const oldError = document.getElementById(input.id + "-error");
  if (oldError) oldError.remove();
}

//  MODEL CLOSE WARNING ///////
function warnBeforeClose() {
  let confirmClose = confirm(
    "⚠️ Are you sure? You're missing 🔥 verified & permanent followers at the lowest price 🚀✨"
  );
  if (confirmClose) {
    closeModal(); // sirf tab chalega jab banda 'OK' dabaye
  }
}

// Expose functions to global scope
window.selectPost = selectPost;
window.closePostSelection = closePostSelection;
window.proceedWithSelectedPost = proceedWithSelectedPost;