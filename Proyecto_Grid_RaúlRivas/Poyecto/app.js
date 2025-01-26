// Base URL de la API
const BASE_URL = "https://api.escuelajs.co/api/v1";

// Elementos DOM
const container = document.getElementById("products");
const categorySelect = document.getElementById("categories");
const loadingIndicator = document.getElementById("loading");
const loadMoreButton = document.getElementById("loadMore");
const cartModal = document.getElementById("cartModal");
const cartItemsContainer = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartTotal = document.getElementById("cartTotal");
const viewCartButton = document.getElementById("viewCart");
const closeCartButton = document.getElementById("closeCart");
const checkoutButton = document.getElementById("checkout");
const authModal = document.getElementById("authModal");
const authForm = document.getElementById("authForm");
const closeAuthButton = document.getElementById("closeAuth");
const loginButton = document.getElementById("loginButton");
const registerButton = document.getElementById("registerButton");
const adminPanel = document.getElementById("adminPanel");
const adminPanelButton = document.getElementById("adminPanelButton");
const closeAdminPanelButton = document.getElementById("closeAdminPanel");
const addProductButton = document.getElementById("addProduct");
const userManagementContainer = document.getElementById("userManagement");
const productManagementContainer = document.getElementById("productManagement");
const searchInput = document.getElementById("searchInput"); // Search input element

// Variables
let currentCategory = null;
let offset = 0;
const limit = 10;
let isLoading = false;
let cart = JSON.parse(localStorage.getItem("cart")) || {}; 
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null; 
let infiniteScrollEnabled = false; 
let allProducts = [];

// Utilidad de obtención
async function fetchData(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) throw new Error("Error fetching data");
    return await response.json();
  } catch (error) {
    console.error(error);
  }
}

// Persist cart to localStorage

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

// Conservar el carrito en el almacenamiento local
function saveUser(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
  currentUser = user;
}

// Cargar categorías
async function loadCategories() {
  const categories = await fetchData("/categories");
  categorySelect.innerHTML = `<option value="">Todas las categorías</option>`;
  categories.forEach((category) => {
    const option = `<option value="${category.id}">${category.name}</option>`;
    categorySelect.innerHTML += option;
  });
}

// Mostrar productos
async function getProducts(categoryId = null, append = false) {
  if (isLoading) return;
  isLoading = true;
  loadingIndicator.style.display = "block";
  loadMoreButton.style.display = "none";

  let endpoint = `/products?limit=${limit}&offset=${offset}`;
  if (categoryId) {
    endpoint = `/categories/${categoryId}/products?limit=${limit}&offset=${offset}`;
  }

  const products = await fetchData(endpoint);

  if (!append) {
    container.innerHTML = "";
    allProducts = [];
  }

  if (!products || products.length === 0) {
    if (!append) container.innerHTML = `<p style="text-align: center; color: red;">No se encontraron productos.</p>`;
    loadingIndicator.style.display = "none";
    return;
  }

  allProducts = allProducts.concat(products);

  products.forEach((product) => {
    const image = product.images && product.images[0] ? product.images[0] : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQumqw6UawRn7rOgAvevIfEnX55015CA-oTeA&s";
    const productCard = `
      <div class="product" data-id="${product.id}">
        <img src="${image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <p>Precio: $${product.price}</p>
        <button class="add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">Agregar al Carrito</button>
        <button class="view-details" data-id="${product.id}">Ver Detalles</button>
      </div>
    `;
    container.innerHTML += productCard;
  });

  offset += limit;
  isLoading = false;
  loadingIndicator.style.display = "none";

  if (products.length < limit) {
    loadMoreButton.style.display = "none";
  } else {
    loadMoreButton.style.display = "block";
  }
}

// Filtrar productos por consulta de búsqueda
function filterProducts(query) {
  const filteredProducts = allProducts.filter((product) =>
    product.title.toLowerCase().includes(query.toLowerCase())
  );

  container.innerHTML = "";
  if (filteredProducts.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: red;">No se encontraron productos.</p>`;
    return;
  }

  filteredProducts.forEach((product) => {
    const image = product.images && product.images[0] ? product.images[0] : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQumqw6UawRn7rOgAvevIfEnX55015CA-oTeA&s";
    const productCard = `
      <div class="product" data-id="${product.id}">
        <img src="${image}" alt="${product.title}">
        <h2>${product.title}</h2>
        <p>Precio: $${product.price}</p>
        <button class="add-to-cart" data-id="${product.id}" data-title="${product.title}" data-price="${product.price}">Agregar al Carrito</button>
        <button class="view-details" data-id="${product.id}">Ver Detalles</button>
      </div>
    `;
    container.innerHTML += productCard;
  });
}

// Scroll Infinito
function setupInfiniteScroll() {
  window.addEventListener("scroll", async () => {
    if (!infiniteScrollEnabled) return;
    if (isLoading || document.documentElement.scrollTop + window.innerHeight < document.documentElement.scrollHeight - 100) {
      return;
    }
    await getProducts(currentCategory, true);
  });
}

// Activar o desactivar el desplazamiento infinito
function toggleInfiniteScroll(enable) {
  infiniteScrollEnabled = enable;
  if (enable) {
    setupInfiniteScroll();
  }
}


