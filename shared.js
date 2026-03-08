const cards = document.querySelectorAll('.card');

if (cards.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal');
      }
    });
  }, { threshold: 0.14 });

  cards.forEach((card, index) => {
    card.style.transitionDelay = (index % 4) * 70 + 'ms';
    observer.observe(card);
  });
}

const CART_STORAGE_KEY = 'tide-goclean-cart-v1';

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (_error) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

function setupCart() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) {
    return;
  }

  let cart = loadCart();

  const cartTrigger = document.createElement('button');
  cartTrigger.type = 'button';
  cartTrigger.className = 'nav-cart-button';
  cartTrigger.setAttribute('aria-label', 'Open shopping cart');
  cartTrigger.innerHTML = 'Cart <span class="cart-count">0</span>';
  navLinks.appendChild(cartTrigger);

  const cartRoot = document.createElement('div');
  cartRoot.className = 'cart-root';
  cartRoot.innerHTML = `
    <div class="cart-overlay" hidden></div>
    <aside class="cart-drawer" aria-hidden="true" aria-label="Shopping cart">
      <header class="cart-head">
        <h3>Your Cart</h3>
        <button type="button" class="cart-close" aria-label="Close cart">x</button>
      </header>
      <div class="cart-items"></div>
      <footer class="cart-foot">
        <p class="cart-total">Total: $0.00</p>
        <div class="cart-actions">
          <button type="button" class="btn cart-clear">Clear</button>
          <button type="button" class="btn primary cart-checkout">Checkout</button>
        </div>
      </footer>
    </aside>
  `;
  document.body.appendChild(cartRoot);

  const overlay = cartRoot.querySelector('.cart-overlay');
  const drawer = cartRoot.querySelector('.cart-drawer');
  const itemsHost = cartRoot.querySelector('.cart-items');
  const totalLabel = cartRoot.querySelector('.cart-total');
  const closeBtn = cartRoot.querySelector('.cart-close');
  const clearBtn = cartRoot.querySelector('.cart-clear');
  const checkoutBtn = cartRoot.querySelector('.cart-checkout');
  const countBadge = cartTrigger.querySelector('.cart-count');

  function openCart() {
    overlay.hidden = false;
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeCart() {
    overlay.hidden = true;
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    countBadge.textContent = String(count);
  }

  function renderCart() {
    if (!cart.length) {
      itemsHost.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
      totalLabel.textContent = 'Total: $0.00';
      updateCartCount();
      return;
    }

    let total = 0;
    const rows = cart.map((item) => {
      const lineTotal = item.price * item.quantity;
      total += lineTotal;
      return `
        <article class="cart-item">
          <div>
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)} x ${item.quantity}</p>
          </div>
          <button type="button" class="cart-remove" data-id="${item.id}" aria-label="Remove ${item.name}">Remove</button>
        </article>
      `;
    });

    itemsHost.innerHTML = rows.join('');
    totalLabel.textContent = `Total: ${formatPrice(total)}`;
    updateCartCount();

    itemsHost.querySelectorAll('.cart-remove').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        cart = cart.filter((item) => item.id !== id);
        saveCart(cart);
        renderCart();
      });
    });
  }

  function addItem(name, price) {
    const id = `${name}-${price}`;
    const existing = cart.find((item) => item.id === id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id, name, price, quantity: 1 });
    }

    saveCart(cart);
    renderCart();
    openCart();
  }

  cartTrigger.addEventListener('click', openCart);
  overlay.addEventListener('click', closeCart);
  closeBtn.addEventListener('click', closeCart);

  clearBtn.addEventListener('click', () => {
    cart = [];
    saveCart(cart);
    renderCart();
  });

  checkoutBtn.addEventListener('click', () => {
    if (!cart.length) {
      return;
    }
    alert('Checkout demo: your cart has been saved.');
  });

  document.querySelectorAll('[data-add-to-cart]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const name = button.getAttribute('data-name') || 'GoClean Item';
      const price = Number(button.getAttribute('data-price') || '0');
      addItem(name, price);
    });
  });

  renderCart();
}

setupCart();
