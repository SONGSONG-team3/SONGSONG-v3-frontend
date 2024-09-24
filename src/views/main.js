import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/main.css';
import Cookies from 'js-cookie';
import tokenValidCheck from '../auth/tokenValidCheck';

const MainPage = () => {
    const [userInfo, setUserInfo] = useState(null);
    const [currentCategory, setCurrentCategory] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [playlists, setPlaylists] = useState([]);
    const [selectedGenreIndex, setSelectedGenreIndex] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const token = Cookies.get('authToken');
                if (!token) throw new Error('No token found');

                const response = await fetch('/api/v3/users/info', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) throw new Error('Failed to fetch user info');

                const userDto = await response.json();
                setUserInfo(userDto);
            } catch (error) {
                console.error('로그인 정보 가져오기 오류:', error);
                handleNotLoggedIn();
            }
        };

        fetchUserInfo();
    }, []);

    const handleNotLoggedIn = () => {
        setUserInfo(null);
    };

    const showPlaylist = async (categoryId, page = 0, size = 15) => {
        try {
            setCurrentCategory(categoryId);
            setCurrentPage(page); // 페이지가 변경되면 현재 페이지 상태를 업데이트
            const token = Cookies.get('authToken');

            const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

            const response = await fetch(`/api/v3/playlists/${categoryId}?page=${page}&size=${size}`, {
                headers: headers,
            });

            const result = await response.json();
            if (result.result === "SUCCESS") {
                const formattedPlaylists = result.list
                    // 로그인한 사용자의 플레이리스트는 제외 (토큰이 있을 경우)
                    .filter(playlistDto => (!token || playlistDto.userNo !== userInfo?.userNo) && result.songCountMap[playlistDto.userNo] > 0)
                    .map((playlistDto) => {
                        const userDto = result.userMap[playlistDto.userNo];
                        const categories = result.userCategoryMap[playlistDto.userNo] || [];
                        const categoriesText = categories.map(category => category.categoryName).join(', ');
                        const songCount = result.songCountMap[playlistDto.userNo] || 0;

                        return {
                            userNo: playlistDto.userNo,
                            userImage: userDto.userImage || '/assets/img/noProfile.png',
                            userNickname: userDto.userNickname,
                            categories: categoriesText,
                            songCount: songCount,
                            userLike: userDto.userLike,
                        };
                    });

                setPlaylists(formattedPlaylists);
                setTotalPages(result.totalPages);
            } else {
                alert("플레이리스트를 불러올 수 없습니다.");
            }
        } catch (error) {
            console.error("플레이리스트 가져오기 오류:", error);
            alert("플레이리스트를 가져오는 중 오류가 발생했습니다.");
        }
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

    const handleMyPlaylistNavigation = async () => {
        try {
            const isAuthenticated = tokenValidCheck();
            if (isAuthenticated) {
                navigate('/myplaylist');
            }
        } catch (error) {
            console.error('인증 실패:', error);
        }
    };

    // GenreSelection 컴포넌트
    const genres = ['발라드', '힙합', '인디', '락/메탈', '트로트', '댄스', 'R&B', '밴드'];

    const handleGenreClick = (index) => {
        setSelectedGenreIndex(index);
        showPlaylist(index + 1); // 카테고리 ID를 index + 1로 전달
    };

    return (
        <div>
            {/* Header */}
            <nav className="navbar navbar-expand-lg navbar-light fixed-top">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src="/assets/img/songsong_color.jpg" alt="logo" />
                    </a>
                    <div className="collapse navbar-collapse">
                        <ul className="navbar-nav ms-auto" id="user-info">
                            {userInfo ? (
                                <>
                                    <li className="nav-item">
                                        <span className="nav-link">{userInfo.userName}님</span>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#" onClick={handleMyPlaylistNavigation}>My
                                            플레이리스트</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#" onClick={handleMyPageNavigation}>My 페이지</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="#" onClick={() => {
                                            Cookies.remove('authToken');
                                            alert("로그아웃 되었습니다.");
                                            setTimeout(handleNotLoggedIn, 1000);
                                        }}>로그아웃</a>
                                    </li>
                                </>
                            ) : (
                                <>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/login">로그인</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/signup">회원가입</a>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Genre Selection */}
            <div className="container button-container text-center">
                <div className="row justify-content-center">
                    {genres.map((genre, index) => (
                        <div className="col-auto" key={index}>
                            <button
                                type="button"
                                className={`btn genre-btn ${selectedGenreIndex === index ? 'selected' : ''}`}
                                onClick={() => handleGenreClick(index)}
                            >
                                {genre}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Playlists */}
            <div className="container playlist-container">
                {playlists.map((playlistDto) => (
                    <div className="card-container" key={playlistDto.userNo}>
                        <a href={`/otherplaylist/${playlistDto.userNo}`}>
                            <div className="card">
                                <div className="card-body">
                                    <img src={playlistDto.userImage || '/assets/img/noProfile.png'} alt="User Image" />
                                    <div className="info-text">😎 {playlistDto.userNickname}</div>
                                    <div className="info-text">
                                        💿 {playlistDto.categories || '카테고리 없음'}
                                    </div>
                                    <div className="info-text">🎵 {playlistDto.songCount} ❤️ {playlistDto.userLike}</div>
                                </div>
                            </div>
                        </a>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <nav>
                <ul className="pagination">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <li className={`page-item ${i === currentPage ? 'active' : ''}`} key={i}>
                            <a className="page-link" href="#" onClick={() => showPlaylist(currentCategory, i)}>
                                {i + 1}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        </div>
    );
};

export default MainPage;
