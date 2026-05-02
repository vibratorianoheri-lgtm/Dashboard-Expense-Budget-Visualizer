const form = document.getElementById('expense-form');
const itemNameInput = document.getElementById('item-name');
const itemAmountInput = document.getElementById('item-amount');
const itemCategoryInput = document.getElementById('item-category');
const transactionList = document.getElementById('transaction-list');
const totalBalanceEl = document.getElementById('total-balance');
const themeToggleBtn = document.getElementById('theme-toggle');
const canvas = document.getElementById('expense-chart');
const ctx = canvas.getContext('2d');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let isDarkMode = localStorage.getItem('darkMode') === 'true';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

function init() {
    applyTheme();
    updateDOM();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        themeToggleBtn.innerText = '☀️ Mode Terang';
    } else {
        document.body.classList.remove('dark-mode');
        themeToggleBtn.innerText = '🌙 Mode Gelap';
    }
}

themeToggleBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    applyTheme();
    updateChart(); 
});

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = itemNameInput.value.trim();
    const amount = parseFloat(itemAmountInput.value);
    const category = itemCategoryInput.value;

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
    form.reset();
});

function generateID() {
    return Math.floor(Math.random() * 100000000);
}

function deleteTransaction(id) {
    transactions = transactions.filter(transaction => transaction.id !== id);
    updateLocalStorage();
    updateDOM();
}

function updateDOM() {
    renderList();
    updateTotal();
    updateChart();
}

function renderList() {
    transactionList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionList.innerHTML = '<li style="justify-content: center; color: var(--text-muted);">Belum ada transaksi.</li>';
        return;
    }

    transactions.forEach(transaction => {
        const li = document.createElement('li');
        
        let borderColor = 'var(--primary-color)';
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

function updateTotal() {
    const total = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);
    totalBalanceEl.innerText = formatRupiah(total);
}

function updateChart() {
    canvas.width = 400;
    canvas.height = 300;

    const categoryTotals = { 'Food': 0, 'Transport': 0, 'Fun': 0 };

    transactions.forEach(t => {
        if (categoryTotals[t.category] !== undefined) {
            categoryTotals[t.category] += t.amount;
        }
    });

    const data = [
        { label: 'Food', value: categoryTotals['Food'], color: '#ff6384' },
        { label: 'Transport', value: categoryTotals['Transport'], color: '#36a2eb' },
        { label: 'Fun', value: categoryTotals['Fun'], color: '#ffce56' }
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = (canvas.height / 2) - 20; 
    const radius = Math.min(centerX, centerY) - 10;

    if (total === 0) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.fillStyle = isDarkMode ? '#2c2c2c' : '#e9ecef';
        ctx.fill();
        
        ctx.fillStyle = isDarkMode ? '#a0a0a0' : '#6c757d';
        ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Belum ada data', centerX, centerY);
        return;
    }

    let startAngle = -0.5 * Math.PI;

    data.forEach(item => {
        if (item.value === 0) return; 
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        
        ctx.fillStyle = item.color;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = isDarkMode ? '#1e1e1e' : '#ffffff';
        ctx.stroke();

        startAngle += sliceAngle;
    });

    const legendY = canvas.height - 25;
    const legendWidth = canvas.width / 3;
    let currentX = 35;

    data.forEach(item => {
        ctx.fillStyle = item.color;
        ctx.fillRect(currentX, legendY - 10, 15, 15);

        ctx.fillStyle = isDarkMode ? '#e0e0e0' : '#6c757d';
        ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(item.label, currentX + 22, legendY + 2);

        currentX += legendWidth;
    });
}

function updateLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

init();