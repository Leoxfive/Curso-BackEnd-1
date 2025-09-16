const socket = io();
const form = document.getElementById("productForm");
const productList = document.getElementById("productList");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const product = {
    title: formData.get("title"),
    price: formData.get("price"),
  };
  socket.emit("newProduct", product);
  form.reset();
});
socket.on("productList", (products) => {
  productList.innerHTML = "";
  products.forEach((product) => {
    const li = document.createElement("li");
    li.textContent = `${product.title} - $${product.price}`;
    productList.appendChild(li);
  });
});