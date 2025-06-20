import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { useState } from 'react';
import { signupUser } from '../../api/auth';
// import your registerUser API
import { authStart, authSuccess, authFailure } from '../../slices/authSlice';

export default function UserSignupForm() {
const [form, setForm] = useState({ email: '', password: '', name: '' });
const dispatch = useDispatch();
const navigate = useNavigate();
const { loading, error } = useSelector(state => state.auth);

const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

const handleSubmit = async e => {
e.preventDefault();
dispatch(authStart());
// Replace with your actual register API
const res = await signupUser(form);
if (res.token) {
dispatch(authSuccess({ user: res.user, token: res.token }));
navigate('/profile');
} else {
dispatch(authFailure(res.message || 'Signup failed'));
}
};

return (
<form className="space-y-4" onSubmit={handleSubmit}>
<input className="input" name="name" type="text" placeholder="Name" value={form.name} onChange={handleChange} required />
<input className="input" name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
<input className="input" name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
{error && <div className="text-red-500">{error}</div>}
<button className="btn w-full" type="submit" disabled={loading}>{loading ? 'Signing up...' : 'Sign Up'}</button>
</form>
);
}