const form = document.getElementById("expense-form");
const nameInput = document.getElementById("expense-name");
const amountInput = document.getElementById("expense-amount");
const categoryInput = document.getElementById("expense-category");
const dateInput = document.getElementById("expense-date");
const transactionList = document.getElementById("transaction-list");
const filterCategory = document.getElementById("filter-category");
const filterDate = document.getElementById("filter-date");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

function saveExpenses() {
  localStorage.setItem("expenses", JSON.stringify(expenses));
}

function renderExpenses() {
  transactionList.innerHTML = "";
  const filtered = expenses.filter(exp => {
    const matchesCategory = filterCategory.value === "All" || exp.category === filterCategory.value;
    const matchesDate = !filterDate.value || exp.date.startsWith(filterDate.value);
    return matchesCategory && matchesDate;
  });
  filtered.forEach((exp, index) => {
    const li = document.createElement("li");
    li.innerHTML = `
      ${exp.name} - $${exp.amount} - ${exp.category} - ${exp.date}
      <button onclick="deleteExpense(${index})">Delete</button>
    `;
    transactionList.appendChild(li);
  });
  updateCharts();
}

function deleteExpense(index) {
  expenses.splice(index, 1);
  saveExpenses();
  renderExpenses();
}

form.addEventListener("submit", e => {
  e.preventDefault();
  const name = nameInput.value.trim();
  const amount = parseFloat(amountInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!name || isNaN(amount) || amount <= 0 || !date) {
    alert("Woah there! Please fill in all fields with valid values.");
    return;
  }

  expenses.push({ name, amount, category, date });
  saveExpenses();
  form.reset();
  renderExpenses();
});

filterCategory.addEventListener("change", renderExpenses);
filterDate.addEventListener("change", renderExpenses);

let categoryChart, monthlyChart;

function updateCharts() {
  const categoryData = {};
  const monthlyData = {};

  expenses.forEach(expense => {
    categoryData[expense.category] = (categoryData[expense.category] || 0) + expense.amount;
    const month = expense.date.slice(0, 7);
    monthlyData[month] = (monthlyData[month] || 0) + expense.amount;
  });

  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  const monthlyCtx = document.getElementById("monthlyChart").getContext("2d");

  if (categoryChart) categoryChart.destroy();
  if (monthlyChart) monthlyChart.destroy();

  categoryChart = new Chart(categoryCtx, {
    type: "pie",
    data: {
      labels: Object.keys(categoryData),
      datasets: [{
        label: "Expenses by Category",
        data: Object.values(categoryData),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
      }]
      
    }
  });

  monthlyChart = new Chart(monthlyCtx, {
    type: "line",
    data: {
      labels: Object.keys(monthlyData).sort(),
      datasets: [{
        label: "Monthly Spending",
        data: Object.values(monthlyData),
        fill: false,
        borderColor: "#4CAF50"
      }]
    }
  });
}

renderExpenses();
