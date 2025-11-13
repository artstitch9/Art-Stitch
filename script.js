// ====== PRODUCTOS ======
const PRODUCTS = [
  {
    id: 'gorro-crudo',
    title: 'Gorro Mesh Hat de Red — crudo',
    price: 9000,
    images: ['product-crudo1.jpg', 'product-crudo2.jpg', 'product-crudo3.jpg'],
    desc: 'Tejido con hilo de algodón color crudo, talle unico.'
  },
  {
    id: 'gorro-negro',
    title: 'Gorro Mesh Hat de Red — negro',
    price: 9000,
    images: ['product-negro1.jpg', 'product-negro2.jpg'],
    desc: 'Tejido con hilo de algodón color negro, talle unico.'
  }
];

// ====== AJUSTES ======
let MERCADO_PAGO_LINK ="https://link.mercadopago.com.ar/artstitch";

// ====== ELEMENTOS ======
const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOptions = document.getElementById('checkout-options');
const mpBtn = document.getElementById('mp-btn');
const transferBtn = document.getElementById('transfer-btn');
const transferInfo = document.getElementById('transfer-info');

let cart = JSON.parse(localStorage.getItem('artstitch_cart') || '[]');

// ====== FUNCIONES ======
function saveCart(){
  localStorage.setItem('artstitch_cart', JSON.stringify(cart));
}

function formatMoney(n){ return Number(n).toLocaleString('es-AR'); }

function renderProducts() {
  productsEl.innerHTML = '';

  PRODUCTS.forEach(p => {
    const card = document.createElement('article');
    card.className = 'card';

    // Contenedor de imágenes
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('product-images');

    p.images.forEach(src => {
      const img = document.createElement('img');
      img.src = src;
      img.alt = p.title;
      img.onerror = function() { this.src = 'placeholder-product.png' };
      imgContainer.appendChild(img);
    });

    card.appendChild(imgContainer);

    const info = document.createElement('div');
    info.innerHTML = `
      <h3>${p.title}</h3>
      <p class="small">${p.desc}</p>
      <div class="price">$${formatMoney(p.price)}</div>
    `;
    card.appendChild(info);

    const add = document.createElement('button');
    add.className = 'btn';
    add.textContent = 'Agregar al carrito';
    add.onclick = ()=> addToCart(p.id);
    card.appendChild(add);

    productsEl.appendChild(card);
  });

  initLightbox(); // inicializar lightbox después de render
}

// ====== CARRITO ======
function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else {
    const p = PRODUCTS.find(x=>x.id===id);
    cart.push({ id: p.id, title: p.title, price: p.price, qty: 1, img: p.images[0] });
  }
  saveCart();
  renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML = '';
  if(cart.length === 0){
    cartItemsEl.innerHTML = '<p class="small">Tu carrito está vacío.</p>';
    cartTotalEl.textContent = '0';
    return;
  }
  let total = 0;
  cart.forEach(ci => {
    total += ci.price * ci.qty;
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${ci.img}" onerror="this.src='placeholder-product.png'">
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
  const it = cart.find(i=>i.id===id);
  if(!it) return;
  it.qty += delta;
  if(it.qty <= 0) cart = cart.filter(i=>i.id!==id);
  saveCart();
  renderCart();
}

// ====== CHECKOUT ======
checkoutBtn.addEventListener('click', ()=>{
  if(cart.length === 0){ alert('El carrito está vacío.'); return; }
  checkoutOptions.classList.toggle('hidden');
});

mpBtn.addEventListener('click', ()=>{
  if(!MERCADO_PAGO_LINK){
    alert('El link de Mercado Pago aún no está configurado.');
    return;
  }
  window.open(MERCADO_PAGO_LINK, '_blank');
});

transferBtn.addEventListener('click', ()=> transferInfo.classList.toggle('hidden'));

// ====== LIGHTBOX ======
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');

let currentImages = [];
let currentIndex = 0;

function initLightbox() {
  document.querySelectorAll('.product-images img').forEach((img, idx) => {
    img.addEventListener('click', () => {
      const card = img.closest('.card');
      const productId = card.querySelector('h3').textContent;
      const product = PRODUCTS.find(p => p.title === productId);

      currentImages = product.images;
      currentIndex = product.images.indexOf(img.src.split('/').pop());
      openLightbox(currentImages[currentIndex]);
    });
  });
}

function openLightbox(src){
  lightboxImg.src = src;
  lightboxModal.classList.add('active');
}

function closeLightbox(){
  lightboxModal.classList.remove('active');
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

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', showPrev);
lightboxNext.addEventListener('click', showNext);
lightboxModal.addEventListener('click', e => { if(e.target === lightboxModal) closeLightbox(); });

// ====== INIT ======
renderProducts();
renderCart();








