const LocationPreview = ({ coords }) => {
  if (!coords) return null;
  return (
    <div style={{ fontSize: '0.9rem', marginTop: '10px', color: '#333' }}>
      📌 Location: {coords.lat.toFixed(4)}, {coords.lon.toFixed(4)}
    </div>
  );
};

export default LocationPreview;
