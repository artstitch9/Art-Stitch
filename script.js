// ====== PRODUCTOS ======
const PRODUCTS = [
  {id:'gorro-crudo',title:'Gorro Mesh Hat de Red — crudo',price:9000,images:['product-crudo1.jpg','product-crudo2.jpg','product-crudo3.jpg'],desc:'Tejido con hilo de algodón color crudo, talle unico.'},
  {id:'gorro-negro',title:'Gorro Mesh Hat de Red — negro',price:9000,images:['product-negro1.jpg','product-negro2.jpg'],desc:'Tejido con hilo de algodón color negro, talle unico.'}
];

let MERCADO_PAGO_LINK ="https://link.mercadopago.com.ar/artstitch";

const productsEl = document.getElementById('products');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const checkoutOptions = document.getElementById('checkout-options');
const mpBtn = document.getElementById('mp-btn');
const transferBtn = document.getElementById('transfer-btn');
const transferInfo = document.getElementById('transfer-info');
const cartBtn = document.getElementById('cart-btn');
const cartEl = document.getElementById('cart');

let cart = JSON.parse(localStorage.getItem('artstitch_cart') || '[]');

function saveCart(){ localStorage.setItem('artstitch_cart',JSON.stringify(cart)); }
function formatMoney(n){ return Number(n).toLocaleString('es-AR'); }

// ====== CARRUSEL DESTACADOS ======
const featuredCarousel = document.querySelector('#featured-carousel .carousel');
const featuredDots = document.querySelector('#featured-carousel .carousel-dots');

function initFeatured(){
  PRODUCTS.forEach((p,i)=>{
    const img = document.createElement('img');
    img.src = p.images[0];
    img.alt = p.title;
    featuredCarousel.appendChild(img);

    const dot = document.createElement('span');
    if(i===0) dot.classList.add('active');
    dot.addEventListener('click',()=>{ featuredCarousel.scrollTo({left:i*featuredCarousel.offsetWidth,behavior:'smooth'}); updateDots(i,featuredDots); });
    featuredDots.appendChild(dot);
  });
}

function updateDots(index,container){
  container.querySelectorAll('span').forEach((s,i)=>s.classList.toggle('active',i===index));
}

// ====== RENDER PRODUCTOS ======
function renderProducts(){
  productsEl.innerHTML='';
  PRODUCTS.forEach(p=>{
    const card=document.createElement('article'); card.className='card';

    const img=document.createElement('img'); img.src=p.images[0]; card.appendChild(img);
    const title=document.createElement('h3'); title.textContent=p.title; title.onclick=()=>openDetail(p.id); card.appendChild(title);

    const info=document.createElement('p'); info.textContent=p.desc; card.appendChild(info);
    const price=document.createElement('div'); price.className='price'; price.textContent='$'+formatMoney(p.price); card.appendChild(price);

    const add=document.createElement('button'); add.className='btn'; add.textContent='Agregar al carrito'; add.onclick=()=>addToCart(p.id); card.appendChild(add);

    productsEl.appendChild(card);
  });
}

// ====== DETALLE PRODUCTO ======
const detailSection=document.getElementById('product-detail');
const closeDetailBtn=document.getElementById('close-detail');
const detailTitle=document.getElementById('detail-title');
const detailCarousel=document.getElementById('detail-carousel');
const detailDots=document.getElementById('detail-dots');
const detailPrice=document.getElementById('detail-price');
const detailDesc=document.getElementById('detail-desc');

function openDetail(id){
  const p = PRODUCTS.find(x=>x.id===id);
  detailTitle.textContent=p.title;
  detailPrice.textContent='$'+formatMoney(p.price);
  detailDesc.textContent=p.desc;

  detailCarousel.innerHTML='';
  detailDots.innerHTML='';
  p.images.forEach((src,i)=>{
    const img=document.createElement('img'); img.src=src; detailCarousel.appendChild(img);
    const dot=document.createElement('span'); if(i===0) dot.classList.add('active'); dot.onclick=()=>{ detailCarousel.scrollTo({left:i*detailCarousel.offsetWidth,behavior:'smooth'}); updateDots(i,detailDots); }; detailDots.appendChild(dot);
  });

  detailSection.classList.remove('hidden');
}

closeDetailBtn.onclick=()=>detailSection.classList.add('hidden');

// ====== CARRITO ======
function addToCart(id){
  const item = cart.find(i=>i.id===id);
  if(item)item.qty++; else{ const p=PRODUCTS.find(x=>x.id===id); cart.push({id:p.id,title:p.title,price:p.price,qty:1,img:p.images[0]}); }
  saveCart(); renderCart();
}

function renderCart(){
  cartItemsEl.innerHTML='';
  if(cart.length===0){ cartItemsEl.innerHTML='<p class="small">Tu carrito está vacío.</p>'; cartTotalEl.textContent='0'; return; }
  let total=0;
  cart.forEach(ci=>{ total+=ci.price*ci.qty;
    const div=document.createElement('div'); div.className='cart-item';
    div.innerHTML=`<img src="${ci.img}"><div style="flex:1"><div style="font-weight:600">${ci.title}</div><div class="small">$${formatMoney(ci.price)} x ${ci.qty}</div></div><div class="qty"><button onclick="changeQty('${ci.id}',-1)">-</button><div style="min-width:20px;text-align:center">${ci.qty}</div><button onclick="changeQty('${ci.id}',1)">+</button></div>`;
    cartItemsEl.appendChild(div);
  });
  cartTotalEl.textContent=formatMoney(total);
}

window.changeQty=function(id,delta){ const it=cart.find(i=>i.id===id); if(!it) return; it.qty+=delta; if(it.qty<=0) cart=cart.filter(i=>i.id!==id); saveCart(); renderCart(); }

// CHECKOUT
checkoutBtn.addEventListener('click',()=>{ if(cart.length===0){ alert('El carrito está vacío'); return; } checkoutOptions.classList.toggle('hidden'); });
mpBtn.addEventListener('click',()=>{ if(!MERCADO_PAGO_LINK){ alert('Link Mercado Pago no configurado'); return; } window.open(MERCADO_PAGO_LINK,'_blank'); });
transferBtn.addEventListener('click',()=>transferInfo.classList.toggle('hidden'));

// CARRITO FLOTANTE
cartBtn.addEventListener('click',()=>cartEl.classList.toggle('hidden'));

// MENU HAMBURGUESA
const menuBtn=document.getElementById('menu-btn'); const menuOverlay=document.getElementById('menu-overlay');
menuBtn.onclick=()=>menuOverlay.classList.toggle('hidden');

// INIT
initFeatured();
renderProducts();
renderCart();
