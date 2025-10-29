/* ============ 1. Spinner (show/hide) ============ */
const ensureSpinner = (() => {
  let s = document.getElementById("loading-spinner");
  if (!s) {
    s = document.createElement("div");
    s.id = "loading-spinner";
    s.className = "text-center py-6 hidden";
    s.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-green-600 text-4xl"></i>`;
    const plantsParent = document.getElementById("plants-container");
    if (plantsParent) plantsParent.before(s);
    else document.body.prepend(s);
  }
  return () => document.getElementById("loading-spinner");
})();
function showSpinner(){ ensureSpinner().classList.remove("hidden"); }
function hideSpinner(){ ensureSpinner().classList.add("hidden"); }

/* ============ 2. Globals: cart, activeCategory ============ */
let cart = [];
let activeCategory = "all";

/* ============ 3. API helpers ============ */
const API = {
  plants: "https://openapi.programming-hero.com/api/plants",
  categories: "https://openapi.programming-hero.com/api/categories",
  plantsByCategory: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  plantDetail: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

/* ============ 4. Load Categories ============ */
const loadLessons = () => {
  showSpinner();
  fetch(API.categories)
    .then(r => r.json())
    .then(json => {
      displayLesson(json.data || json.categories || []);
      hideSpinner();
    })
    .catch(err => { console.error(err); hideSpinner(); });
};

/* ============ 5. Load All Plants ============ */
const loadPlants = () => {
  showSpinner();
  fetch(API.plants)
    .then(r => r.json())
    .then(json => {
      const plants = json.data || json.plants || [];
      displayPlants(plants);
      setActiveButton("all");
      hideSpinner();
    })
    .catch(err => { console.error(err); hideSpinner(); });
};

/* ============ 6. Load Plants by Category ============ */
function categoryCard(id){
  showSpinner();
  activeCategory = id;
  setActiveButton(id);
  fetch(API.plantsByCategory(id))
    .then(r => r.json())
    .then(json => {
      const plants = json.data || json.plants || [];
      if (plants.length) displayPlants(plants);
      else {
        const pc = document.getElementById("plants-container");
        pc.innerHTML = `<p class="text-center col-span-3 text-gray-500">❌ No plants found in this category</p>`;
      }
      hideSpinner();
    })
    .catch(err => { console.error(err); hideSpinner(); });
}

/* ============ 7. Display Plants (cards) ============ */
const displayPlants = (plants) => {
  const plantContainer = document.getElementById("plants-container");
  if (!plantContainer) return;
  plantContainer.innerHTML = "";
  plants.forEach(plant => {
    const card = document.createElement("div");
    card.className = "bg-white rounded-lg shadow-md p-4";

    // inner html for static parts
    card.innerHTML = `
      <img src="${plant.image}" alt="${plant.name}" class="w-full aspect-4/3 object-cover rounded-lg mb-3">
      <h3 class="font-bold text-lg cursor-pointer card-plant-name">${plant.name}</h3>
      <p class="text-gray-600 py-4">${plant.description ? plant.description.slice(0,120) + (plant.description.length>120?'...':'') : ""}</p>
      <div class="flex justify-between gap-5 items-center">
        <p class="bg-green-200 text-green-600 rounded-lg text-sm px-2 py-1">${plant.category || ""}</p>
        <p class="text-sm"><i class="fa-solid fa-bangladeshi-taka-sign"></i> ${Number(plant.price || 0)}</p>
      </div>
    `;

    // Add to Cart button (created programmatically to avoid inline JSON issues)
    const btn = document.createElement("button");
    btn.className = "w-full mt-3 px-4 py-2 bg-green-500 text-white rounded-2xl hover:bg-green-700 transition";
    btn.textContent = "Add to Cart";
    btn.addEventListener("click", () => addToCart(plant));

    // make plant name clickable to open modal details
    const nameEl = card.querySelector(".card-plant-name");
    if (nameEl) {
      nameEl.addEventListener("click", () => openPlantModal(plant.id));
    }

    card.appendChild(btn);
    plantContainer.appendChild(card);
  });
};

/* ============ 8. Cart: add, remove, update UI ============ */
function addToCart(plant){
  // store minimal info (id, name, price) to avoid large objects duplicates
  cart.push({ id: plant.id, name: plant.name, price: Number(plant.price || 0) });
  updateCartUI();
}

function removeFromCart(index){
  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    updateCartUI();
  }
}

