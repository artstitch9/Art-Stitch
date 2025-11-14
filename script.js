// =========================================
// =============== DATOS ===================
// =========================================
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


// =========================================
// =============== ELEMENTOS ===============
// =========================================
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOptions = document.getElementById('checkout-options');
const mpBtn = document.getElementById('mp-btn');
const transferBtn = document.getElementById('transfer-btn');
const transferInfo = document.getElementById('transfer-info');

const cartEl = document.getElementById('cart');
const cartBtn = document.querySelector('.cart-btn');
const menuBtn = document.querySelector('.menu-btn');
const menuOverlay = document.querySelector('.menu-overlay');

const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let cart = JSON.parse(localStorage.getItem('artstitch_cart') || '[]');
let currentImages = [];
let currentIndex = 0;


// =========================================
// =============== FUNCIONES ===============
// =========================================
function saveCart(){ localStorage.setItem('artstitch_cart', JSON.stringify(cart)); }
function formatMoney(n){ return Number(n).toLocaleString('es-AR'); }


// =========================================
// =============== MENÚ SPA ================
// =========================================
menuBtn.addEventListener('click', () => menuOverlay.classList.toggle('show'));

menuOverlay.addEventListener('click', e => {
  if(e.target === menuOverlay) menuOverlay.classList.remove('show');
});

// 💥 ESTA ES LA PARTE CLAVE QUE TE ARREGLA EL MAILTO
menuOverlay.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {

    // enlaces externos → dejarlos funcionar
    if (
      link.href.startsWith("mailto:") ||
      link.href.startsWith("https://") ||
      link.href.startsWith("http://") ||
      link.href.startsWith("tel:")
    ) {
      return; // NO BLOQUEAMOS
    }

    // enlaces internos → SPA
    e.preventDefault();
    const screen = link.dataset.screen;
    if (screen) {
      document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
      document.getElementById(`screen-${screen}`).classList.remove("hidden");
    }

    menuOverlay.classList.remove("show");
  });
});


// =========================================
// =============== CARRITO =================
// =========================================
cartBtn.addEventListener('click', ()=> cartEl.classList.toggle('hidden'));

function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else {
    const p = PRODUCTS.find(x=>x.id===id);
    cart.push({id:p.id, title:p.title, price:p.price, qty:1, img:p.images[0]});
  }
  saveCart();
  renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML='';
  
  if(cart.length===0){
    cartItemsEl.innerHTML='<p class="small">Tu carrito está vacío.</p>';
    cartTotalEl.textContent='0';
    return;
  }

  let total = 0;

  cart.forEach(ci=>{
    total += ci.price * ci.qty;

    const div = document.createElement('div');
    div.className='cart-item';

    div.innerHTML=`
      <img src="${ci.img}" onerror="this.src='placeholder-product.png'">
      <div style="flex:1">
        <div style="font-weight:600">${ci.title}</div>
        <div class="small">$${formatMoney(ci.price)} x ${ci.qty}</div>
      </div>
      <div class="qty">
        <button class="btn" onclick="changeQty('${ci.id}',-1)">-</button>
        <div style="min-width:20px;text-align:center">${ci.qty}</div>
        <button class="btn" onclick="changeQty('${ci.id}',1)">+</button>
      </div>
    `;

    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = formatMoney(total);
}

window.changeQty = function(id, delta){
  const it = cart.find(i=>i.id===id);
  if(!it) return;

  it.qty += delta;
  if(it.qty <= 0) cart = cart.filter(i=>i.id!==id);

  saveCart();
  renderCart();
};


// =========================================
// =============== CHECKOUT =================
// =========================================
checkoutBtn.addEventListener('click', ()=> {
  if(cart.length===0){
    alert('El carrito está vacío.');
    return;
  }
  checkoutOptions.classList.toggle('hidden');
});

mpBtn.addEventListener('click', ()=> window.open(MERCADO_PAGO_LINK,'_blank'));
transferBtn.addEventListener('click', ()=> transferInfo.classList.toggle('hidden'));


// =========================================
// ============ CARRUSEL DESTACADOS =========
// =========================================
function renderFeaturedCarousel(){
  const carouselEl = document.querySelector('#featured-carousel .carousel');
  const dotsEl = document.querySelector('#featured-carousel .carousel-dots');
  if(!carouselEl) return;

  carouselEl.innerHTML = '';
  dotsEl.innerHTML = '';

  FEATURED.forEach((f,i)=>{
    const img = document.createElement('img');
    img.src = f.img;
    img.alt = f.title;
    carouselEl.appendChild(img);

    const dot = document.createElement('span');
    if(i===0) dot.classList.add('active');

    dot.addEventListener('click', ()=> {
      carouselEl.scrollLeft = img.offsetLeft;
      updateDots(i);
    });

    dotsEl.appendChild(dot);
  });

  function updateDots(activeIndex){
    dotsEl.querySelectorAll('span')
      .forEach((d,i)=> d.classList.toggle('active', i===activeIndex));
  }

  carouselEl.addEventListener('scroll', ()=>{
    const index = Math.round(carouselEl.scrollLeft / carouselEl.offsetWidth);
    updateDots(index);
  });
}


// =========================================
// =============== PRODUCTOS ================
// =========================================
function renderCategoryProducts(){
  const categoryEl = document.getElementById('category-products');
  if(!categoryEl) return;

  categoryEl.innerHTML='';

  PRODUCTS.forEach(p=>{
    const card = document.createElement('article');
    card.className='card';

    card.innerHTML=`
      <div class="product-images">
        ${p.images.map(src=>`<img src="${src}" alt="${p.title}">`).join('')}
      </div>
      <h3>${p.title}</h3>
      <p class="small">${p.desc}</p>
      <div class="price">$${formatMoney(p.price)}</div>
      <button class="btn" onclick="addToCart('${p.id}')">Agregar al carrito</button>
    `;

    categoryEl.appendChild(card);
  });

  initLightbox();
}


// =========================================
// =============== LIGHTBOX =================
// =========================================
function initLightbox() {
  document.querySelectorAll('.product-images img').forEach((img)=>{
    img.addEventListener('click', ()=>{
      const card = img.closest('.card');
      const productTitle = card.querySelector('h3').textContent;

      const product = PRODUCTS.find(p => p.title === productTitle);
      if(!product) return;

      currentImages = product.images;

      const file = img.src.split('/').pop();
      currentIndex = currentImages.indexOf(file);
      if(currentIndex < 0) currentIndex = 0;

      openLightbox(currentImages[currentIndex]);
    });
  });
}

function openLightbox(src){
  lightboxImg.src = src;
  lightboxModal.classList.remove('hidden');
}

function closeLightbox(){
  lightboxModal.classList.add('hidden');
}

function showPrev(){
  if(currentImages.length === 0) return;
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
}

function showNext(){
  if(currentImages.length === 0) return;
  currentIndex = (currentIndex + 1) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
}

if(lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if(lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
if(lightboxNext) lightboxNext.addEventListener('click', showNext);

if(lightboxModal){
  lightboxModal.addEventListener('click', e=>{
    if(e.target === lightboxModal) closeLightbox();
  });
}


// =========================================
// =============== INIT =====================
// =========================================
renderFeaturedCarousel();
renderCategoryProducts();
renderCart();
