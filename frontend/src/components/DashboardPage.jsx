import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { FaBook, FaDownload, FaHistory, FaSignOutAlt, FaUpload, FaFileAlt, FaGraduationCap, FaRegLightbulb, FaCogs, FaLayerGroup } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const templates = ['Anna University', 'Autonomous', 'Internal Assessment'];
const languages = ['English', 'Tamil'];
const versions = ['A', 'B', 'C'];

const subjectKeywords = [
  { keyword: 'calculus', subject: 'Engineering Mathematics' },
  { keyword: 'thermodynamics', subject: 'Thermal Engineering' },
  { keyword: 'circuits', subject: 'Electrical Engineering' },
  { keyword: 'programming', subject: 'Computer Science' },
  { keyword: 'algorithms', subject: 'Computer Science' },
  { keyword: 'material', subject: 'Material Science' },
  { keyword: 'mechanics', subject: 'Engineering Mechanics' },
];

const defaultSampleMaterial = `This sample material covers engineering concepts including calculus, circuits, algorithms, and mechanics.

Engineering Mathematics: Solve derivatives, integrals, and differential equations.
Electrical Engineering: Analyze a simple RC circuit, compute current and voltage drops.
Computer Science: Explain greedy algorithms, binary search, and data structures.
Mechanical Engineering: Describe stress, strain, and forces in a beam.
`;

function detectSubject(text) {
  const lower = text.toLowerCase();
  const match = subjectKeywords.find((entry) => lower.includes(entry.keyword));
  return match ? match.subject : 'Engineering Mathematics';
}

function estimateTime(numberOfQuestions, difficulty) {
  const factor = difficulty === 'Hard' ? 5 : difficulty === 'Medium' ? 4 : 3;
  return numberOfQuestions * factor;
}

function CoverageMeter({ coverage }) {
  return (
    <div className="coverage-meter">
      <div className="coverage-progress" style={{ width: `${coverage}%` }} />
      <span>{coverage}% coverage</span>
    </div>
  );
}

function Confetti({ show }) {
  if (!show) return null;
  return (
    <div className="confetti-container" aria-hidden="true">
      {Array.from({ length: 40 }).map((_, index) => (
        <span key={index} className="confetti-piece" style={{ '--idx': index }} />
      ))}
    </div>
  );
}

function SkeletonBlock() {
  return (
    <div className="skeleton-block shimmer">
      <div className="skeleton-title" />
      <div className="skeleton-line" />
      <div className="skeleton-line short" />
      <div className="skeleton-line" />
    </div>
  );
}

