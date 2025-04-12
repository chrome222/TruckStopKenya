class ApiService {
    constructor(baseUrl = 'http://localhost:3000/api') {
      this.baseUrl = baseUrl;
    }
  
    async getTrucks() {
      try {
        const response = await fetch('content/trucks.json');
        if (!response.ok) throw new Error('Failed to load truck data');
        return await response.json();
      } catch (error) {
        console.error('Error loading truck data:', error);
        return []; // Return empty array if JSON file fails to load
      }
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
  