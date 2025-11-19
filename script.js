// ===============================
// FIX PARA CLICK EN CELULAR (no borrar)
// ===============================
document.addEventListener("touchstart", function(){}, true);

// ===============================
// MENU FIJO — PC + CEL sin parpadeo
// ===============================
const menuBtn = document.querySelector('.menu-btn');
const menuOverlay = document.querySelector('.menu-overlay');

if(menuBtn && menuOverlay){

  const toggleMenu = (e)=>{
    e.preventDefault();
    e.stopPropagation();
    menuOverlay.classList.toggle('show');
  };

  // PC
  menuBtn.addEventListener('click', toggleMenu);

  // CELULAR (Android + iPhone)
  menuBtn.addEventListener('touchend', toggleMenu);

  // No cerrar si tocan adentro
  menuOverlay.querySelector('ul').addEventListener('click', e => e.stopPropagation());
  menuOverlay.querySelector('ul').addEventListener('touchend', e => e.stopPropagation());

  // Cerrar tocando afuera
  document.addEventListener('click', (e)=>{
    if(!menuOverlay.contains(e.target) && e.target !== menuBtn){
      menuOverlay.classList.remove('show');
    }
  });

  document.addEventListener('touchend', (e)=>{
    if(!menuOverlay.contains(e.target) && e.target !== menuBtn){
      menuOverlay.classList.remove('show');
    }
  });
}

// ===============================
// SPA — Cambiar Pantallas
// ===============================
const screens = document.querySelectorAll('.screen');
const menuItems = document.querySelectorAll('.menu-overlay a');

function showScreen(name) {
  screens.forEach(s => s.classList.add('hidden'));
  document.getElementById(`screen-${name}`).classList.remove('hidden');
  menuOverlay.classList.remove('show');
}

menuItems.forEach(item => {
  item.addEventListener('pointerup', () => showScreen(item.dataset.screen));
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
// FUNCIONES UTILES
// ===============================
function saveCart(){ localStorage.setItem('artstitch_cart', JSON.stringify(cart)); }
function formatMoney(n){ return Number(n).toLocaleString('es-AR'); }

// ===============================
// CARRITO — PC + CEL SIN PARPADEO
// ===============================
if(cartBtn && cartEl){

  const toggleCart = (e)=>{
    e.stopPropagation();
    cartEl.classList.toggle('hidden');
  };

  cartBtn.addEventListener('pointerup', toggleCart);

  cartEl.addEventListener('pointerup', e => e.stopPropagation());

  document.addEventListener('pointerup', (e)=>{
    if(!cartEl.contains(e.target) && !cartBtn.contains(e.target)){
      cartEl.classList.add('hidden');
    }
  });
}

// ===============================
// AGREGAR AL CARRITO (abre carrito)
// ===============================
function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item) item.qty++;
  else {
    const p = PRODUCTS.find(x=>x.id===id);
    cart.push({id:p.id, title:p.title, price:p.price, qty:1, img:p.images[0]});
  }

  saveCart();
  renderCart();

  // Abrir carrito automáticamente en PC + CEL
  cartEl.classList.remove('hidden');
}

// ===============================
// RENDER DEL CARRITO
// ===============================
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

