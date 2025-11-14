// ===============================
// FIX TOUCH PARA CELULAR
// ===============================
document.addEventListener("touchstart", function(){}, true);

// ===============================
// MENU (PC + CEL sin parpadeo)
// ===============================
const menuBtn = document.querySelector('.menu-btn');
const menuOverlay = document.querySelector('.menu-overlay');

if(menuBtn && menuOverlay){
  
  const toggleMenu = (e)=>{
    e.stopPropagation();
    menuOverlay.classList.toggle('show');
  };

  // Abrir menú
  menuBtn.addEventListener('click', toggleMenu);
  menuBtn.addEventListener('touchend', toggleMenu);

  // Evitar cierre si tocamos dentro
  menuOverlay.querySelector('ul').addEventListener('click', e => e.stopPropagation());

  // Cerrar tocando afuera
  document.addEventListener('click', ()=>{
    menuOverlay.classList.remove('show');
  });

  document.addEventListener('touchend', ()=>{
    menuOverlay.classList.remove('show');
  });
}

// ===============================
// SPA — Cambiar pantallas
// ===============================
const screens = document.querySelectorAll('.screen');
const menuItems = document.querySelectorAll('.menu-overlay a');

function showScreen(name) {
  screens.forEach(s => s.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
  menuOverlay.classList.remove('show');
}

menuItems.forEach(item => {
  item.addEventListener('click', () => showScreen(item.dataset.screen));
});

// ===============================
// DATOS
// ===============================
const PRODUCTS = [
  {
    id: 'gorro-crudo',
    title: 'Gorro Mesh Hat de Red — crudo',
    price: 9000,
    images: ['product-crudo1.jpg','product-crudo2.jpg','product-crudo3.jpg'],
    desc: 'Tejido con hilo de algodón color crudo, talle único.'
  },
  {
    id: 'gorro-negro',
    title: 'Gorro Mesh Hat de Red — negro',
    price: 9000,
    images: ['product-negro1.jpg','product-negro2.jpg'],
    desc: 'Tejido con hilo de algodón color negro, talle único.'
  }
];

const FEATURED = [
  { img: 'destacado1.jpg', title: 'Destacado 1' },
  { img: 'destacado2.jpg', title: 'Destacado 2' },
  { img: 'destacado3.jpg', title: 'Destacado 3' }
];

let MERCADO_PAGO_LINK = "https://link.mercadopago.com.ar/artstitch";

// ===============================
// ELEMENTOS
// ===============================
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOptions = document.getElementById('checkout-options');
const mpBtn = document.getElementById('mp-btn');
const transferBtn = document.getElementById('transfer-btn');
const transferInfo = document.getElementById('transfer-info');

const cartEl = document.getElementById('cart');
const cartBtn = document.querySelector('.cart-btn');

const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let cart = JSON.parse(localStorage.getItem('artstitch_cart') || '[]');
let currentImages = [];
let currentIndex = 0;

// ===============================
// UTILS
// ===============================
function saveCart(){ localStorage.setItem('artstitch_cart', JSON.stringify(cart)); }
function formatMoney(n){ return Number(n).toLocaleString('es-AR'); }

// ===============================
// CARRITO (PC + CEL sin parpadeo)
// ===============================
if(cartBtn && cartEl){

  const openCart = ()=>{
    cartEl.classList.remove('hidden');
  };

  const toggleCart = (e)=>{
    e.stopPropagation();
    cartEl.classList.toggle('hidden');
  };

  cartBtn.addEventListener('click', toggleCart);
  cartBtn.addEventListener('touchend', toggleCart);

  cartEl.addEventListener('click', e => e.stopPropagation());
  cartEl.addEventListener('touchend', e => e.stopPropagation());

  document.addEventListener('click', (e)=>{
    if(!cartEl.contains(e.target) && !cartBtn.contains(e.target)){
      cartEl.classList.add('hidden');
    }
  });

  document.addEventListener('touchend', (e)=>{
    if(!cartEl.contains(e.target) && !cartBtn.contains(e.target)){
      cartEl.classList.add('hidden');
    }
  });

  // Para usar desde addToCart()
  window.openCart = openCart;
}

// ===============================
// AGREGAR AL CARRITO — Autoabrir PC + CEL
// ===============================
function addToCart(id){

  const existing = cart.find(i=>i.id === id);
  if(existing) existing.qty++;
  else {
    const p = PRODUCTS.find(x => x.id === id);
    cart.push({id:p.id, title:p.title, price:p.price, qty:1, img:p.images[0]});
  }

  saveCart();
  renderCart();
  openCart();  // ← SIEMPRE abre en PC + CEL
}

// ===============================
// RENDER CARRITO
// ===============================
function renderCart(){
  cartItemsEl.innerHTML = '';

  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p class="small">Tu carrito está vacío.</p>';
    cartTotalEl.textContent = '0';
    return;
  }

  let total = 0;

  cart.forEach(ci=>{
    total += ci.price * ci.qty;

    const div = document.createElement('div');
    div.className = 'cart-item';

    div.innerHTML = `
      <img src="${ci.img}">
      <div style="flex:1">
        <div style="font-weight:600">${ci.title}</div>
        <div class="small">$${formatMoney(ci.price)} x ${ci.qty}</div>
      </div>
      <div class="qty">
        <button class="btn" onclick="changeQty('${ci.id}', -1)">-</button>
        <div style="min-width:20px;text-align:center">${ci.qty}</div>
        <button class="btn" onclick="changeQty('${ci.id}', 1)">+</button>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = formatMoney(total);
}

window.changeQty = function(id, delta){
  const it = cart.find(i=>i.id === id);
  if(!it) return;

  it.qty += delta;
  if(it.qty <= 0){
    cart = cart.filter(i=>i.id !== id);
  }

  saveCart();
  renderCart();
};

// ===============================
// CHECKOUT
// ===============================
checkoutBtn.addEventListener('click', ()=>{
  if(cart.length===0){
    alert('El carrito está vacío.');
    return;
  }
  checkoutOptions.classList.toggle('hidden');
});

mpBtn.addEventListener('click', ()=> window.open(MERCADO_PAGO_LINK,'_blank'));
transferBtn.addEventListener('click', ()=> transferInfo.classList.toggle('hidden'));

// ===============================
// CARRUSEL
// ===============================
function renderFeaturedCarousel(){
  const carouselEl = document.querySelector('#featured-carousel .carousel');
  const dotsEl = document.querySelector('#featured-carousel .carousel-dots');
  if(!carouselEl) return;

  carouselEl.innerHTML='';
  dotsEl.innerHTML='';

  FEATURED.forEach((f,i)=>{
    const img = document.createElement('img');
    img.src = f.img;
    img.alt = f.title;
    carouselEl.appendChild(img);

    const dot = document.createElement('span');
    if(i===0) dot.classList.add('active');
    dot.addEventListener('click', ()=>{
      carouselEl.scrollLeft = img.offsetLeft;
      updateDots(i);
    });
    dotsEl.appendChild(dot);
  });

  function updateDots(active){
    dotsEl.querySelectorAll('span')
      .forEach((d,i)=> d.classList.toggle('active', i===active));
  }
}

// ===============================
// PRODUCTOS
// ===============================
function renderCategoryProducts(){
  const category = document.getElementById('category-products');
  if(!category) return;

  category.innerHTML='';

  PRODUCTS.forEach(p=>{
    const card = document.createElement('article');
    card.className='card';

    card.innerHTML = `
      <div class="product-images">
        ${p.images.map(src => `<img src="${src}" alt="${p.title}">`).join('')}
      </div>
      <h3>${p.title}</h3>
      <p class="small">${p.desc}</p>
      <div class="price">$${formatMoney(p.price)}</div>
      <button class="btn" onclick="addToCart('${p.id}')">Agregar al carrito</button>
    `;

    category.appendChild(card);
  });

  initLightbox();
}

// ===============================
// LIGHTBOX
// ===============================
function initLightbox(){
  document.querySelectorAll('.product-images img').forEach(img=>{
    img.addEventListener('click', ()=>{
      const card = img.closest('.card');
      const title = card.querySelector('h3').textContent;
      const product = PRODUCTS.find(p=>p.title === title);

      currentImages = product.images;
      currentIndex = currentImages.indexOf(img.src.split('/').pop());
      if(currentIndex < 0) currentIndex=0;

      lightboxImg.src = currentImages[currentIndex];
      lightboxModal.classList.remove('hidden');
    });
  });
}

lightboxClose.addEventListener('click', ()=> lightboxModal.classList.add('hidden'));
lightboxPrev.addEventListener('click', ()=>{
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
});
lightboxNext.addEventListener('click', ()=>{
  currentIndex = (currentIndex + 1) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
});

lightboxModal.addEventListener('click', e=>{
  if(e.target === lightboxModal) lightboxModal.classList.add('hidden');
});

// ===============================
// INIT
// ===============================
renderFeaturedCarousel();
renderCategoryProducts();
renderCart();
