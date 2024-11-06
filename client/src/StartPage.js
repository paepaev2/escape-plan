import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StartPage = () => {
    const [nickname, setNickname] = useState('');
    const navigate = useNavigate();

    const handleNicknameChange = (e) => {
        setNickname(e.target.value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (nickname.trim() === '') {
            alert('Please enter your nickname!');
            return;
        }

        localStorage.setItem('nickname', nickname);
        navigate('/game', { state: { nickname } });
    };

    return (
        <div>
            <h1>ESCAPE PLAN</h1>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Enter your nickname"
                    value={nickname}
                    onChange={handleNicknameChange}
                />
                <button type="submit">Start Game</button>
            </form>
        </div>
    );
};

export default StartPage;