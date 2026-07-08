document.addEventListener('DOMContentLoaded', () => {
  // Contact Form
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast('Thank you for your message! We will get back to you soon!', 'fa-circle-check');
      contactForm.reset();
    });
  }

  // Product Gallery
  const thumbItems = document.querySelectorAll('.sp-thumb-item');
  const mediaItems = document.querySelectorAll('.sp-media-item');
  if (thumbItems.length > 0) {
    thumbItems.forEach((thumb, index) => {
      thumb.addEventListener('click', () => {
        // Update active state
        thumbItems.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        mediaItems.forEach(m => m.classList.remove('active'));
        mediaItems[index].classList.add('active');
      });
    });
  }

  // Variant Selection
  window.selectedOptions = [];
  window.variants = [];

  // Load variant data
  const variantJsonEl = document.getElementById('spVariantJson');
  if (variantJsonEl) {
    try {
      window.variants = JSON.parse(variantJsonEl.textContent);
    } catch (e) {
      console.error('Error parsing variant JSON', e);
    }
  }

  // Initialize selected options
  const optionSelectors = document.querySelectorAll('[data-option]');
  if (optionSelectors.length > 0) {
    optionSelectors.forEach((selector, idx) => {
      const buttons = selector.querySelectorAll('.sp-variant-btn');
      if (buttons.length > 0) {
        window.selectedOptions[idx] = buttons[0].getAttribute('data-value');
      }
    });
  }

  // Quantity Controls
  const qtyMinus = document.getElementById('spQtyMinus');
  const qtyPlus = document.getElementById('spQtyPlus');
  const qtyInput = document.getElementById('spQtyInput');
  if (qtyMinus && qtyPlus && qtyInput) {
    qtyMinus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      if (val > 1) qtyInput.value = val - 1;
    });
    qtyPlus.addEventListener('click', () => {
      let val = parseInt(qtyInput.value);
      qtyInput.value = val + 1;
    });
  }

  // Pincode Check
  const pinCheckBtn = document.getElementById('spPinCheckBtn');
  const pinInput = document.getElementById('spPinInput');
  const pinResult = document.getElementById('spPinResult');
  if (pinCheckBtn && pinInput && pinResult) {
    pinCheckBtn.addEventListener('click', () => {
      const pin = pinInput.value.trim();
      if (pin.length >= 4 && !isNaN(pin)) {
        pinResult.classList.add('show');
        showToast('Delivery available to ' + pin, 'fa-circle-check');
      } else {
        showToast('Please enter a valid pincode', 'fa-exclamation-circle');
      }
    });
  }

  // Tabs
  const tabButtons = document.querySelectorAll('.sp-tab-btn');
  const tabPanels = document.querySelectorAll('.sp-tab-panel');
  if (tabButtons.length > 0 && tabPanels.length > 0) {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        // Update active states
        tabButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        tabPanels.forEach(panel => panel.classList.remove('active'));
        document.getElementById('spTab-' + targetTab).classList.add('active');

        // Animate bars when nutrition or reviews tab is shown
        if (targetTab === 'nutrition') {
          animateNutritionBars();
        }
        if (targetTab === 'reviews') {
          animateReviewBars();
        }
      });
    });

    // Animate review bars on load if reviews tab is active
    const activeReviewPanel = document.getElementById('spTab-reviews');
    if (activeReviewPanel && activeReviewPanel.classList.contains('active')) {
      animateReviewBars();
    }
  }

  // Wishlist
  const wishlistBtn = document.getElementById('spWishlistBtn');
  if (wishlistBtn) {
    wishlistBtn.addEventListener('click', () => {
      const icon = wishlistBtn.querySelector('i');
      if (icon.classList.contains('fa-regular')) {
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        wishlistBtn.style.backgroundColor = 'rgba(185, 119, 52, 0.08)';
        showToast('Added to wishlist!', 'fa-heart');
      } else {
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        wishlistBtn.style.backgroundColor = 'transparent';
        showToast('Removed from wishlist', 'fa-heart-crack');
      }
    });
  }

  // Buy Now
  const buyNowBtn = document.getElementById('spBuyNowBtn');
  const addToCartBtn = document.getElementById('spAddToCartBtn');
  if (buyNowBtn && addToCartBtn) {
    buyNowBtn.addEventListener('click', () => {
      if (addToCartBtn.closest('form')) {
        const form = addToCartBtn.closest('form');
        const buyNowInput = document.createElement('input');
        buyNowInput.type = 'hidden';
        buyNowInput.name = 'buy_now';
        buyNowInput.value = '1';
        form.appendChild(buyNowInput);
        form.submit();
      }
    });
  }

  // Helpful Review Buttons
  const helpfulBtns = document.querySelectorAll('.sp-helpful-btn');
  helpfulBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('Thanks for your feedback!', 'fa-thumbs-up');
    });
  });

  // Animate nutrition bars on load
  animateNutritionBars();
  animateReviewBars();
});

