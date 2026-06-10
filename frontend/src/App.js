import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import './App.css';

const api = axios.create({ baseURL: 'http://localhost:3000' });

api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.access_token);
            window.location.href = '/admin-grades';
        } catch (err) {
            setError('Ошибка входа');
        }
    };

    return (
        <div className="container">
            <h2>Вход</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required /><br />
                <button type="submit">Войти</button>
            </form>
            <p>Нет аккаунта? <Link to="/register">Зарегистрироваться</Link></p>
        </div>
    );
}

function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [roleId, setRoleId] = useState(3);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', { email, password, roleId });
            setDone(true);
        } catch (err) {
            alert('Ошибка регистрации');
        }
    };

    if (done) return <div className="container"><p>Регистрация успешна! <Link to="/login">Войти</Link></p></div>;

    return (
        <div className="container">
            <h2>Регистрация</h2>
            <form onSubmit={handleSubmit}>
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required /><br />
                <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required /><br />
                <select value={roleId} onChange={e => setRoleId(Number(e.target.value))}>
                    <option value={3}>Студент</option>
                    <option value={2}>Преподаватель</option>
                    <option value={1}>Администратор</option>
                </select><br />
                <button type="submit">Зарегистрироваться</button>
            </form>
        </div>
    );
}

function UsersList() {
    const [users, setUsers] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRoleId, setNewRoleId] = useState(3);

    useEffect(() => {
        api.get('/users').then(res => setUsers(res.data)).catch(() => alert('Нет доступа'));
    }, []);

    const createUser = async () => {
        try {
            const res = await api.post('/users', { email: newEmail, password: newPassword, roleId: newRoleId });
            setUsers([...users, res.data]);
            setNewEmail('');
            setNewPassword('');
        } catch {
            alert('Ошибка создания');
        }
    };

    return (
        <div className="container">
            <h2>Пользователи</h2>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Выйти</button>

            <div className="create-form">
                <h3>Создать нового</h3>
                <input placeholder="Email" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                <input placeholder="Пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                <select value={newRoleId} onChange={e => setNewRoleId(Number(e.target.value))}>
                    <option value={3}>Студент</option>
                    <option value={2}>Преподаватель</option>
                    <option value={1}>Администратор</option>
                </select>
                <button onClick={createUser}>Создать</button>
            </div>

            <table className="user-list">
                <thead>
                    <tr><th>ID</th><th>Email</th><th>Роль</th></tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id}><td>{u.id}</td><td>{u.email}</td><td>{u.role_id}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function MyGrades() {
    const [grades, setGrades] = useState([]);

    useEffect(() => {
        api.get('/grades/my').then(res => setGrades(res.data)).catch(() => alert('Ошибка загрузки оценок'));
    }, []);

    return (
        <div className="container">
            <h2>Мои оценки</h2>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Выйти</button>
            <table className="user-list">
                <thead>
                    <tr><th>Предмет</th><th>Оценка</th><th>Дата</th></tr>
                </thead>
                <tbody>
                    {grades.map(g => (
                        <tr key={g.id}><td>{g.subject?.name || g.subject_id}</td><td>{g.grade}</td><td>{g.date}</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function AdminGrades() {
    const [grades, setGrades] = useState([]);
    const [studentId, setStudentId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [gradeValue, setGradeValue] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingGrade, setEditingGrade] = useState('');

    const token = localStorage.getItem('token');
    let roleId = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            roleId = payload.roleId || 0;
        } catch (e) { }
    }

    const loadGrades = () => {
        api.get('/grades').then(res => setGrades(res.data)).catch(() => alert('Ошибка'));
    };

    useEffect(() => {
        loadGrades();
    }, []);

    const addGrade = async () => {
        try {
            await api.post('/grades', { studentId: Number(studentId), subjectId: Number(subjectId), grade: Number(gradeValue) });
            loadGrades();
            setStudentId(''); setSubjectId(''); setGradeValue('');
        } catch {
            alert('Ошибка добавления оценки');
        }
    };

    const editGrade = async (id, newGrade) => {
        try {
            await api.put(`/grades/${id}`, { grade: Number(newGrade) });
            loadGrades();
            setEditingId(null);
            setEditingGrade('');
        } catch {
            alert('Ошибка обновления оценки');
        }
    };

    const deleteGrade = async (id) => {
        if (window.confirm('Удалить оценку?')) {
            try {
                await api.delete(`/grades/${id}`);
                loadGrades();
            } catch {
                alert('Ошибка удаления');
            }
        }
    };

    return (
        <div className="container">
            <h2>Управление оценками</h2>
            <button className="logout-btn" onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Выйти</button>

            {roleId === 1 && (
                <div className="create-form">
                    <h3>Добавить оценку</h3>
                    <input placeholder="ID студента" value={studentId} onChange={e => setStudentId(e.target.value)} />
                    <input placeholder="ID предмета" value={subjectId} onChange={e => setSubjectId(e.target.value)} />
                    <input placeholder="Оценка" value={gradeValue} onChange={e => setGradeValue(e.target.value)} />
                    <button onClick={addGrade}>Добавить</button>
                </div>
            )}

            <table className="user-list">
                <thead>
                    <tr><th>Студент</th><th>Предмет</th><th>Оценка</th><th>Дата</th><th>Действие</th><th>Удалить</th></tr>
                </thead>
                <tbody>
                    {grades.map(g => (
                        <tr key={g.id}>
                            <td>{g.student?.first_name} {g.student?.last_name} (ID {g.student_id})</td>
                            <td>{g.subject?.name || g.subject_id}</td>
                            <td>
                                {editingId === g.id ? (
                                    <input type="number" value={editingGrade} onChange={e => setEditingGrade(e.target.value)} style={{ width: '60px' }} />
                                ) : (
                                    g.grade
                                )}
                            </td>
                            <td>{g.date}</td>
                            <td>
                                {editingId === g.id ? (
                                    <button onClick={() => editGrade(g.id, editingGrade)}>Сохранить</button>
                                ) : (
                                    <button onClick={() => { setEditingId(g.id); setEditingGrade(g.grade); }}>Изменить</button>
                                )}
                            </td>
                            <td><button onClick={() => deleteGrade(g.id)}>Удалить</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function App() {
    const token = localStorage.getItem('token');
    let roleId = 0;
    if (token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            roleId = payload.roleId || 0;
        } catch (e) { }
    }

    return (
        <BrowserRouter>
            <div>
                {token && (
                    <nav style={{ marginBottom: 20 }}>
                        {roleId === 1 && <Link to="/users">Пользователи</Link>}
                        {roleId === 1 && ' | '}
                        {roleId === 1 && <Link to="/admin-grades">Управление оценками</Link>}
                        {roleId === 2 && ' | '}
                        {roleId === 2 && <Link to="/admin-grades">Управление оценками</Link>}
                        {roleId === 3 && <Link to="/my-grades">Мои оценки</Link>}
                    </nav>
                )}
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/users" element={roleId === 1 ? <UsersList /> : <Navigate to="/my-grades" />} />
                    <Route path="/my-grades" element={<MyGrades />} />
                    <Route path="/admin-grades" element={(roleId === 1 || roleId === 2) ? <AdminGrades /> : <Navigate to="/my-grades" />} />
                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;