export default function DashboardPage({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('MCQ');
  const [difficulty, setDifficulty] = useState('Medium');
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [template, setTemplate] = useState('Anna University');
  const [language, setLanguage] = useState('English');
  const [version, setVersion] = useState('A');
  const [subject, setSubject] = useState('Engineering Mathematics');
  const [paper, setPaper] = useState('');
  const [answerKey, setAnswerKey] = useState('');
  const [history, setHistory] = useState([]);
  const [autoMode, setAutoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatingAnswerKey, setGeneratingAnswerKey] = useState(false);
  const [message, setMessage] = useState('Upload your study material to begin.');
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    axios.get('/api/history').then((res) => setHistory(res.data || [])).catch(() => setHistory([]));
  }, []);

  useEffect(() => {
    if (paper) {
      const timer = setTimeout(() => setAudio(null), 2400);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [paper]);

  const handleFileChange = async (event) => {
    const uploaded = event.target.files?.[0] || null;
    setFile(uploaded);
    setPaper('');
    setAnswerKey('');
    setMessage('');

    if (uploaded) {
      const text = await uploaded.text().catch(() => '');
      const detected = detectSubject(text);
      setSubject(detected);
      setMessage('Ready to generate. Click Generate Question Paper.');
    }
  };

  const handleGenerate = async (e, options = {}) => {
    e?.preventDefault?.();
    const currentFile = options.fileOverride || file;
    const currentSubject = options.subjectOverride || subject;

    if (!currentFile) {
      setMessage('Please upload a study material file first.');
      return;
    }

    setLoading(true);
    setMessage('Generating your premium question paper...');
    const formData = new FormData();
    formData.append('study_material', currentFile);
    formData.append('question_type', questionType);
    formData.append('difficulty', difficulty);
    formData.append('number_of_questions', String(numberOfQuestions));
    formData.append('template', template);
    formData.append('language', language);
    formData.append('version', version);
    formData.append('subject', currentSubject);
    formData.append('student_name', user?.name || 'User');
    formData.append('department', 'CSE');
    formData.append('estimated_time', String(estimateTime(numberOfQuestions, difficulty)));
    formData.append('auto_generate_answer_key', options.autoAnswerKey ? 'true' : 'false');

    try {
      const res = await axios.post('/api/generate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPaper(res.data.question_paper || '');
      setAnswerKey(res.data.answer_key || '');
      setMessage('Question paper generated successfully!');
      if (res.data.answer_key) {
        setMessage('Question paper and answer key generated successfully!');
      }
      setAudio('success');
      axios.get('/api/history').then((res) => setHistory(res.data || [])).catch(() => setHistory([]));
    } catch (err) {
      setMessage(err.response?.data?.error || 'Generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAnswerKey = async () => {
    if (!paper) {
      setMessage('Generate a paper first before creating an answer key.');
      return;
    }
    setGeneratingAnswerKey(true);
    setMessage('Generating the answer key...');

    try {
      const res = await axios.post('/api/answer-key', {
        question_paper: paper,
        language,
      });
      setAnswerKey(res.data.answer_key || '');
      setMessage('Answer key generated successfully.');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Answer key generation failed.');
    } finally {
      setGeneratingAnswerKey(false);
    }
  };

  const handleResetAutoRun = () => {
    setAutoMode(false);
    setFile(null);
    setPaper('');
    setAnswerKey('');
    setMessage('Reset complete. Upload material and click Generate.');
  };

  const handleDownload = async (format) => {
    try {
      const response = await axios.post(`/api/download/${format}`, { content: paper, title: `Question Paper - ${template} (${version})` }, { responseType: 'blob' });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = format === 'pdf' ? 'question_paper.pdf' : 'question_paper.docx';
      link.click();
      window.URL.revokeObjectURL(url);
      setMessage(`Downloaded ${format.toUpperCase()} file.`);
    } catch (err) {
      setMessage('Download failed.');
    }
  };

  const coverage = useMemo(() => {
    const materialLength = file ? file.size / 1000 : 1;
    const score = Math.min(100, Math.round(Math.max(10, numberOfQuestions * 10 + (materialLength > 5 ? 10 : 0))));
    return score;
  }, [file, numberOfQuestions]);

  const stats = useMemo(() => ({
    generated: history.length,
    pending: paper ? 0 : 1,
    estimatedTime: estimateTime(numberOfQuestions, difficulty),
  }), [history.length, paper, numberOfQuestions, difficulty]);

  return (
    <div className="dashboard-shell premium-shell">
      <Confetti show={!!paper && !loading} />
      <aside className="sidebar">
        <div className="brand-card">
          <FaGraduationCap size={32} />
          <div>
            <h2>REC</h2>
            <p>{role === 'faculty' ? 'Faculty Portal' : 'Student Portal'}</p>
          </div>
        </div>
        <nav>{['Dashboard', 'Generate Questions', 'History', 'Downloads', 'Settings'].map((item) => <button key={item} className="nav-btn">{item}</button>)}</nav>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}><FaSignOutAlt /> Logout</button>
      </aside>
      <main className="dashboard-main">
        <header className="topbar neon-header">
          <div>
            <p className="eyebrow">Rajalakshmi Engineering College</p>
            <h1>{role === 'faculty' ? 'FACULTY EXAM GENERATOR' : 'STUDENT EXAM GENERATOR'}</h1>
            <span className="page-label">{template} | {version} | {language}</span>
          </div>
          <div className="user-chip">
            <span>{user?.name || 'Student'}</span>
            <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
          </div>
        </header>

        <div className="content-grid">
          <div className="control-column">
            <section className="cards-grid">
              <motion.div className="glass-card" whileHover={{ y: -4 }}>
                <div className="card-heading"><FaUpload className="card-icon" /><h3>Upload Study Material</h3></div>
                <input type="file" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
                <p className="small-text">Supports text preview and subject detection.</p>
              </motion.div>

              <motion.div className="glass-card" whileHover={{ y: -4 }}>
                <div className="card-heading"><FaFileAlt className="card-icon" /><h3>Paper Settings</h3></div>
                <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
                  <option value="MCQ">MCQ</option>
                  <option value="2 Marks">2 Marks</option>
                  <option value="5 Marks">5 Marks</option>
                  <option value="13 Marks">13 Marks</option>
                </select>
                <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <input type="number" min="1" max="20" value={numberOfQuestions} onChange={(e) => setNumberOfQuestions(Number(e.target.value))} />
              </motion.div>

              <motion.div className="glass-card" whileHover={{ y: -4 }}>
                <div className="card-heading"><FaLayerGroup className="card-icon" /><h3>Template + Version</h3></div>
                <select value={template} onChange={(e) => setTemplate(e.target.value)}>{templates.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                <select value={language} onChange={(e) => setLanguage(e.target.value)}>{languages.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                <select value={version} onChange={(e) => setVersion(e.target.value)}>{versions.map((value) => <option key={value} value={value}>{value}</option>)}</select>
              </motion.div>

              <motion.div className="glass-card" whileHover={{ y: -4 }}>
                <div className="card-heading"><FaCogs className="card-icon" /><h3>AI Intelligence</h3></div>
                <p className="small-text">Detected subject:</p>
                <strong>{subject}</strong>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject name" />
                <label className="toggle-row">
                  <input type="checkbox" checked={autoMode} onChange={(e) => setAutoMode(e.target.checked)} disabled={!file} />
                  <span>Auto Generate</span>
                </label>
                <p className="small-text">Auto Generate is disabled until study material is uploaded.</p>
              </motion.div>
            </section>

            <section className="action-row">
              <button type="button" className="primary-btn" onClick={handleGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate Question Paper'}</button>
              <button type="button" className="secondary-btn" onClick={handleResetAutoRun} disabled={loading}>Reset Auto Run</button>
              <div className="metric-pill"><FaRegLightbulb /> Estimated Time: {stats.estimatedTime} mins</div>
              <CoverageMeter coverage={coverage} />
            </section>

            {message ? <div className="toast">{message}</div> : null}
          </div>

          <div className="output-column">
            <section className="results-panel">
              <div className="results-header">
                <h3>Generated Question Paper</h3>
                <div>
                  <button className="secondary-btn" onClick={() => handleDownload('pdf')} disabled={!paper || loading}>Download PDF</button>
                  <button className="secondary-btn" onClick={() => handleDownload('docx')} disabled={!paper || loading}>Download DOCX</button>
                </div>
              </div>
              {loading ? <SkeletonBlock /> : <pre className="question-paper">{paper || 'Your generated questions will appear here.'}</pre>}
              {paper ? (
                <button className="secondary-btn" onClick={handleGenerateAnswerKey} disabled={generatingAnswerKey}>{generatingAnswerKey ? 'Generating Answer Key...' : 'Generate Answer Key'}</button>
              ) : null}
              {answerKey ? (
                <div className="answer-key">
                  <h4>Answer Key</h4>
                  <div className="question-paper">
                    <pre>{answerKey}</pre>
                  </div>
                </div>
              ) : null}
            </section>

            <section className="history-panel">
              <div className="history-header"><h3>Recent History</h3><span>{history.length} entries</span></div>
              <ul>{history.slice(0, 5).map((entry) => (
                <li key={entry._id}>
                  <strong>{entry.question_type}</strong> · {entry.difficulty} · {entry.subject} · {entry.template} {entry.version}
                  {entry.run_mode === 'auto' ? <span className="history-badge">Auto Run</span> : null}
                </li>
              ))}</ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
