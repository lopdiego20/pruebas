export default {
  getToken() {
    return localStorage.getItem('token');
  },
  
  isAuthenticated() {
    return !!this.getToken();
  },
  
  logout() {
    localStorage.removeItem('token');
    window.location = '/login';
  }
};