
        const menuButton = document.getElementById("menuButton");
        const mobileMenu = document.getElementById("mobileMenu");

        menuButton.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(isOpen));

            menuButton.innerHTML = isOpen
                ? '<i class="fa-solid fa-xmark text-lg"></i>'
                : '<i class="fa-solid fa-bars text-lg"></i>';
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.remove("open");
                menuButton.setAttribute("aria-expanded", "false");
                menuButton.innerHTML = '<i class="fa-solid fa-bars text-lg"></i>';
            });
        });


        // =========================================
        // AÑO AUTOMÁTICO
        // =========================================

        document.getElementById("currentYear").textContent =
            new Date().getFullYear();


        // =========================================
        // BUSCADOR Y FILTROS
        // =========================================

        const searchInput = document.getElementById("searchInput");
        const searchButton = document.getElementById("searchButton");
        const productsGrid = document.getElementById("productsGrid");
        const products = [...productsGrid.querySelectorAll("article")];
        const resultsCount = document.getElementById("resultsCount");
        const noResults = document.getElementById("noResults");
        const clearSearch = document.getElementById("clearSearch");
        const filterButtons = document.querySelectorAll("[data-filter]");

        let activeCategory = "todos";

        function normalizeText(text) {
            return text
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .trim();
        }

        function applyFilters() {
            const searchTerm = normalizeText(searchInput.value);
            let visibleCount = 0;

            products.forEach(product => {
                const name = normalizeText(product.dataset.name);
                const category = product.dataset.category;

                const matchesSearch = name.includes(searchTerm);

                const matchesCategory =
                    activeCategory === "todos" ||
                    category === activeCategory;

                const visible = matchesSearch && matchesCategory;

                product.classList.toggle("hidden", !visible);

                if (visible) visibleCount++;
            });

            resultsCount.textContent =
                `Mostrando ${visibleCount} ${visibleCount === 1 ? "producto" : "productos"}`;

            noResults.classList.toggle("hidden", visibleCount !== 0);
        }

        searchInput.addEventListener("input", applyFilters);
        searchButton.addEventListener("click", applyFilters);

        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                applyFilters();
            }
        });

        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                activeCategory = button.dataset.filter;

                filterButtons.forEach(item => {
                    item.classList.toggle("active", item === button);
                });

                applyFilters();
            });
        });

        document.querySelectorAll("[data-category].category-card").forEach(button => {
            button.addEventListener("click", () => {
                activeCategory = button.dataset.category;

                filterButtons.forEach(item => {
                    item.classList.toggle(
                        "active",
                        item.dataset.filter === activeCategory
                    );
                });

                applyFilters();

                document.getElementById("tienda").scrollIntoView({
                    behavior: "smooth"
                });
            });
        });

        clearSearch.addEventListener("click", () => {
            searchInput.value = "";
            activeCategory = "todos";

            filterButtons.forEach(button => {
                button.classList.toggle(
                    "active",
                    button.dataset.filter === "todos"
                );
            });

            applyFilters();
        });


        // =========================================
        // NOTIFICACIONES
        // =========================================

        const toast = document.getElementById("toast");
        let toastTimer;

        function showToast(message) {
            toast.textContent = message;
            toast.classList.remove("hidden");

            clearTimeout(toastTimer);

            toastTimer = setTimeout(() => {
                toast.classList.add("hidden");
            }, 2500);
        }


        // =========================================
        // CARRITO DE COMPRAS
        // =========================================

        const cartButton = document.getElementById("cartButton");
        const cartCount = document.getElementById("cartCount");
        const cartOverlay = document.getElementById("cartOverlay");
        const cartPanel = document.getElementById("cartPanel");
        const closeCart = document.getElementById("closeCart");
        const cartItems = document.getElementById("cartItems");
        const cartTotal = document.getElementById("cartTotal");
        const checkoutButton = document.getElementById("checkoutButton");

        const cart = new Map();

        const moneyFormatter = new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            maximumFractionDigits: 0
        });

        function formatMoney(value) {
            return moneyFormatter.format(value);
        }

        function openCart() {
            cartOverlay.classList.remove("hidden");
            cartOverlay.setAttribute("aria-hidden", "false");

            requestAnimationFrame(() => {
                cartPanel.classList.remove("translate-x-full");
            });

            document.body.style.overflow = "hidden";
            closeCart.focus();
        }

        function hideCart() {
            cartPanel.classList.add("translate-x-full");
            cartOverlay.setAttribute("aria-hidden", "true");
            document.body.style.overflow = "";

            setTimeout(() => {
                cartOverlay.classList.add("hidden");
                cartButton.focus();
            }, 200);
        }

        cartButton.addEventListener("click", openCart);
        closeCart.addEventListener("click", hideCart);

        cartOverlay.addEventListener("click", event => {
            if (event.target === cartOverlay) {
                hideCart();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !cartOverlay.classList.contains("hidden")) {
                hideCart();
            }
        });


        function updateCart() {
            let totalItems = 0;
            let totalPrice = 0;

            cart.forEach(item => {
                totalItems += item.quantity;
                totalPrice += item.price * item.quantity;
            });

            cartCount.textContent = totalItems;
            cartTotal.textContent = formatMoney(totalPrice);

            if (cart.size === 0) {
                cartItems.innerHTML = `
                    <p class="text-gray-500 text-center py-10">
                        Tu carrito está vacío.
                    </p>
                `;
                return;
            }

            cartItems.innerHTML = "";

            cart.forEach(item => {
                const row = document.createElement("div");

                row.className =
                    "flex items-center justify-between gap-3 border-b border-gray-100 pb-4";

                const details = document.createElement("div");

                details.className = "min-w-0 flex-1";

                const name = document.createElement("p");
                name.className = "font-bold text-sm";
                name.textContent = item.name;

                const price = document.createElement("p");
                price.className = "text-sm text-principal mt-1";
                price.textContent =
                    `${formatMoney(item.price)} × ${item.quantity}`;

                details.append(name, price);

                const controls = document.createElement("div");
                controls.className = "flex items-center gap-2";

                const decrease = document.createElement("button");
                decrease.type = "button";
                decrease.className =
                    "w-8 h-8 rounded-lg bg-fondo font-bold";
                decrease.textContent = "−";
                decrease.setAttribute(
                    "aria-label",
                    `Quitar una unidad de ${item.name}`
                );

                decrease.addEventListener("click", () => {
                    item.quantity--;

                    if (item.quantity <= 0) {
                        cart.delete(item.name);
                    }

                    updateCart();
                });

                const quantity = document.createElement("span");
                quantity.className = "text-sm font-bold";
                quantity.textContent = item.quantity;

                const increase = document.createElement("button");
                increase.type = "button";
                increase.className =
                    "w-8 h-8 rounded-lg bg-fondo font-bold";
                increase.textContent = "+";
                increase.setAttribute(
                    "aria-label",
                    `Agregar una unidad de ${item.name}`
                );

                increase.addEventListener("click", () => {
                    item.quantity++;
                    updateCart();
                });

                controls.append(decrease, quantity, increase);
                row.append(details, controls);
                cartItems.appendChild(row);
            });
        }


        document.querySelectorAll(".add-to-cart").forEach(button => {
            button.addEventListener("click", () => {
                const product = button.closest("article");

                const name = product.dataset.name;
                const price = Number(product.dataset.price);

                if (!cart.has(name)) {
                    cart.set(name, {
                        name: product.querySelector("h3").textContent.trim(),
                        price,
                        quantity: 0
                    });
                }

                cart.get(name).quantity++;

                updateCart();
                showToast("¡Producto agregado al carrito!");
            });
        });


        // =========================================
        // CONTINUAR PEDIDO POR WHATSAPP
        // =========================================

        checkoutButton.addEventListener("click", () => {
            if (cart.size === 0) {
                showToast("Agrega productos antes de continuar.");
                return;
            }

            let total = 0;

            const lines = [
                "Hola, Multiventas Rafa. Quiero consultar este pedido:",
                ""
            ];

            cart.forEach(item => {
                const subtotal = item.price * item.quantity;

                total += subtotal;

                lines.push(
                    `- ${item.name}: ${item.quantity} x ${formatMoney(item.price)} = ${formatMoney(subtotal)}`
                );
            });

            lines.push("");
            lines.push(`Total estimado: ${formatMoney(total)}`);
            lines.push("");
            lines.push("Por favor, confirmen la disponibilidad y el valor final.");

            /*
            IMPORTANTE:
            Reemplaza el número de ejemplo por el número real
            de WhatsApp del negocio, incluyendo el indicativo 57.
            No incluyas espacios, signos + ni guiones.
            */

            const whatsappNumber = "573106735170";

            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join("\n"))}`;

            window.open(whatsappURL, "_blank", "noopener,noreferrer");
        });


        // Estado inicial del catálogo y carrito
        applyFilters();
        updateCart();

