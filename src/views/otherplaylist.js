import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import '../css/otherplaylist.css';
import Cookies from 'js-cookie';
import tokenValidCheck from '../auth/tokenValidCheck';
import { useNavigate } from 'react-router-dom';


const OtherPlaylist = () => {
    const { userNo } = useParams();
    const [data, setData] = useState(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [songCount, setSongCount] = useState(0);
    const [categories, setCategories] = useState('');
    const [userNickname, setUserNickname] = useState('');
    const navigate = useNavigate();

    const token = Cookies.get('authToken');
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
    const handleNotLoggedIn = () => {
        setData(null);
    };
    useEffect(() => {
        // URL에서 추출한 userNo를 이용해 데이터 가져옴
        if (token && userNo) {
            fetchData(userNo);
        }
    }, [token, userNo]);

    const fetchData = async (userNo) => {
        try {
            const response = await fetch(`/api/v3/playlists/otherplaylist/${userNo}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const result = await response.json();
                setData(result);
                setIsLiked(result.isLiked);
                setLikeCount(result.user.userLike);
                setSongCount(result.playlists.length);
                setCategories(result.categories.map(category => category.categoryName).join(" "));
                setUserNickname(result.user.userNickname);
            } else {
                console.error('Failed to fetch data');
            }
        } catch (error) {
            console.error('Error fetching playlist data:', error);
        }
    };

    // 좋아요 버튼 클릭 핸들러
    const handleLike = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/v3/playlists/like", {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userNo })
            });

            if (response.ok) {
                const result = await response.json();
                setIsLiked(result.isLiked);
                setLikeCount(result.isLiked ? likeCount + 1 : likeCount - 1);
                alert(result.message);
            } else {
                throw new Error('Failed to like playlist');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // 음악 추가 확인 함수
    const confirmAddMusic = async (e, musicId) => {
        e.preventDefault();
        if (window.confirm("이 음악을 플레이리스트에 추가하시겠습니까?")) {
            try {
                const response = await fetch('/api/v3/playlists/other', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ musicId })
                });

                if (response.ok) {
                    alert("음악이 성공적으로 추가되었습니다.");
                } else {
                    const errorText = await response.text();
                    alert(errorText);
                }
            } catch (error) {
                console.error('Error adding music:', error);
            }
        }
    };

    if (!data) return <div>Loading...</div>;

    return (
        <div className="main-container">
            <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src="/assets/img/songsong_color.jpg" alt="logo" />
                    </a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav ms-auto">
                            <li className="nav-item">
                                <span className="nav-link">{data.loginuser_name}님</span>
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

            <div className="profile-container">
                <div className="profile-info">
                    <img src="/assets/img/noProfile.png" className="profile-icon" alt="Profile" />
                    <div className="profile-details">
                        <h2>{userNickname}</h2>
                        <p>🎵 {songCount} ❤️ {likeCount}</p>
                        <p>{categories}</p>
                    </div>
                    <div className="like-button-container">
                        <form onSubmit={handleLike}>
                            <input type="hidden" name="userNo" value={userNo} />
                            <button type="submit" className="like-button">
                                {isLiked ? "좋아요 취소" : "좋아요"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <hr />

            <table className="playlist-table">
                <thead>
                <tr>
                    <th>카테고리</th>
                    <th>곡 제목</th>
                    <th>가수</th>
                    <th>링크</th>
                    <th>추가</th>
                </tr>
                </thead>
                <tbody>
                {data.playlists.map((playlist) => (
                    <tr key={playlist.music.musicId}>
                        <td>{playlist.music.categoryDto.categoryName}</td>
                        <td>{playlist.music.musicName}</td>
                        <td>{playlist.music.musicArtist}</td>
                        <td>
                            <a href={playlist.music.musicLink}>{playlist.music.musicName}</a>
                        </td>
                        <td>
                            <form onSubmit={(e) => confirmAddMusic(e, playlist.music.musicId)}>
                                <button type="submit" className="action-button">추가</button>
                            </form>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default OtherPlaylist;
