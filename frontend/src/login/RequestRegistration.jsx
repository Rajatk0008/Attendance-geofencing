import { useState, useRef, useEffect } from 'react';

const RequestRegistrationForm = () => {
  const [form, setForm] = useState({ name: '', email: '' });
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (cameraOpen) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Webcam error:', err);
          setStatus('❌ Cannot access webcam.');
        });
    }

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraOpen]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const captureImage = () => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/png');
    setImage(imageData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/request-registration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, image }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Submission failed');
      }

      setStatus(data.message);
      setForm({ name: '', email: '' });
      setImage(null);
      setCameraOpen(false);
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
        {!cameraOpen ? (
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            className="w-full py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
          >
            📷 Open Camera
          </button>
        ) : (
          <>
            <video ref={videoRef} autoPlay className="w-full h-60 bg-black rounded mb-2" />
            <button
              type="button"
              onClick={captureImage}
              className="w-full py-2 mb-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
              📸 Capture Photo
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </>
        )}

        {image && (
          <div className="mt-4">
            <p className="text-sm mb-2">Captured Image Preview:</p>
            <img src={image} alt="Captured" className="w-full rounded border" />
          </div>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        disabled={!image}
      >
        Submit Request
      </button>

      {status && <p className="mt-4 text-sm text-center text-gray-600">{status}</p>}
    </form>
  );
};

export default RequestRegistrationForm;
