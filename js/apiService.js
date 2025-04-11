class ApiService {
    constructor(baseUrl = 'http://localhost:3000/api') {
      this.baseUrl = baseUrl;
    }
  
    async getTrucks() {
      try {
        const response = await fetch(`${this.baseUrl}/trucks`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
      } catch (error) {
        console.error('Error fetching trucks:', error);
        // Fallback to local data if API fails
        return this.getLocalTrucks();
      }
    }
  
    getLocalTrucks() {
      // Sample local data (in a production system, data management should be handled via a database)
      return [
        { id: 1, name: 'Isuzu NPR 71', type: 'truck', price: 1200000, year: 2018, featured: true, images: ['img/1.jpg', 'img/2.jpg'] },
        { id: 2, name: 'Mitsubishi Fuso', type: 'lorry', price: 1800000, year: 2017, featured: true, images: ['img/3.jpg', 'img/4.jpg'] },
        { id: 3, name: 'Mercedes Actros', type: 'truck', price: 3500000, year: 2019, featured: false, images: ['img/5.jpg', 'img/6.jpg'] },
        { id: 4, name: 'MAN TGS', type: 'truck', price: 2800000, year: 2016, featured: false, images: ['img/7.jpg', 'img/8.jpg'] },
        { id: 5, name: 'Scania P-series', type: 'truck', price: 4200000, year: 2020, featured: true, images: ['img/9.jpg', 'img/10.jpg'] },
        { id: 6, name: 'Volvo FH16', type: 'truck', price: 5000000, year: 2018, featured: false, images: ['img/11.jpg', 'img/default-truck.jpg'] }
      ];
    }
  
    async submitInquiry(data) {
      try {
        const response = await fetch(`${this.baseUrl}/inquiries`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to submit inquiry');
        return await response.json();
      } catch (error) {
        console.error('Error submitting inquiry:', error);
        return { success: false, message: 'Failed to submit inquiry' };
      }
    }
  }
  
  // Expose the service globally
  window.apiService = new ApiService();
  