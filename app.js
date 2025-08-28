// --- DOM Elemanları ---
const form = document.getElementById("transaction-form");
const type = document.getElementById("type");
const amount = document.getElementById("amount");
const description = document.getElementById("description");
const category = document.getElementById("category");
const list = document.getElementById("transaction-list");

const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// --- İşlem Ekle ---
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    type: type.value,
    amount: +amount.value,
    description: description.value,
    category: category.value,
    date: new Date().toLocaleDateString()
  };

  transactions.push(transaction);
  saveAndRender();
  form.reset();
});

// --- Kaydet & Render Et ---
function saveAndRender() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
  renderSummary();
  renderChart();
}

// --- İşlem Listesi Göster ---
function renderTransactions() {
  list.innerHTML = "";
  transactions.forEach((tr, index) => {
    const li = document.createElement("li");
    li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center", "mb-2");

    // İşlem metni
    const span = document.createElement("span");
    span.textContent = `${tr.date} | ${tr.type === "income" ? "+" : "-"}${tr.amount} ₺ | ${tr.description} [${tr.category}]`;

    // Silme butonu
    const deleteBtn = document.createElement("button");
    deleteBtn.classList.add("btn", "btn-sm", "btn-danger", "ms-3");
    deleteBtn.textContent = "Sil";

    // Butona tıklayınca işlemi sil
    deleteBtn.addEventListener("click", () => {
      transactions.splice(index, 1); // diziden sil
      renderTransactions();
      saveAndRender(); // listeyi tekrar göster
    });

    // li içine ekle
    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

// --- Özet Hesapla ---
function renderSummary() {
  const income = transactions.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const expense = transactions.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = income - expense;

  totalIncomeEl.textContent = income;
  totalExpenseEl.textContent = expense;
  balanceEl.textContent = balance;
}

// --- Basit Grafik (Kategoriye Göre Harcama) ---
function renderChart() {
  const ctx = document.getElementById("chart").getContext("2d");
  ctx.clearRect(0, 0, 400, 200);

  const categories = {};
  transactions.filter(t => t.type === "expense").forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + t.amount;
  });

  const keys = Object.keys(categories);
  const values = Object.values(categories);

  values.forEach((val, i) => {
    ctx.fillStyle = "teal";
    ctx.fillRect(i * 80 + 30, 200 - val, 50, val);
    ctx.fillText(keys[i], i * 80 + 35, 190);
  });
}

// --- İlk Yüklemede Çalıştır ---
const searchInput = document.getElementById("search");
const filterCategory = document.getElementById("filter-category");
const startDate = document.getElementById("start-date");
const endDate = document.getElementById("end-date");
saveAndRender();
// --- Filtre Elemanları ---

// --- Filtreleme ---
function getFilteredTransactions() {
  let filtered = [...transactions];

  // Arama (açıklama + kategori)
  const searchTerm = searchInput.value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(t =>
      t.description.toLowerCase().includes(searchTerm) ||
      t.category.toLowerCase().includes(searchTerm)
    );
  }
  // Kategori filtresi
  if (filterCategory.value !== "all") {
    filtered = filtered.filter(t => t.category === filterCategory.value);
  }

  // Tarih aralığı filtresi
  if (startDate.value) {
    filtered = filtered.filter(t => new Date(t.date) >= new Date(startDate.value));
  }
  if (endDate.value) {
    filtered = filtered.filter(t => new Date(t.date) <= new Date(endDate.value));
  }

  return filtered;
}