// ===============================
// ENVIAR COMPRA AL SERVIDOR (BREVO)
// ===============================
async function enviarCompraAlServidor(clienteEmail, shippingData, rememberShipping) {
  const body = {
    clienteEmail,
    items: cart,
    total: Number(cartTotalEl.textContent.replace(/\./g, "")),
    shippingData,
    rememberShipping
  };

  try {
    const res = await fetch("http://localhost:3000/api/compra", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    console.log("Respuesta del servidor:", data);

    if (data.ok) {
      alert("¡Compra procesada! Revisá tu email 💌");
    } else {
      alert("Hubo un problema enviando los mails.");
    }
  } catch (err) {
    console.error(err);
    alert("Error de conexión con el servidor.");
  }
}

// ===============================
// CHECKOUT
// ===============================
checkoutBtn.addEventListener('pointerup', ()=> {
  if(cart.length===0){ alert('El carrito está vacío.'); return; }
  checkoutOptions.classList.toggle('hidden');
});

mpBtn.addEventListener('pointerup', ()=> abrirModalEnvio("mp"));
transferBtn.addEventListener('pointerup', ()=> abrirModalEnvio("transfer"));

// ===============================
// CARRUSEL
// ===============================
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
    dot.addEventListener('pointerup', ()=> {
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

// ===============================
// PRODUCTOS
// ===============================
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

// ===============================
// LIGHTBOX
// ===============================
function initLightbox() {
  document.querySelectorAll('.product-images img').forEach((img)=>{
    img.addEventListener('pointerup', ()=>{
      const card = img.closest('.card');
      const productTitle = card.querySelector('h3').textContent;

      const product = PRODUCTS.find(p => p.title === productTitle);
      if(!product) return;

      currentImages = product.images;

      const filename = img.src.split('/').pop();
      currentIndex = currentImages.indexOf(filename);
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
  currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
}

function showNext(){
  currentIndex = (currentIndex + 1) % currentImages.length;
  lightboxImg.src = currentImages[currentIndex];
}

if(lightboxClose) lightboxClose.addEventListener('pointerup', closeLightbox);
if(lightboxPrev)  lightboxPrev.addEventListener('pointerup', showPrev);
if(lightboxNext)  lightboxNext.addEventListener('pointerup', showNext);

if(lightboxModal){
  lightboxModal.addEventListener('pointerup', e=>{
    if(e.target === lightboxModal) closeLightbox();
  });
}

// ===============================
// INIT
// ===============================
renderFeaturedCarousel();
renderCategoryProducts();
renderCart();

let token = localStorage.getItem("artstitch_token") || null;
let userName = localStorage.getItem("artstitch_user") || null;

let userData = null;

function updateAccountView() {
  const notLogged = document.getElementById("account-not-logged");
  const logged = document.getElementById("account-logged");
  const welcome = document.getElementById("welcome-user");

  if (token) {
    notLogged.style.display = "none";
    logged.style.display = "block";
    welcome.textContent = `Hola, ${userName} 💕`;
    cargarHistorial();
  } else {
    notLogged.style.display = "block";
    logged.style.display = "none";
  }
}

document.getElementById("btn-register").addEventListener("pointerup", async () => {
  const name = document.getElementById("reg-name").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const pass = document.getElementById("reg-pass").value.trim();
  const address = document.getElementById("reg-address").value.trim();
  const localidad = document.getElementById("reg-localidad").value.trim();
  const provincia = document.getElementById("reg-provincia").value.trim();
  const pais = document.getElementById("reg-pais").value.trim();
  const cp = document.getElementById("reg-cp").value.trim();

  if (!email || !pass) return alert("Completá email y contraseña.");

  const body = {
    name,
    phone,
    email,
    password: pass,
    address,
    localidad,
    provincia,
    pais,
    cp
  };

  const res = await fetch("http://localhost:3000/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  userData = data; 

  if (!data.ok) return alert(data.msg || "Error en registro.");

  alert("Cuenta creada con éxito 💖 Ahora iniciá sesión.");
});

document.getElementById("btn-login").addEventListener("pointerup", async () => {
  const email = document.getElementById("login-email").value.trim();
  const pass = document.getElementById("login-pass").value.trim();

  const res = await fetch("http://localhost:3000/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pass })
  });

  const data = await res.json();

  if (!data.ok) return alert(data.msg || "Error al iniciar sesión.");

  token = data.token;
  userName = data.name;

  userData = data.user || null;

  localStorage.setItem("artstitch_token", token);
  localStorage.setItem("artstitch_user", userName);

  alert("Sesión iniciada 💕");

  updateAccountView();
});

document.getElementById("btn-logout").addEventListener("pointerup", () => {
  localStorage.removeItem("artstitch_token");
  localStorage.removeItem("artstitch_user");
  token = null;
  userName = null;
  updateAccountView();
});

async function cargarHistorial() {
  if (!token) return;

  const res = await fetch("http://localhost:3000/api/usuario", {
    headers: { "Authorization": "Bearer " + token }
  });

  const data = await res.json();
  const historyEl = document.getElementById("purchase-history");

  if (!data.ok || data.compras.length === 0) {
    historyEl.innerHTML = "<p>No tenés compras todavía 💖</p>";
    return;
  }

  historyEl.innerHTML = data.compras.map(c => `
    <div style='margin-bottom:12px; padding:10px; border:1px solid #e8d4ce; border-radius:8px; background:white;'>
      <strong>Fecha:</strong> ${new Date(c.fecha).toLocaleString()}<br>
      <strong>Total:</strong> $${c.total}<br>
      <strong>Items:</strong>
      <ul>
        ${c.items.map(i => `<li>${i.title} x${i.qty}</li>`).join("")}
      </ul>
    </div>
  `).join("");
}

// ===============================
// MODAL DE ENVÍO
// ===============================
const modal = document.getElementById("shipping-modal");
const closeModal = document.querySelector(".shipping-close");

function abrirModalEnvio(tipoPago){

  modal.dataset.metodo = tipoPago;  
  modal.classList.remove("hidden");

  // Autocompletar si hay usuario logueado con datos guardados
  if (userData) {
    document.getElementById("ship-name").value      = userData.name || "";
    document.getElementById("ship-phone").value     = userData.phone || "";
    document.getElementById("ship-address").value   = userData.address || "";
    document.getElementById("ship-localidad").value = userData.localidad || "";
    document.getElementById("ship-provincia").value = userData.provincia || "";
    document.getElementById("ship-pais").value      = userData.pais || "";
    document.getElementById("ship-cp").value        = userData.cp || "";
  }
}

closeModal.addEventListener("pointerup", ()=> {
  modal.classList.add("hidden");
});

document.getElementById("shipping-confirm").addEventListener("pointerup", ()=> {

  const shippingData = {
    name: document.getElementById("ship-name").value.trim(),
    phone: document.getElementById("ship-phone").value.trim(),
    address: document.getElementById("ship-address").value.trim(),
    localidad: document.getElementById("ship-localidad").value.trim(),
    provincia: document.getElementById("ship-provincia").value.trim(),
    pais: document.getElementById("ship-pais").value.trim(),
    cp: document.getElementById("ship-cp").value.trim(),
  };

  const rememberShipping = document.getElementById("ship-remember").checked;

  // pedir email
  const emailCliente = prompt("Ingresá tu email para confirmar la compra:");
  if(!emailCliente) return;

  enviarCompraAlServidor(emailCliente, shippingData, rememberShipping);

  // cerrar modal
  modal.classList.add("hidden");

  // si el pago es por mp -> redirigir a MP
  if(modal.dataset.metodo === "mp"){
    window.open(MERCADO_PAGO_LINK,"_blank");
  }
});

updateAccountView();





