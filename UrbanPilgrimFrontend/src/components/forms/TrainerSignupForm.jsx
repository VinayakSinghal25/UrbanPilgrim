import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { signupTrainer } from '../../api/auth';
import { authStart, authSuccess, authFailure } from '../../slices/authSlice';

export default function TrainerSignupForm({ onSuccess }) {
  const [form, setForm] = useState({
    name: '', email: '', password: '', contactNumber: '',
    languages: [], daysActive: [], timeSlots: '', chargesPerStudent: '', expertise: '',
  });
  const [profilePictures, setProfilePictures] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.auth);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFileChange = e => setProfilePictures([...e.target.files]);
  const handleMultiChange = (e, key) => setForm({ ...form, [key]: Array.from(e.target.selectedOptions, o => o.value) });

  const handleSubmit = async e => {
    e.preventDefault();
    dispatch(authStart());
    const data = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach(val => data.append(k, val));
      else data.append(k, v);
    });
    profilePictures.forEach(file => data.append('profilePictures', file));
    const res = await signupTrainer(data);
    if (res.token) {
      dispatch(authSuccess({ user: res.user, token: res.token }));
      if (onSuccess) onSuccess(res);
      else navigate('/profile');
    } else {
      dispatch(authFailure(res.message || 'Signup failed'));
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* ...inputs as before... */}
      <input className="input" name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
      <input className="input" name="contactNumber" placeholder="Contact Number" value={form.contactNumber} onChange={handleChange} />
      <select className="input" name="languages" multiple onChange={e => handleMultiChange(e, 'languages')}>
        <option value="English">English</option>
        <option value="Hindi">Hindi</option>
        <option value="Spanish">Spanish</option>
        <option value="French">French</option>
      </select>
      <select className="input" name="daysActive" multiple onChange={e => handleMultiChange(e, 'daysActive')}>
        <option value="Monday">Monday</option>
        <option value="Tuesday">Tuesday</option>
        <option value="Wednesday">Wednesday</option>
        <option value="Thursday">Thursday</option>
        <option value="Friday">Friday</option>
        <option value="Saturday">Saturday</option>
        <option value="Sunday">Sunday</option>
      </select>
      <input className="input" name="timeSlots" placeholder="Time Slots (comma separated)" value={form.timeSlots} onChange={handleChange} />
      <input className="input" name="chargesPerStudent" type="number" placeholder="Charges Per Student" value={form.chargesPerStudent} onChange={handleChange} />
      <input className="input" name="expertise" placeholder="Expertise (IDs, comma separated)" value={form.expertise} onChange={handleChange} />
      <input className="input" type="file" multiple accept="image/*" onChange={handleFileChange} />
      {error && <div className="text-red-500">{error}</div>}
      <button className="btn w-full" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up as Trainer'}</button>
    </form>
  );
}