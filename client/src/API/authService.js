import axios from 'axios';
const BASE_URL = 'http://localhost:3001/api/scoreboard';

export const login = async (data) => {
    const res = await axios.post(BASE_URL + '/Login', { userName: data })
    if (res.data) if (res.data.status) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('userName', data);
    }
    return res.data;
}

export const logout = async (data) => {
    const res = await axios.post(BASE_URL + '/logout', { userName: data });
    return res.data;
}

export const updatePoints = async (data) => {
    const res = await axios.post(BASE_URL + '/updatePoints', { userName: data.userName, points: data.points });
    return res.data;
}

export const getScoreboard = async () => {

    const res = await axios.get(BASE_URL + '/getAll');
    if (res.data)
        if (res.data.status) localStorage.setItem('scoreboard', JSON.stringify(res.data.message));

    return res.data;
}

const authService = {
    login,
    logout,
    updatePoints,
    getScoreboard
}

export default authService;