// Konfigurasi DOM
const form = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const itemAmountInput = document.getElementById('item-amount');
const itemCategoryInput = document.getElementById('item-category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');
const ctx = document.getElementById('expense-chart').getContext('2d');

// State Aplikasi
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let expenseChart;

// Format Rupiah
const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Inisialisasi Aplikasi
function init() {
    updateDOM();
}

// Tambah Transaksi
form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(itemAmountInput.value);
    const category = itemCategoryInput.value;

    // Validasi input
    if (name === '' || isNaN(amount) || amount <= 0 || category === '') {
        alert('Mohon isi semua kolom dengan benar.');
        return;
    }

    const transaction = {
        id: generateID(),
        name: name,
        amount: amount,
        category: category
    };

    transactions.push(transaction);
    updateLocalStorage();
    updateDOM();

    // Reset Form
    form.reset();
});

// Buat ID unik
function generateID() {
    return Math.floor(Math.random() * 100000000);
}

// Hapus Transaksi
function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    updateDOM();
}

// Update tampilan (Total, Daftar, Grafik)
function updateDOM() {
    renderList();
    updateTotal();
    updateChart();
}

// Render Transaksi ke HTML
function renderList() {
    transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionList.innerHTML = '<li style="justify-content: center; color: gray;">Belum ada transaksi.</li>';
        return;
    }

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        
        // Warna border kiri
        let borderColor = '#0056b3'; // Default
        if(transaction.category === 'Food') borderColor = '#ff6384';
        if(transaction.category === 'Transport') borderColor = '#36a2eb';
        if(transaction.category === 'Fun') borderColor = '#ffce56';
        li.style.borderLeftColor = borderColor;

        li.innerHTML = `
            <div class="item-details">
                <span class="item-name">${transaction.name}</span>
                <span class="item-category">${transaction.category}</span>
            </div>
            <div class="item-amount-action">
                <span class="item-amount">${formatRupiah(transaction.amount)}</span>
                <button class="btn-delete" onclick="deleteTransaction(${transaction.id})">Hapus</button>
            </div>
        `;
        transactionList.appendChild(li);
    });
}

// Hitung dan Update Total Balance
function updateTotal() {
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    totalBalanceEl.innerText = formatRupiah(total);
}

// Update Visual Chart (Pie Chart)
function updateChart() {
    const categoryTotals = {
        'Food': 0,
        'Transport': 0,
        'Fun': 0
    };

    transactions.forEach(t => {
        if (categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        }
    });

    const dataValues = [categoryTotals['Food'], categoryTotals['Transport'], categoryTotals['Fun']];

    // Jika chart ada, hancurkan chart
    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Food', 'Transport', 'Fun'],
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#ff6384', // Food - Merah/Pink
                    '#36a2eb', // Transport - Biru
                    '#ffce56'  // Fun - Kuning
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Simpan ke Local Storage
function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Run Aplikasi
init();