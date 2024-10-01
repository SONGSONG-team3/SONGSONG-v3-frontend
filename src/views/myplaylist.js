import '../css/myplaylist.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import tokenValidCheck from '../auth/tokenValidCheck';


const MyPlaylist = () => {

    const [genre, setGenres] = useState([]); 
    const [languages, setLanguages] = useState([]); 
    const [country, setCountry] = useState([]);
    const [user, setUser] = useState({});
    const [playlists, setPlaylists] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        genre: '',
        songTitle: '',
        artist: '',
        songLink: '',
        language: '',
        country: ''
    });
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get("authToken");
            if (token) {
                try {
                    const response = await fetch('/api/v3/playlists/myplaylist', {
                        headers: { 'Authorization': `Bearer ${token}` },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        console.log(data); 
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

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await fetch('/commoncodes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(["001","002","003"]),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
                    setGenres(data.commonCodeDtoListMap['001']);
                    setLanguages(data.commonCodeDtoListMap['002']);
                    setCountry(data.commonCodeDtoListMap['003']);
                } else {
                    alert('공통코드 데이터를 불러오는 데 실패했습니다.');
                }
            } catch (error) {
                console.error("Error fetching categories:", error);
                alert("공통코드 데이터를 불러오는 중 오류가 발생했습니다.");
            }
        };

        fetchCategories();
    }, []);

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        let selectedOption = null;

        if (name === "genre") {
            selectedOption = genre.find(cat => cat.code === value);
        } else if (name === "language") {
            selectedOption = languages.find(lan => lan.code === value);
        } else if (name === "country") {
            selectedOption = country.find(c => c.code === value);
        }

        if (selectedOption) {
            setFormData({ ...formData, [name]: selectedOption.codeName });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };
    
    const handleNotLoggedIn = () => {
        setUser(null);
    };
    const handleToggleForm = () => {
        setShowForm(!showForm);
        console.log("showForm 상태:", !showForm);
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
            const token = Cookies.get("authToken");
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
        const token = Cookies.get("authToken");
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
                    musicGenre: formData.genre,
                    musicLanguage: formData.language,
                    musicCountry: formData.country, 
                }),
            });
    
            const responseData = await response.text();
    
            if (response.ok) {
                alert(responseData);
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
                                <td>{playlist.music.musicGenre}</td>
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
                                <select name="genre" onChange={handleFormChange} required>
                                    <option value="">카테고리 선택</option>
                                    {genre.map((g) => (
                                        <option key={g.code} value={g.code}>
                                            {g.codeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                            <select name="language" onChange={handleFormChange} required>
                                    <option value="">언어 선택</option>
                                    {languages.map((lan) => (
                                        <option key={lan.code} value={lan.code}>
                                            {lan.codeName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                            <select name="country" onChange={handleFormChange} required>
                                    <option value="">국가 선택</option>
                                    {country.map((c) => (
                                        <option key={c.code} value={c.code}>
                                            {c.codeName}
                                        </option>
                                    ))}
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
