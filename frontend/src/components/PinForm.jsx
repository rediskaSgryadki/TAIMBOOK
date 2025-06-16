const token = localStorage.getItem('accessToken');
console.log('Token for PIN verification:', token ? 'Token exists' : 'No token');
const API_BASE_URL = process.env.REACT_APP_API_URL;
try {
  const response = await axios.post(`${API_BASE_URL}/api/users/verify-pin/`, { pin }, {
    headers: { Authorization: `Bearer ${token}` }
  });
} catch (error) {
  console.error('PIN verification error:', error);
  if (error.response?.status === 401) {
    alert('Сессия истекла. Пожалуйста, войдите снова.');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  } else {
    setError('Ошибка проверки PIN-кода. Попробуйте снова.');
  }
  setLoading(false);
} 