function updateCartUI(){
  const cartContainer = document.getElementById("YourCart") || document.getElementById("cart-section") || null;
  if (!cartContainer) {
    console.warn("No cart container found (id 'YourCart' expected).");
    return;
  }

  // keep a list area inside YourCart with id cart-list and total-price spans
  let listEl = cartContainer.querySelector("#cart-list");
  if (!listEl) {
    listEl = document.createElement("ul");
    listEl.id = "cart-list";
    listEl.className = "divide-y";
    cartContainer.prepend(listEl);
  }
  listEl.innerHTML = "";

  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price;
    const li = document.createElement("li");
    li.className = "flex justify-between items-center py-2";
    li.innerHTML = `
      <span class="text-sm font-medium">${item.name}</span>
      <span class="flex items-center gap-3">
        <span class="text-sm text-green-600"><i class="fa-solid fa-bangladeshi-taka-sign"></i> ${item.price}</span>
        <button class="text-red-500 hover:text-red-700 remove-btn">❌</button>
      </span>
    `;
    li.querySelector(".remove-btn").addEventListener("click", () => removeFromCart(idx));
    listEl.appendChild(li);
  });

  // total area
  let totalEl = cartContainer.querySelector("#total-price");
  if (!totalEl) {
    const div = document.createElement("div");
    div.className = "flex justify-between mt-4 font-bold text-lg";
    div.innerHTML = `<span>Total:</span><span><i class="fa-solid fa-bangladeshi-taka-sign"></i> <span id="total-price">0</span></span>`;
    cartContainer.appendChild(div);
    totalEl = cartContainer.querySelector("#total-price");
  }
  // ensure numeric precision: round to 2 decimals
  totalEl.textContent = (Math.round((total + Number.EPSILON) * 100) / 100).toFixed(2);
}

/* ============ 9. Categories UI + Active Button ============ */
const displayLesson = (lessons) => {
  const categoriesList = document.getElementById("Categories-list");
  if (!categoriesList) return;
  categoriesList.innerHTML = "";

  // All button
  const allDiv = document.createElement("div");
  allDiv.innerHTML = `<button id="btn-all" class="text-left w-full px-4 py-2 rounded-md hover:text-white hover:bg-green-400">All</button>`;
  categoriesList.appendChild(allDiv);
  document.getElementById("btn-all").addEventListener("click", () => { loadPlants(); activeCategory = "all"; setActiveButton("all"); });

  // category buttons (use id if present else category_name)
  lessons.forEach(lesson => {
    const cid = lesson.category_id ?? lesson.id ?? lesson.category_name;
    const name = lesson.category_name ?? lesson.name ?? `Category ${cid}`;
    const d = document.createElement("div");
    d.innerHTML = `<button id="btn-${cid}" class="text-left w-full px-4 py-2 rounded-md hover:text-white hover:bg-green-300 transition duration-300 ease-in-out">${name}</button>`;
    categoriesList.appendChild(d);
    d.querySelector("button").addEventListener("click", () => { categoryCard(cid); });
  });

  // set initial active
  setActiveButton(activeCategory);
};

function setActiveButton(id){
  const buttons = document.querySelectorAll("#Categories-list button");
  buttons.forEach(b => b.classList.remove("bg-green-500", "text-white"));
  const el = document.getElementById(id === "all" ? "btn-all" : `btn-${id}`);
  if (el) el.classList.add("bg-green-500", "text-white");
}

/* ============ 10. Modal: open plant detail ============ */
function openPlantModal(id){
  if (!id) return;
  showSpinner();
  fetch(API.plantDetail(id))
    .then(r => r.json())
    .then(json => {
      const p = json.data || json.plant || {};
      hideSpinner();
      showModal(p);
    })
    .catch(err => { console.error(err); hideSpinner(); });
}

function showModal(plant){
  // remove existing
  const old = document.getElementById("plant-modal");
  if (old) old.remove();

  const modal = document.createElement("div");
  modal.id = "plant-modal";
  modal.className = "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4";
  modal.innerHTML = `
    <div class="bg-white rounded-lg max-w-2xl w-full p-6 relative">
      <button id="close-modal" class="absolute top-3 right-3 text-gray-600 hover:text-gray-900">✖</button>
      <div class="grid md:grid-cols-2 gap-4">
        <img src="${plant.image || ""}" alt="${plant.name || ""}" class="w-full h-48 object-cover rounded" />
        <div>
          <h3 class="text-xl font-bold mb-2">${plant.name || ""}</h3>
          <p class="text-gray-700 mb-3">${plant.description || "No description"}</p>
          <p class="mb-2"><strong>Category:</strong> ${plant.category || ""}</p>
          <p class="mb-2"><strong>Price:</strong> <i class="fa-solid fa-bangladeshi-taka-sign"></i> ${Number(plant.price || 0)}</p>
          <button id="modal-add" class="mt-3 px-4 py-2 bg-green-500 text-white rounded">Add to Cart</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById("close-modal").addEventListener("click", () => modal.remove());
  document.getElementById("modal-add").addEventListener("click", () => {
    addToCart({ id: plant.id, name: plant.name, price: Number(plant.price || 0) });
    modal.remove();
  });
}

/* ============ 11. Initialize ============ */
loadPlants();
loadLessons();
