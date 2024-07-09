const membershipPrices = {
    student: { name: 'IEEE Student Membership', usd: 14.00 },
    sight: { name: 'IEEE SIGHT Membership', usd: 0.00 },
    wie: { name: 'IEEE Women in Engineering Membership', usd: 0.00 },
    computer: { name: 'IEEE Computer Society Membership', usd: 4.00 },
    robotics: { name: 'IEEE Robotics and Automation Society Membership', usd: 5.00 },
    power: { name: 'IEEE Power & Energy Society Membership', usd: 1.00 },
    education: { name: 'IEEE Education Society Membership', usd: 1.00 },
    biometrics: { name: 'IEEE Biometrics Council', usd: 0.00 },
    eda: { name: 'IEEE Council on Electronic Design Automation', usd: 0.00 },
    rfid: { name: 'IEEE Council on RFID', usd: 0.00 },
    superconductivity: { name: 'IEEE Council on Superconductivity', usd: 0.00 },
    nanotechnology: { name: 'IEEE Nanotechnology Council', usd: 0.00 },
    sensors: { name: 'IEEE Sensors Council', usd: 0.00 },
    systems: { name: 'IEEE Systems Council', usd: 0.00 },
    transportation: { name: 'IEEE Transportation Electricity Council', usd: 0.00 }
};

const msbPackagePrice = {
    notebook: 1.04,
    pen: 0.42,
    badge: 0.21,
    tshirt: 3.13,
    id: 0.31
};

let basket = [];

async function fetchExchangeRate() {
    const response = await fetch('https://v6.exchangerate-api.com/v6/bed990a961f1150ae92d0ee0/latest/USD');
    const data = await response.json();
    return data.conversion_rates.EGP;
}

function addToBasket() {
    const subscriptionDate = new Date(document.getElementById('subscriptionDate').value);
    if (isNaN(subscriptionDate)) {
        alert("Please select a subscription date before adding items to the cart.");
        return;
    }

    const membershipTypeSelect = document.getElementById('membershipType');
    const selectedOptions = Array.from(membershipTypeSelect.selectedOptions);

    selectedOptions.forEach(option => {
        const membership = membershipPrices[option.value];
        const priceUSD = membership.usd;
        const existingMembership = basket.find(item => item.name === membership.name);

        if (existingMembership) {
            existingMembership.quantity += 1;
            existingMembership.priceUSD += priceUSD;
            existingMembership.originalPriceUSD += priceUSD;
        } else {
            basket.push({
                name: membership.name,
                priceUSD: priceUSD,
                originalPriceUSD: priceUSD,
                priceEGP: 0, // Placeholder, will be calculated
                quantity: 1,
                discountApplied: false
            });
        }
    });

    displayBasket();
}

function addMSBPackage() {
    const msbPackageName = 'IEEE MSB Package';
    const msbPackageTotalPrice = msbPackagePrice.notebook + msbPackagePrice.pen + msbPackagePrice.badge + msbPackagePrice.tshirt + msbPackagePrice.id;
    const existingMSBPackage = basket.find(item => item.name === msbPackageName);

    if (existingMSBPackage) {
        existingMSBPackage.quantity += 1;
        existingMSBPackage.priceUSD += msbPackageTotalPrice;
        existingMSBPackage.originalPriceUSD += msbPackageTotalPrice;
    } else {
        basket.push({
            name: msbPackageName,
            priceUSD: msbPackageTotalPrice,
            originalPriceUSD: msbPackageTotalPrice,
            priceEGP: 0, // Placeholder, will be calculated,
            quantity: 1,
            discountApplied: false
        });
    }

    displayBasket();
}

function removeFromBasket(index) {
    basket.splice(index, 1);
    displayBasket();
}

function displayBasket() {
    const basketList = document.getElementById('basketList');
    basketList.innerHTML = '';

    // Create a table structure
    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';

    basket.forEach((item, index) => {
        const row = document.createElement('tr');

        // Create name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        nameCell.style.padding = '5px';
        nameCell.style.borderBottom = '1px solid #ddd';

        // Create quantity cell
        const quantityCell = document.createElement('td');
        quantityCell.textContent = `x${item.quantity}`;
        quantityCell.style.padding = '5px';
        quantityCell.style.borderBottom = '1px solid #ddd';
        quantityCell.style.textAlign = 'center';

        // Create remove button cell
        const removeCell = document.createElement('td');
        const removeButton = document.createElement('button');
        removeButton.textContent = 'X';
        removeButton.className = 'remove-button';
        removeButton.onclick = () => removeFromBasket(index);
        removeButton.style.padding = '5px';
        removeButton.style.border = 'none';
        removeButton.style.backgroundColor = 'transparent';
        removeButton.style.color = 'red';
        removeButton.style.cursor = 'pointer';
        removeCell.appendChild(removeButton);
        removeCell.style.padding = '5px';
        removeCell.style.borderBottom = '1px solid #ddd';
        removeCell.style.textAlign = 'center';

        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(removeCell);
        table.appendChild(row);
    });

    basketList.appendChild(table);
}