// Find matching variant based on selected options
function findMatchingVariant(options, variantsArray) {
  for (let i = 0; i < variantsArray.length; i++) {
    const variant = variantsArray[i];
    let match = true;
    for (let j = 0; j < options.length; j++) {
      if (variant.options[j] !== options[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      return variant;
    }
  }
  return null;
}

// Update price and variant ID
function updateProductDisplay(variant) {
  const variantIdInput = document.getElementById('spVariantId');
  const addToCartBtn = document.getElementById('spAddToCartBtn');
  const buyNowBtn = document.getElementById('spBuyNowBtn');
  const inStockBadge = document.querySelector('.sp-in-stock-badge');

  if (variantIdInput && variant) {
    variantIdInput.value = variant.id;
  }

  if (addToCartBtn && buyNowBtn && variant) {
    if (variant.available) {
      addToCartBtn.disabled = false;
      buyNowBtn.disabled = false;
    } else {
      addToCartBtn.disabled = true;
      buyNowBtn.disabled = true;
    }
  }

  if (inStockBadge && variant) {
    if (variant.available) {
      inStockBadge.textContent = 'In stock';
      inStockBadge.style.color = 'var(--sp-success)';
    } else {
      inStockBadge.textContent = 'Out of stock';
      inStockBadge.style.color = '#d32f2f';
    }
  }
}

// Animate Nutrition Bars
function animateNutritionBars() {
  const bars = document.querySelectorAll('.sp-nutri-bar-fill');
  bars.forEach((bar, index) => {
    const width = bar.getAttribute('data-width');
    bar.style.width = '0%';
    setTimeout(() => {
      bar.style.transition = 'width 0.8s ease-out';
      bar.style.width = width;
    }, index * 100);
  });
}

// Animate Review Bars
function animateReviewBars() {
  const bars = document.querySelectorAll('.sp-mini-fill');
  bars.forEach((bar, index) => {
    const width = bar.getAttribute('data-width');
    if (width) {
      bar.style.width = '0%';
      setTimeout(() => {
        bar.style.transition = 'width 0.6s ease-out';
        bar.style.width = width;
      }, index * 100);
    }
  });
}

function selectVariantOption(button, optionIndex, value) {
  // Update button state
  const container = button.closest('[data-option]');
  if (container) {
    container.querySelectorAll('.sp-variant-btn').forEach(b => b.classList.remove('active'));
    button.classList.add('active');
  }

  // Update selected options array
  if (typeof window.selectedOptions === 'undefined') {
    window.selectedOptions = [];
  }
  window.selectedOptions[optionIndex] = value;

  // Find the matching variant and update display
  if (typeof window.variants !== 'undefined' && window.variants.length > 0) {
    const matchingVariant = findMatchingVariant(window.selectedOptions, window.variants);
    if (matchingVariant) {
      updateProductDisplay(matchingVariant);
    }
  }
}

function showToast(message, icon = 'fa-circle-check') {
  const existingToastContainer = document.getElementById('spToastContainer');
  let toastContainer;

  if (!existingToastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'spToastContainer';
    toastContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    `;
    document.body.appendChild(toastContainer);
  } else {
    toastContainer = existingToastContainer;
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    background: #fff;
    border: 1px solid #EDD9BC;
    border-radius: 16px;
    padding: 14px 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    box-shadow: 0 8px 32px rgba(185, 119, 52, 0.15);
    animation: spSlideIn 0.3s ease-out;
  `;
  toast.innerHTML = `
    <i class="fa-solid ${icon}" style="color: #2E7D32; font-size: 18px;"></i>
    <span style="color: #2B1B0F; font-family: var(--font-body-family); font-size: 14px; font-weight: 500;">${message}</span>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'spSlideOut 0.3s ease-out forwards';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
      if (toastContainer.children.length === 0) {
        toastContainer.parentNode.removeChild(toastContainer);
      }
    }, 300);
  }, 3000);
}

const spToastStyle = document.createElement('style');
spToastStyle.textContent = `
  @keyframes spSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes spSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(spToastStyle);
