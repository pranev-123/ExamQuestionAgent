import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaLock, FaEnvelope } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.endsWith('@rajalakshmi.edu.in')) {
      setError('Only Rajalakshmi Engineering College email is allowed.');
      return;
    }
    if (password !== 'Rec@123') {
      setError('Invalid password. Use the demo password Rec@123.');
      return;
    }
    login({ email, name: email.split('@')[0], role });
    navigate(role === 'faculty' ? '/faculty-dashboard' : '/student-dashboard');
  };

  return (
    <div className="auth-shell">
      <div className="bg-orb orb-1" />
      <div className="bg-orb orb-2" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="auth-card">
        <div className="auth-brand">
          <FaGraduationCap size={44} />
          <div>
            <h1>REC Portal</h1>
            <p>Adaptive Examination Question Generator</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <label className="input-group">
            <FaEnvelope />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="yourname@rajalakshmi.edu.in" required />
          </label>
          <label className="input-group">
            <FaLock />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Rec@123" required />
          </label>
          <div className="role-select">
            <label>
              <input type="radio" name="role" value="student" checked={role === 'student'} onChange={() => setRole('student')} /> Student
            </label>
            <label>
              <input type="radio" name="role" value="faculty" checked={role === 'faculty'} onChange={() => setRole('faculty')} /> Faculty
            </label>
          </div>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="primary-btn" type="submit">Login</button>
          <Link className="secondary-link" to="/register">Create account</Link>
        </form>
      </motion.div>
    </div>
  );
}
