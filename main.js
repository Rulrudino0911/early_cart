const cart = document.getElementById('cart');
const totalQty = document.getElementById('total-qty');
const totalPrice = document.getElementById('total-price');
const paySound = document.getElementById('paySound');

let items = JSON.parse(localStorage.getItem("cartItems")) || [];

function saveCart() {
  localStorage.setItem("cartItems", JSON.stringify(items));
}

function renderCart() {
  cart.innerHTML = "";

  if (items.length === 0) {
    cart.innerHTML = '<p class="placeholder">NFC Tag Scanning...</p>';
    totalQty.textContent = 0;
    totalPrice.textContent = "0 won";
    return;
  }

  let totalQtyCount = 0;
  let totalPriceSum = 0;

  items.forEach((item, index) => {
    totalQtyCount += item.qty;
    totalPriceSum += item.price * item.qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="images/${item.name}.png" class="item-image" onerror="this.src='images/default.png'" />
      <div class="item-info">
        <div><span class="item-name">${item.name}</span><span class="item-count">x ${item.qty}</span></div>
        <div class="item-price">${item.price.toLocaleString()} won</div>
      </div>
      <div class="item-controls">
        <button onclick="decrease(${index})">−</button>
        <span>${item.qty}</span>
        <button onclick="increase(${index})">+</button>
        <button class="delete" onclick="remove(${index})">×</button>
      </div>
    `;
    cart.appendChild(div);
  });

  totalQty.textContent = totalQtyCount;
  totalPrice.textContent = totalPriceSum.toLocaleString() + " won";
  saveCart();
}

function increase(index) {
  items[index].qty++;
  renderCart();
}

function decrease(index) {
  if (items[index].qty > 1) {
    items[index].qty--;
  } else {
    items.splice(index, 1);
  }
  renderCart();
}

function remove(index) {
  items.splice(index, 1);
  renderCart();
}

function clearCart() {
  items = [];
  localStorage.removeItem("cartItems");
  renderCart();
}

async function pollNFC() {
  try {
    const res = await fetch("http://127.0.0.1:8720/latestItem");
    if (!res.ok) return;
    const data = await res.json();

    console.log("name:", data.name);

    if (data.name === "card") {
      alert("Payment Completed");
      if (paySound) paySound.play();
      clearCart();
      return;
    }

    const existing = items.find(i => i.name === data.name);
    if (existing) {
      existing.qty++;
      renderCart();
    } else {
      items.push({ name: data.name, price: parseInt(data.price), qty: 1 });
      renderCart();
    }
  } catch (e) {}
}

setInterval(pollNFC, 2000);

renderCart();