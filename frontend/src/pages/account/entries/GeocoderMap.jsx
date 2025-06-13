import React, { useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';

const YANDEX_API_KEY = '27861ba2-1edf-4ada-9c93-c277cf2a043a';

const GeocoderMap = () => {
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState([55.75, 37.57]); // Москва по умолчанию
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setAddress('');
    try {
      const response = await fetch(
        `https://geocode-maps.yandex.ru/1.x/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            apikey: YANDEX_API_KEY,
            format: 'json',
            geocode: query
          })
        }
      );
      const data = await response.json();
      const firstResult = data.response.GeoObjectCollection.featureMember[0];
      if (firstResult) {
        const pos = firstResult.GeoObject.Point.pos.split(' ').map(Number);
        setCoords([pos[1], pos[0]]);
        setAddress(firstResult.GeoObject.metaDataProperty.GeocoderMetaData.text);
      } else {
        setError('Ничего не найдено. Попробуйте другой запрос.');
      }
    } catch {
      setError('Ошибка поиска. Проверьте соединение.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex mb-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Введите адрес или место"
          className="flex-1 p-2 border border-neutral-300 rounded-l"
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-r">
          Поиск
        </button>
      </form>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="mb-2">{address && <div>Найдено: {address}</div>}</div>
      <div style={{ height: 350 }}>
        <YMaps>
          <Map defaultState={{ center: coords, zoom: 15 }} state={{ center: coords, zoom: 15 }} width="100%" height="100%">
            <Placemark geometry={coords} />
          </Map>
        </YMaps>
      </div>
    </div>
  );
};

export default GeocoderMap; 