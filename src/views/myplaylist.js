import '../css/myplaylist.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import tokenValidCheck from '../auth/tokenValidCheck';


const MyPlaylist = () => {
    const [user, setUser] = useState({});
    const [playlists, setPlaylists] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        category: '',
        songTitle: '',
        artist: '',
        songLink: '',
    });
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("authToken"); // 쿠키에서 토큰을 가져옴
            if (token) {
                try {
                    const response = await fetch('/api/v3/playlists/myplaylist', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data); // 응답 데이터 확인
                        setUser(data.user);
                        setPlaylists(data.playlists);
                    } else {
                        alert('사용자 정보를 가져오는 데 실패했습니다.');
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                    alert("데이터를 가져오는 중 오류가 발생했습니다.");
                }
            }
        };
        
        fetchData();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleNotLoggedIn = () => {
        setUser(null);
    };
    const handleToggleForm = () => {
        setShowForm(!showForm);
        console.log("showForm 상태:", !showForm); // 상태 변화를 추적
    };
    const handleMyPageNavigation = async () => {
        try {
            const isAuthenticated = tokenValidCheck();
            if (isAuthenticated) {
                navigate('/mypage');
            }
        } catch (error) {
            console.error('인증 실패:', error);
        }
    };
    const handleDelete = async (musicId) => {
        if (window.confirm("정말 삭제하시겠습니까?")) {
            const token = Cookies.get("authToken"); // 쿠키에서 토큰을 가져옴
            try {
                const response = await fetch(`/api/v3/playlists/${musicId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (response.ok) {
                    alert("음악이 삭제되었습니다.");
                    setPlaylists(playlists.filter(playlist => playlist.music.musicId !== musicId));
                } else {
                    alert("삭제 실패");
                }
            } catch (error) {
                console.error('Error deleting:', error);
                alert("삭제 도중 오류가 발생했습니다.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = Cookies.get("authToken"); // 쿠키에서 토큰 가져오기
        try {
            const response = await fetch('/api/v3/playlists/my', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    musicName: formData.songTitle,
                    musicArtist: formData.artist,
                    musicLink: formData.songLink,
                    categoryId: parseInt(formData.category, 10),
                }),
            });
    
            const responseData = await response.text(); // 텍스트 응답 처리
    
            if (response.ok) {
                alert(responseData); // 서버에서 반환한 텍스트 알림
                setShowForm(false);
                setFormData({ category: '', songTitle: '', artist: '', songLink: '' });
                window.location.reload();
            } else {
                alert('음악 추가 실패');
            }
        } catch (error) {
            console.error('Error adding music:', error);
            alert("음악 추가 중 오류가 발생했습니다.");
        }
    };
    

    return (
        <div className="main-container">
            {/* Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src="/assets/img/songsong_color.jpg" alt="logo" />
                    </a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <span className="nav-link">{user.userName}님</span>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="#" onClick={handleMyPageNavigation}>My 페이지</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/" onClick={() => {
                                    Cookies.remove('authToken');
                                    alert("로그아웃 되었습니다.");
                                    setTimeout(handleNotLoggedIn, 1000);
                                }}>로그아웃</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Profile */}
            <div className="profile-container">
                <div className="profile-info">
                    <img src="/assets/img/goomba.jpg" className="profile-icon" alt="Profile" />
                    <div className="profile-details">
                        <h2>{user.userNickname}</h2>
                        <p>🎵{playlists.length} ❤️{user.userLike}</p>
                        <p>{user.userCategory}</p>
                    </div>
                </div>
            </div>
            <hr />

            {/* Playlist Table */}
            <table className="playlist-table">
                <thead>
                    <tr>
                        <th>카테고리</th>
                        <th>곡 제목</th>
                        <th>가수</th>
                        <th>링크</th>
                        <th>삭제</th>
                    </tr>
                </thead>
                <tbody>
                    {playlists.length > 0 ? (
                        playlists.map(playlist => (
                            <tr key={playlist.music.musicId}>
                                <td>{playlist.music.categoryDto.categoryName}</td>
                                <td>{playlist.music.musicName}</td>
                                <td>{playlist.music.musicArtist}</td>
                                <td>
                                    <a href={playlist.music.musicLink} target="_blank" rel="noopener noreferrer">{playlist.music.musicName}</a>
                                </td>
                                <td>
                                    <button className="action-button" onClick={() => handleDelete(playlist.music.musicId)}>삭제</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5">플레이리스트에 곡이 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Add Song Button & Form */}
            <div className="add-song-container">
                <div className="add-song-button-container">
                    <button className="add-song-button" onClick={handleToggleForm}>+</button>
                </div>
                <div className={`add-song-form ${showForm ? 'show' : ''}`}>
                    <h3>노래 추가</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="form-row">
                            <div className="form-group">
                                <select name="category" onChange={handleFormChange} required>
                                    <option value="">카테고리 선택</option>
                                    <option value="1">발라드</option>
                                    <option value="2">힙합</option>
                                    <option value="3">인디</option>
                                    <option value="4">락/메탈</option>
                                    <option value="5">트로트</option>
                                    <option value="6">댄스</option>
                                    <option value="7">R&B</option>
                                    <option value="8">밴드</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <input type="text" name="songTitle" placeholder="곡 제목을 입력하세요" value={formData.songTitle} onChange={handleFormChange} required />
                            </div>
                            <div className="form-group">
                                <input type="text" name="artist" placeholder="가수를 입력하세요" value={formData.artist} onChange={handleFormChange} required />
                            </div>
                            <div className="form-group">
                                <input type="url" name="songLink" placeholder="곡 링크를 입력하세요" value={formData.songLink} onChange={handleFormChange} required />
                            </div>
                        </div>
                        <div className="form-actions">
                            <button type="submit">추가</button>
                            <button type="button" onClick={handleToggleForm}>취소</button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
};

export default MyPlaylist;
