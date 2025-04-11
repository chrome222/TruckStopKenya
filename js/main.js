document.addEventListener('DOMContentLoaded', async function () {
  let trucks = [];
  let currentPage = 1;
  const TRUCKS_PER_PAGE = 3;
  const truckContainer = document.getElementById('truck-container');
  const typeFilter = document.getElementById('type-filter');
  const priceFilter = document.getElementById('price-filter');
  const spinner = document.getElementById('loading-spinner');
  const modal = document.getElementById('truckModal');
  let currentTruckId = null;

  // Debounce utility
  function debounce(fn, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  // URL Parameter Handling
  function updateURLParams(type, price) {
    const params = new URLSearchParams(window.location.search);
    params.set('type', type);
    params.set('price', price);
    history.replaceState({}, '', `${location.pathname}?${params.toString()}`);
  }
  function loadFiltersFromURL() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('type')) typeFilter.value = params.get('type');
    if (params.has('price')) priceFilter.value = params.get('price');
  }

  // Pagination
  function paginateTrucks(data) {
    const start = (currentPage - 1) * TRUCKS_PER_PAGE;
    return data.slice(start, start + TRUCKS_PER_PAGE);
  }

  // Loading Data
  async function loadTrucks() {
    try {
      spinner.classList.remove('hidden');
      trucks = await apiService.getTrucks();
    } catch (error) {
      alert('Failed to load trucks. Please try again later.');
    } finally {
      spinner.classList.add('hidden');
      loadFiltersFromURL();
      filterTrucks();
    }
  }

  // Rendering Truck Cards
  function displayTrucks(list) {
    truckContainer.innerHTML = '';
    const paginated = paginateTrucks(list);
    if (!paginated.length) {
      truckContainer.innerHTML = '<p class="no-results text-center text-gray-600">No trucks match your filters.</p>';
      return;
    }
    paginated.forEach(truck => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition transform hover:-translate-y-1';
      card.innerHTML = `
        <div class="truck-images relative h-48 overflow-hidden">
          <div class="truck-image active absolute inset-0 bg-cover bg-center" style="background-image: url('${truck.images[0]}')"></div>
          <div class="truck-image absolute inset-0 bg-cover bg-center" style="background-image: url('${truck.images[1]}')"></div>
          <div class="image-nav absolute bottom-2 right-2 flex gap-2">
            <button class="prev-image p-1 bg-gray-700 bg-opacity-50 text-white rounded focus:outline-none">&larr;</button>
            <button class="next-image p-1 bg-gray-700 bg-opacity-50 text-white rounded focus:outline-none">&rarr;</button>
          </div>
        </div>
        <div class="p-4">
          <div class="flex justify-between items-center mb-2">
            <h3 class="text-lg font-bold">${truck.name}</h3>
            ${truck.featured ? `<span class="bg-brand text-white text-xs px-2 py-1 rounded">Featured</span>` : ''}
          </div>
          <p class="text-gray-600 text-sm">Year: ${truck.year}</p>
          <p class="text-gray-600 text-sm mb-2">Type: ${truck.type}</p>
          <p class="text-xl font-bold text-brand mb-4">KSh ${truck.price.toLocaleString()}</p>
          <button class="btn view-details-btn bg-brand text-white px-4 py-2 rounded w-full" data-id="${truck.id}">
            View Details
          </button>
        </div>
      `;
      truckContainer.appendChild(card);

      // Image slider functionality for card
      const images = card.querySelectorAll('.truck-image');
      const prev = card.querySelector('.prev-image');
      const next = card.querySelector('.next-image');
      let currentImage = 0;
      const showImage = idx => images.forEach((img, index) => img.classList.toggle('active', index === idx));
      prev.onclick = e => { e.stopPropagation(); currentImage = (currentImage - 1 + images.length) % images.length; showImage(currentImage); };
      next.onclick = e => { e.stopPropagation(); currentImage = (currentImage + 1) % images.length; showImage(currentImage); };
      showImage(0);
    });
    // Pagination Controls
    const totalPages = Math.ceil(list.length / TRUCKS_PER_PAGE);
    const paginationNav = document.createElement('div');
    paginationNav.className = 'flex justify-center items-center gap-4 mt-6';
    if (currentPage > 1) {
      const prevBtn = document.createElement('button');
      prevBtn.className = 'btn';
      prevBtn.textContent = 'Previous';
      prevBtn.onclick = () => { currentPage--; displayTrucks(list); };
      paginationNav.appendChild(prevBtn);
    }
    if (currentPage < totalPages) {
      const nextBtn = document.createElement('button');
      nextBtn.className = 'btn';
      nextBtn.textContent = 'Next';
      nextBtn.onclick = () => { currentPage++; displayTrucks(list); };
      paginationNav.appendChild(nextBtn);
    }
    truckContainer.appendChild(paginationNav);
  }

  // Filter Logic (with debounce)
  function filterTrucks() {
    const selectedType = typeFilter.value;
    const selectedPrice = priceFilter.value;
    updateURLParams(selectedType, selectedPrice);
    const filtered = trucks.filter(truck => {
      if (selectedType !== 'all' && truck.type !== selectedType) return false;
      if (selectedPrice === '1' && truck.price >= 1000000) return false;
      if (selectedPrice === '2' && (truck.price < 1000000 || truck.price > 2000000)) return false;
      if (selectedPrice === '3' && truck.price <= 2000000) return false;
      return true;
    });
    currentPage = 1;
    displayTrucks(filtered);
  }
  typeFilter.addEventListener('change', debounce(filterTrucks, 300));
  priceFilter.addEventListener('change', debounce(filterTrucks, 300));

  // Modal Management and Focus Trap
  let currentModalImageIndex = 0;
  function openModal(truck) {
    currentTruckId = truck.id;
    document.getElementById('modalTruckName').textContent = truck.name;
    document.getElementById('modalTruckType').textContent = truck.type;
    document.getElementById('modalTruckYear').textContent = truck.year;
    document.getElementById('modalTruckPrice').textContent = 'KSh ' + truck.price.toLocaleString();
    document.getElementById('modalTruckMileage').textContent = truck.mileage || 'N/A';
    document.getElementById('modalTruckCondition').textContent = truck.condition || 'Excellent';
    document.getElementById('modalTruckFeatures').textContent = truck.features || 'Standard features';

    // Set up the modal image slider
    const modalImages = truck.images;
    currentModalImageIndex = 0;
    const modalSliderImage = document.getElementById('modalSliderImage');
    modalSliderImage.src = modalImages[currentModalImageIndex];

    document.getElementById('modalPrevImage').onclick = (e) => {
      e.stopPropagation();
      currentModalImageIndex = (currentModalImageIndex - 1 + modalImages.length) % modalImages.length;
      modalSliderImage.src = modalImages[currentModalImageIndex];
    };
    document.getElementById('modalNextImage').onclick = (e) => {
      e.stopPropagation();
      currentModalImageIndex = (currentModalImageIndex + 1) % modalImages.length;
      modalSliderImage.src = modalImages[currentModalImageIndex];
    };

    // Prepare WhatsApp URL
    const message = `Hello, I'm interested in the ${truck.name} (${truck.year}) priced at KSh ${truck.price.toLocaleString()}. Please provide more details.`;
    const encodedMessage = encodeURIComponent(message);
    const waNumber = "254717723371"; // update to your WhatsApp number if needed
    const waURL = `https://wa.me/${waNumber}?text=${encodedMessage}`;
    document.getElementById('whatsAppInquiry').href = waURL;

    // Show modal and focus the WhatsApp button
    modal.classList.remove('hidden');
    const focusableElements = modal.querySelectorAll('button, [href], input, textarea');
    if (focusableElements.length) {
      focusableElements[0].focus();
    }
    setTimeout(() => {
      modal.classList.remove('opacity-0');
      modal.querySelector('div').classList.remove('scale-95', 'opacity-0');
    }, 10);
  }
  
  // Close Modal and Remove Focus Trap
  function closeModal() {
    modal.classList.add('opacity-0');
    modal.querySelector('div').classList.add('scale-95', 'opacity-0');
    setTimeout(() => { modal.classList.add('hidden'); }, 300);
  }
  document.addEventListener('click', event => {
    const detailsBtn = event.target.closest('.view-details-btn');
    if (detailsBtn) {
      const truckId = parseInt(detailsBtn.dataset.id, 10);
      const truck = trucks.find(t => t.id === truckId);
      if (truck) openModal(truck);
    }
  });
  document.getElementById('closeModal').addEventListener('click', closeModal);
  modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });

  // Simple focus trap inside the modal
  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusable = Array.from(modal.querySelectorAll('button, [href], input, textarea')).filter(el => !el.disabled);
      if (focusable.length === 0) return;
      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  });

  // Initial load of truck data
  await loadTrucks();
});