async function calculateTotalPrice() {
    const subscriptionDate = new Date(document.getElementById('subscriptionDate').value);
    if (isNaN(subscriptionDate)) {
        alert("Please select a subscription date before calculating the price.");
        return;
    }

    const studentMembership = basket.find(item => item.name === 'IEEE Student Membership');
    if (!studentMembership) {
        alert("IEEE Student Membership must be in the cart before the price is calculated.");
        return;
    }

    const currentYear = new Date().getFullYear();
    const discountStartDate = new Date(currentYear, 2, 1); // March 1 of current year
    const discountEndDate = new Date(currentYear, 7, 15); // August 15 of current year
    const isDiscountPeriod = subscriptionDate >= discountStartDate && subscriptionDate <= discountEndDate;

    const exchangeRate = await fetchExchangeRate();
    let totalPriceUSD = 0;
    basket.forEach(item => {
        if (isDiscountPeriod && item.name !== 'IEEE MSB Package' && !item.discountApplied) {
            item.priceUSD = item.originalPriceUSD / 2;
            item.discountApplied = true;
        } else if (!isDiscountPeriod && item.discountApplied) {
            item.priceUSD = item.originalPriceUSD;
            item.discountApplied = false;
        }
        totalPriceUSD += item.priceUSD;
        item.priceEGP = (item.priceUSD * exchangeRate).toFixed(2);
    });

    const totalPriceEGP = (totalPriceUSD * exchangeRate).toFixed(2);

    document.getElementById('totalPrice').innerText = `Total Price in USD: $${totalPriceUSD.toFixed(2)}`;
    document.getElementById('totalPriceEGP').innerText = `Total Price in EGP: ${totalPriceEGP}`;
}

function clearBasket() {
    const studentMembership = {
        name: 'IEEE Student Membership',
        priceUSD: membershipPrices.student.usd,
        originalPriceUSD: membershipPrices.student.usd,
        priceEGP: 0, // Placeholder, will be calculated
        quantity: 1,
        discountApplied: false
    };
    basket = [studentMembership];
    document.getElementById('basketList').innerHTML = '';
    document.getElementById('totalPrice').innerText = 'Total Price in USD: ';
    document.getElementById('totalPriceEGP').innerText = 'Total Price in EGP: ';
    displayBasket();
}

function addZeroCostMemberships() {
    const zeroCostMemberships = [
        'sight', 'wie', 'biometrics', 'eda', 'rfid', 'superconductivity', 'nanotechnology', 'sensors', 'systems', 'transportation'
    ];

    zeroCostMemberships.forEach(membershipKey => {
        const membership = membershipPrices[membershipKey];
        const existingMembership = basket.find(item => item.name === membership.name);

        if (existingMembership) {
            existingMembership.quantity += 1;
        } else {
            basket.push({
                name: membership.name,
                priceUSD: membership.usd,
                originalPriceUSD: membership.usd,
                priceEGP: 0, // Placeholder, will be calculated
                quantity: 1,
                discountApplied: false
            });
        }
    });

    displayBasket();
}

function addFreeMemberships() {
    const freeMemberships = [
        'sight', 'wie', 'biometrics', 'eda', 'rfid', 'superconductivity', 'nanotechnology', 'sensors', 'systems', 'transportation'
    ];

    freeMemberships.forEach(membershipKey => {
        const membership = membershipPrices[membershipKey];
        const existingMembership = basket.find(item => item.name === membership.name);

        if (existingMembership) {
            existingMembership.quantity += 1;
        } else {
            basket.push({
                name: membership.name,
                priceUSD: membership.usd,
                originalPriceUSD: membership.usd,
                priceEGP: 0, // Placeholder, will be calculated
                quantity: 1,
                discountApplied: false
            });
        }
    });

    displayBasket();
}

function downloadBrochure() {
    const link = document.createElement('a');
    link.href = 'path/to/brochure.pdf'; // Replace with the actual path to the brochure
    link.download = 'IEEE_Membership_Benefits_Brochure.pdf';
    link.click();
}

function openWhatsAppChat() {
    const phoneNumber = '+201208044683';
    const message = 'Hello, I would like to get my IEEE membership.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

document.addEventListener('DOMContentLoaded', () => {
    // Add IEEE Student Membership by default
    const studentMembership = membershipPrices.student;
    basket.push({
        name: studentMembership.name,
        priceUSD: studentMembership.usd,
        originalPriceUSD: studentMembership.usd,
        priceEGP: 0, // Placeholder, will be calculated
        quantity: 1,
        discountApplied: false
    });

    // Set the default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('subscriptionDate').value = today;

    addZeroCostMemberships();
});
