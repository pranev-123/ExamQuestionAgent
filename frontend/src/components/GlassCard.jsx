import { motion } from 'framer-motion';
import { cloneElement } from 'react';

export default function GlassCard({ title, icon, children }) {
  return (
    <motion.div className="glass-card" whileHover={{ y: -4 }}>
      <div className="card-heading">
        {icon ? cloneElement(icon, { className: 'card-icon' }) : null}
        <h3>{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}
