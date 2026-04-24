document.addEventListener("DOMContentLoaded", () => {
    // 1. Get Data from URL
    const params = new URLSearchParams(window.location.search);
    const today = new Date().toISOString().split('T')[0];
    
    // UI Elements
    const titleEl = document.getElementById("summary-title");
    const imgEl = document.getElementById("summary-img");
    const priceNightEl = document.getElementById("summary-price-per-night");
    
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    const roomsInput = document.getElementById("rooms");
    const adultsInput = document.getElementById("adults");
    
    // Summary Breakdown Elements
    const nightCountEl = document.getElementById("night-count");
    const roomDisplayEl = document.getElementById("room-display");
    const basePriceEl = document.getElementById("base-price");
    const serviceFeeEl = document.getElementById("service-fee");
    const finalAmountEl = document.getElementById("final-amount");

    // --- 2. POPULATE INITIAL UI ---
    const pricePerNight = parseInt(params.get("price") || 0);
    
    if (titleEl) titleEl.innerText = params.get("title") || "Selected Stay";
    if (imgEl) imgEl.src = params.get("img") || "";
    if (priceNightEl) priceNightEl.innerText = `₹${pricePerNight.toLocaleString()} / night`;


    // --- 3. DATE RESTRICTIONS ---
    checkinInput.min = today;
    checkoutInput.min = today;

    checkinInput.addEventListener("change", () => {
        if (checkinInput.value) {
            const nextDay = new Date(checkinInput.value);
            nextDay.setDate(nextDay.getDate() + 1);
            checkoutInput.min = nextDay.toISOString().split('T')[0];
            
            if (checkoutInput.value <= checkinInput.value) {
                checkoutInput.value = checkoutInput.min;
            }
        }
        updateSummary();
    });


    // --- 4. DYNAMIC PRICE CALCULATION ---
    function updateSummary() {
        const cin = new Date(checkinInput.value);
        const cout = new Date(checkoutInput.value);
        const rooms = parseInt(roomsInput.value) || 1;

        if (cin && cout && cout > cin) {
            const nights = Math.ceil((cout - cin) / (1000 * 3600 * 24));
            
            const baseAmount = nights * pricePerNight * rooms;
            const serviceFee = baseAmount * 0.05; // 5% Fee
            const total = baseAmount + serviceFee;

            // Update the UI breakdown
            if(nightCountEl) nightCountEl.innerText = nights;
            if(roomDisplayEl) roomDisplayEl.innerText = rooms;
            if(basePriceEl) basePriceEl.innerText = `₹${baseAmount.toLocaleString()}`;
            if(serviceFeeEl) serviceFeeEl.innerText = `₹${serviceFee.toLocaleString()}`;
            if(finalAmountEl) finalAmountEl.innerText = `₹${total.toLocaleString()}`;
        }
    }

    // Attach listeners so price updates instantly
    [checkoutInput, roomsInput, adultsInput].forEach(input => {
        if(input) input.addEventListener("change", updateSummary);
    });


    // --- 5. SUBMIT TO DATABASE ---
    document.getElementById("booking-form").addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Define the variables that were missing!
        const roomCount = parseInt(roomsInput.value) || 1;
        const adultCount = parseInt(adultsInput.value) || 1;
        const finalPrice = finalAmountEl.innerText;

        // Validation 1: Blank Dates
        if (finalPrice === "₹0" || finalPrice === "") {
            alert("Please select valid check-in and check-out dates.");
            return;
        }

        // Validation 2: Capacity Check (Max 4 adults per room)
        if (adultCount > roomCount * 4) {
            alert(`Capacity Error: You have ${adultCount} adults but only ${roomCount} room(s). Max 4 adults per room allowed.`);
            return;
        }

        const bookingData = {
            guest_name: document.querySelector('input[type="text"]').value,
            email: document.querySelector('input[type="email"]').value,
            hotel_title: titleEl.innerText,
            checkin: checkinInput.value,
            checkout: checkoutInput.value,
            rooms: roomCount,
            adults: adultCount,
            final_amount: finalPrice
        };

        // Send to Live PythonAnywhere Backend
        fetch('https://saffronsuites.pythonanywhere.com/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        })
        .then(res => {
            if (!res.ok) throw new Error("Server not responding");
            return res.json();
        })
        .then(data => {
            if(data.status === "success") {
                // The Confirmation Message & Redirect
                alert("Booking confirmed!");
                window.location.href = "index.html";
            } else {
                alert("Database Error: " + data.message);
            }
        })
        .catch(error => {
            console.error("Connection Error:", error);
            alert("Could not connect to the live database on PythonAnywhere.");
        });
    });
});