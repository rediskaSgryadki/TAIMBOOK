const token = localStorage.getItem('accessToken');
console.log('Token for PIN verification:', token ? 'Token exists' : 'No token');
try {
  const response = await axios.post('http://localhost:8000/api/users/verify-pin/', { pin }, {
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