
document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // CONFIGURACIÓN
    // ==========================================

    // Reemplaza este número por el WhatsApp real
    // del negocio, con indicativo de Colombia: 57.
    const WHATSAPP_NUMBER = "573106735170";

    const $ = (selector) => document.querySelector(selector);
    const $$ = (selector) => [...document.querySelectorAll(selector)];

    const menuButton = $("#menuButton");
    const mobileMenu = $("#mobileMenu");
    const cartButton = $("#cartButton");
    const cartOverlay = $("#cartOverlay");
    const cartPanel = $("#cartPanel");
    const closeCartButton = $("#closeCart");
    const cartCount = $("#cartCount");
    const cartItems = $("#cartItems");
    const cartTotal = $("#cartTotal");
    const checkoutButton = $("#checkoutButton");
    const searchInput = $("#searchInput");
    const searchButton = $("#searchButton");
    const resultsCount = $("#resultsCount");
    const noResults = $("#noResults");
    const clearSearch = $("#clearSearch");
    const productsGrid = $("#productsGrid");
    const toast = $("#toast");

    const productCards = $$("#productsGrid .product-card");

    let activeCategory = "todos";
    let searchTerm = "";
    let toastTimeout;

    // El carrito guarda productos y cantidades.
    // Se recupera del almacenamiento local cuando existe.
    let cart = {};

    try {
        cart = JSON.parse(localStorage.getItem("multiventasRafaCart")) || {};
    } catch {
        cart = {};
    }

    // ==========================================
    // UTILIDADES
    // ==========================================

    const formatPrice = (price) =>
        "$" + price.toLocaleString("es-CO") + " COP";

    function showToast(message) {
        if (!toast) return;

        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.remove("hidden");

        toastTimeout = setTimeout(() => {
            toast.classList.add("hidden");
        }, 2800);
    }

    function saveCart() {
        try {
            localStorage.setItem(
                "multiventasRafaCart",
                JSON.stringify(cart)
            );
        } catch (error) {
            console.warn("No se pudo guardar el carrito.", error);
        }
    }

    // ==========================================
    // MENÚ PARA CELULARES
    // ==========================================

    function closeMobileMenu() {
        if (!menuButton || !mobileMenu) return;

        mobileMenu.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");

        const icon = menuButton.querySelector("i");

        if (icon) {
            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");
        }
    }

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", () => {
            const isOpen = mobileMenu.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(isOpen));

            const icon = menuButton.querySelector("i");

            if (icon) {
                icon.classList.toggle("fa-bars", !isOpen);
                icon.classList.toggle("fa-xmark", isOpen);
            }
        });

        mobileMenu.querySelectorAll("a").forEach((link) => {
            link.addEventListener("click", closeMobileMenu);
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") closeMobileMenu();
        });
    }

    // ==========================================
    // FILTROS Y BUSCADOR
    // ==========================================

    function filterProducts() {
        let visibleCount = 0;

        productCards.forEach((card) => {
            const name = (card.dataset.name || "").toLowerCase();
            const category = (card.dataset.category || "").toLowerCase();

            const categoryMatches =
                activeCategory === "todos" ||
                category === activeCategory;

            const searchMatches = name.includes(searchTerm);

            const visible = categoryMatches && searchMatches;

            card.classList.toggle("hidden", !visible);

            if (visible) visibleCount++;
        });

        if (resultsCount) {
            resultsCount.textContent =
                `Mostrando ${visibleCount} producto${visibleCount === 1 ? "" : "s"}`;
        }

        if (noResults) {
            noResults.classList.toggle("hidden", visibleCount !== 0);
        }

        if (productsGrid) {
            productsGrid.classList.toggle("hidden", visibleCount === 0);
        }

        $$(".category-button").forEach((button) => {
            const isActive = button.dataset.filter === activeCategory;

            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    function runSearch() {
        searchTerm = (searchInput?.value || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        // Permite encontrar "limpido" aunque el nombre
        // del producto incluya una tilde.
        productCards.forEach((card) => {
            card.dataset.normalizedName = (card.dataset.name || "")
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");
        });

        filterProductsNormalized();
    }

    function filterProductsNormalized() {
        let visibleCount = 0;

        productCards.forEach((card) => {
            const name = card.dataset.normalizedName ||
                (card.dataset.name || "").toLowerCase();

            const category = (card.dataset.category || "").toLowerCase();

            const categoryMatches =
                activeCategory === "todos" ||
                category === activeCategory;

            const searchMatches = name.includes(searchTerm);
            const visible = categoryMatches && searchMatches;

            card.classList.toggle("hidden", !visible);

            if (visible) visibleCount++;
        });

        if (resultsCount) {
            resultsCount.textContent =
                `Mostrando ${visibleCount} producto${visibleCount === 1 ? "" : "s"}`;
        }

        noResults?.classList.toggle("hidden", visibleCount !== 0);
        productsGrid?.classList.toggle("hidden", visibleCount === 0);

        $$(".category-button").forEach((button) => {
            const isActive = button.dataset.filter === activeCategory;
            button.classList.toggle("active", isActive);
            button.setAttribute("aria-pressed", String(isActive));
        });
    }

    $$(".category-button").forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.filter || "todos";
            filterProductsNormalized();
        });
    });

    // Las tarjetas de categorías llevan a la tienda
    // con el filtro correspondiente.
    $$(".category-card").forEach((button) => {
        button.addEventListener("click", () => {
            activeCategory = button.dataset.category || "todos";

            if (searchInput) searchInput.value = "";
            searchTerm = "";

            filterProductsNormalized();

            $("#tienda")?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        });
    });

    searchButton?.addEventListener("click", runSearch);

    searchInput?.addEventListener("input", runSearch);

    searchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter") runSearch();
    });

    clearSearch?.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";

        activeCategory = "todos";
        searchTerm = "";

        filterProductsNormalized();
        $("#tienda")?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    // ==========================================
    // CARRITO DE COMPRAS
    // ==========================================

    function getProductData(card) {
        const title = card.querySelector("h3")?.textContent.trim();
        const price = Number(card.dataset.price);
        const category = card.dataset.category || "";
        const image = card.querySelector("img")?.getAttribute("src") || "";

        if (!title || !Number.isFinite(price) || price < 0) {
            return null;
        }

        return {
            id: card.dataset.name,
            title,
            price,
            category,
            image
        };
    }

    function addToCart(card) {
        const product = getProductData(card);

        if (!product) {
            showToast("No se pudo agregar este producto.");
            return;
        }

        if (cart[product.id]) {
            cart[product.id].quantity++;
        } else {
            cart[product.id] = {
                ...product,
                quantity: 1
            };
        }

        saveCart();
        renderCart();
        showToast(`${product.title} agregado al carrito.`);
    }

    $$(".add-to-cart").forEach((button) => {
        button.addEventListener("click", () => {
            const card = button.closest(".product-card");

            if (card) addToCart(card);
        });
    });

    function renderCart() {
        const entries = Object.values(cart).filter(
            (item) => item.quantity > 0 && item.price >= 0
        );

        const totalQuantity = entries.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = entries.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalQuantity;
        }

        if (cartTotal) {
            cartTotal.textContent = formatPrice(totalPrice);
        }

        if (!cartItems) return;

        cartItems.replaceChildren();

        if (entries.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className =
                "text-gray-500 text-center py-10";
            emptyMessage.textContent = "Tu carrito está vacío.";
            cartItems.appendChild(emptyMessage);
            return;
        }

        entries.forEach((item) => {
            const row = document.createElement("div");
            row.className =
                "flex items-center gap-3 border-b border-gray-100 pb-4";

            const info = document.createElement("div");
            info.className = "flex-1 min-w-0";

            const title = document.createElement("h3");
            title.className = "font-bold text-sm";
            title.textContent = item.title;

            const price = document.createElement("p");
            price.className = "text-principal font-bold text-sm mt-1";
            price.textContent = formatPrice(item.price * item.quantity);

            const quantity = document.createElement("p");
            quantity.className = "text-gray-500 text-xs mt-1";
            quantity.textContent = `Precio unitario: ${formatPrice(item.price)}`;

            info.append(title, price, quantity);

            const controls = document.createElement("div");
            controls.className = "flex items-center gap-2";

            const minus = document.createElement("button");
            minus.type = "button";
            minus.textContent = "−";
            minus.className =
                "w-8 h-8 rounded-lg bg-gray-100 font-bold";
            minus.setAttribute("aria-label", `Quitar una unidad de ${item.title}`);

            minus.addEventListener("click", () => {
                changeQuantity(item.id, -1);
            });

            const count = document.createElement("span");
            count.className = "font-bold text-sm";
            count.textContent = item.quantity;

            const plus = document.createElement("button");
            plus.type = "button";
            plus.textContent = "+";
            plus.className =
                "w-8 h-8 rounded-lg bg-gray-100 font-bold";
            plus.setAttribute("aria-label", `Agregar una unidad de ${item.title}`);

            plus.addEventListener("click", () => {
                changeQuantity(item.id, 1);
            });

            const remove = document.createElement("button");
            remove.type = "button";
            remove.innerHTML = '<i class="fa-solid fa-trash"></i>';
            remove.className =
                "w-8 h-8 rounded-lg text-red-600 hover:bg-red-50";
            remove.setAttribute("aria-label", `Eliminar ${item.title}`);

            remove.addEventListener("click", () => {
                delete cart[item.id];
                saveCart();
                renderCart();
                showToast("Producto eliminado del carrito.");
            });

            controls.append(minus, count, plus);
            row.append(info, controls, remove);
            cartItems.appendChild(row);
        });
    }

    function changeQuantity(id, amount) {
        if (!cart[id]) return;

        cart[id].quantity += amount;

        if (cart[id].quantity <= 0) {
            delete cart[id];
        }

        saveCart();
        renderCart();
    }

    // ==========================================
    // ABRIR Y CERRAR CARRITO
    // ==========================================

    function openCart() {
        if (!cartOverlay || !cartPanel) return;

        cartOverlay.classList.remove("hidden");
        cartOverlay.setAttribute("aria-hidden", "false");

        requestAnimationFrame(() => {
            cartPanel.classList.remove("translate-x-full");
        });

        document.body.style.overflow = "hidden";
        closeCartButton?.focus();
    }

    function closeCart() {
        if (!cartOverlay || !cartPanel) return;

        cartPanel.classList.add("translate-x-full");
        cartOverlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";

        setTimeout(() => {
            cartOverlay.classList.add("hidden");
        }, 300);

        cartButton?.focus();
    }

    cartButton?.addEventListener("click", openCart);
    closeCartButton?.addEventListener("click", closeCart);

    cartOverlay?.addEventListener("click", (event) => {
        if (event.target === cartOverlay) closeCart();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && cartOverlay &&
            !cartOverlay.classList.contains("hidden")) {
            closeCart();
        }
    });

    // ==========================================
    // PEDIDOS POR WHATSAPP
    // ==========================================

    checkoutButton?.addEventListener("click", () => {
        const entries = Object.values(cart).filter(
            (item) => item.quantity > 0
        );

        if (entries.length === 0) {
            showToast("Agrega productos antes de hacer tu pedido.");
            return;
        }

        if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
            showToast("Configura el número de WhatsApp del negocio.");
            return;
        }

        const total = entries.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        const lines = entries.map((item) =>
            `• ${item.title} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
        );

        const message = [
            "¡Hola, Multiventas Rafa! Quiero realizar el siguiente pedido:",
            "",
            ...lines,
            "",
            `TOTAL ESTIMADO: ${formatPrice(total)}`,
            "",
            "Por favor, confirmen la disponibilidad y el valor final del pedido."
        ].join("\n");

        const url =
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

        window.open(url, "_blank", "noopener,noreferrer");
    });

    // ==========================================
    // AÑO AUTOMÁTICO DEL FOOTER
    // ==========================================

    const currentYear = $("#currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    // ==========================================
    // INICIALIZACIÓN
    // ==========================================

    productCards.forEach((card) => {
        card.dataset.normalizedName = (card.dataset.name || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    });

    filterProductsNormalized();
    renderCart();
});