// Mostrar detalles del producto con navegación por flechas
async function showProductDetails(productId) {
  const product = await fetchData(`/products/${productId}`);
  if (product) {
    const overlay = document.createElement("div");
    overlay.classList.add("modal-overlay");
    overlay.style.display = "block";

    const modal = document.createElement("div");
    modal.classList.add("modal");
    modal.style.display = "block";

// Filtrar imágenes únicas    
    const images = product.images && product.images.length > 0 
      ? [...new Set(product.images)] 
      : ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQumqw6UawRn7rOgAvevIfEnX55015CA-oTeA&s"];
    let currentIndex = 0;

    const updateMainImage = () => {
      mainImage.src = images[currentIndex];
    };

    const galleryHTML = `
      <div class="image-gallery">
        <div class="main-image-container">
          <button class="arrow left-arrow">&lt;</button>
          <img src="${images[0]}" alt="${product.title}" id="mainImage">
          <button class="arrow right-arrow">&gt;</button>
        </div>
      </div>
    `;

    modal.innerHTML = `
      <div class="modal-content">
        <button class="close" aria-label="Cerrar">&times;</button>
        ${galleryHTML}
        <h2>${product.title}</h2>
        <p>${product.description}</p>
        <p>Categoría: ${product.category ? product.category.name : "N/A"}</p>
        <p>Precio: $${product.price}</p>
        <p>Stock: ${product.stock || "N/A"}</p>
        <button onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Agregar al Carrito</button>
      </div>
    `;

    overlay.addEventListener("click", () => {
      document.body.removeChild(overlay);
      document.body.removeChild(modal);
    });

    modal.querySelector(".close").addEventListener("click", () => {
      document.body.removeChild(overlay);
      document.body.removeChild(modal);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(modal);

    const mainImage = modal.querySelector("#mainImage");
    const leftArrow = modal.querySelector(".left-arrow");
    const rightArrow = modal.querySelector(".right-arrow");

//Añadir funcionalidad de navegación    
    leftArrow.addEventListener("click", () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateMainImage();
    });

    rightArrow.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateMainImage();
    });
  }
}


// Administrar carrito
function addToCart(productId, productTitle, productPrice) {
  if (!currentUser) {
    alert("Debes iniciar sesión para agregar productos al carrito.");
    return;
  }

  if (!cart[productId]) {
    cart[productId] = {
      title: productTitle,
      price: productPrice,
      quantity: 1,
    };
  } else {
    cart[productId].quantity += 1;
  }
  updateCartUI();
  saveCart();
}

// Actualizar la interfaz de usuario del carrito
function updateCartUI() {
  const items = Object.values(cart);
  cartItemsContainer.innerHTML = "";
  let total = 0;

  items.forEach((item) => {
    total += item.price * item.quantity;
    const cartItem = `
      <div class="cart-item">
        <p>${item.title}</p>
        <div>
          <button onclick="updateCartQuantity('${item.title}', -1)">-</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartQuantity('${item.title}', 1)">+</button>
          <button onclick="removeFromCart('${item.title}')">Eliminar</button>
        </div>
        <p>$${item.price * item.quantity}</p>
      </div>
    `;
    cartItemsContainer.innerHTML += cartItem;
  });

  cartCount.textContent = items.length;
  cartTotal.textContent = `$${total}`;
}

function updateCartQuantity(productId, delta) {
  if (cart[productId]) {
    cart[productId].quantity += delta;
    if (cart[productId].quantity <= 0) {
      delete cart[productId];
    }
    updateCartUI();
    saveCart();
  }
}

function removeFromCart(productId) {
  if (cart[productId]) {
    delete cart[productId];
    updateCartUI();
    saveCart();
  }
}

// EmailJS 
async function sendEmail(templateParams) {
  try {
    await emailjs.send("service_id", "template_id", templateParams, "user_id");
    alert("Correo enviado exitosamente.");
  } catch (error) {
    console.error("Error enviando el correo:", error);
    alert("No se pudo enviar el correo.");
  }
}

// Escuchadores de eventos
document.addEventListener("DOMContentLoaded", async () => {
  await loadCategories();

  loadMoreButton.addEventListener("click", async () => {
    await getProducts(currentCategory, true);
    toggleInfiniteScroll(true); 
  });

  categorySelect.addEventListener("change", async (e) => {
    currentCategory = e.target.value || null;
    offset = 0; 
    await getProducts(currentCategory);
    toggleInfiniteScroll(false);
  });

  container.addEventListener("click", (e) => {
    if (e.target.classList.contains("view-details")) {
      const productId = e.target.closest(".product").dataset.id;
      showProductDetails(productId);
    } else if (e.target.classList.contains("add-to-cart")) {
      const productCard = e.target.closest(".product");
      const productId = productCard.dataset.id;
      const productTitle = productCard.querySelector("h2").textContent;
      const productPrice = parseFloat(productCard.querySelector("p").textContent.replace("Precio: $", ""));
      addToCart(productId, productTitle, productPrice);
    }
  });

  viewCartButton.addEventListener("click", () => {
    cartModal.style.display = "flex";
  });

  closeCartButton.addEventListener("click", () => {
    cartModal.style.display = "none";
  });

  checkoutButton.addEventListener("click", async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para finalizar el pedido.");
      return;
    }

// Enviar correo electrónico de confirmación    
    await sendEmail({
      user_name: currentUser.name,
      user_email: currentUser.email,
      message: "Gracias por tu compra. Tu pedido ha sido confirmado.",
    });

    alert("Pedido realizado con éxito. ¡Gracias por tu compra!");
    cart = {};
    updateCartUI();
    saveCart();
    cartModal.style.display = "none";
  });

  searchInput.addEventListener("input", (e) => {
    const query = e.target.value;
    filterProducts(query);
  });
});
