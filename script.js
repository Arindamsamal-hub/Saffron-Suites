document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Search Logic
    const searchInput = document.getElementById("search");
    const cards = document.querySelectorAll(".card");

    // Only run search logic if the search input exists (Home Page)
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            const value = searchInput.value.toLowerCase().trim();

            cards.forEach(card => {
                const hotelName = card.querySelector("h3").innerText.toLowerCase();
                const location = card.dataset.location.toLowerCase();

                if (hotelName.includes(value) || location.includes(value)) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        });
    }

    // 2. Click Logic for Details Page
    cards.forEach(card => {
        card.addEventListener("click", () => {
            const title = card.querySelector("h3").innerText;
            const price = card.querySelector("p").innerText;
            const rating = card.querySelector("span").innerText;
            const imgSrc = card.querySelector("img").src;
            const location = card.dataset.location;

            const params = new URLSearchParams();
            params.append("title", title);
            params.append("price", price);
            params.append("rating", rating);
            params.append("img", imgSrc);
            params.append("location", location);

            window.location.href = `details.html?${params.toString()}`;
        });
    });

});