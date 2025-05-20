import { useState } from 'react';

const RequestRegistrationForm = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [image, setImage] = useState(null); // State for image file
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Store selected image file
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      // Convert image to base64 if provided
      let imageBase64 = '';
      if (image) {
        const reader = new FileReader();
        reader.readAsDataURL(image);
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
        });
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image: imageBase64 }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }
      setStatus(data.message);
      setForm({ name: '', email: '' });
      setImage(null);
    } catch (err) {
      setStatus(`❌ ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-6 bg-white rounded shadow mx-auto">
      <h2 className="text-xl font-semibold mb-4">Request Registration</h2>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Name</label>
        <input
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div className="mb-4">
        <label className="block mb-1 font-medium">Face Photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <button type="submit" className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
        Submit Request
      </button>
      {status && <p className="mt-4 text-sm text-center text-gray-600">{status}</p>}
    </form>
  );
};

export default RequestRegistrationForm;