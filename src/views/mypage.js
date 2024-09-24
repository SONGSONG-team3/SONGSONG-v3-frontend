import React, { useEffect, useState } from 'react';
import '../css/mypage.css';
import Cookies from 'js-cookie';

const MyPage = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [section, setSection] = useState('MypageSection');
  const [userDetails, setUserDetails] = useState({
    userNickname: '',
  });
  const [likedPlaylists, setLikedPlaylists] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const token = Cookies.get('authToken');

  useEffect(() => {
    detailMypage();
  }, []);

  const detailMypage = async () => {
    try {
      const response = await fetch('/api/v3/users/mypage', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.result === "success") {
        setUserDetails(data.userDto);
        setSelectedCategories(data.userDto.userCategoryDtoList.map(cat => cat.categoryId));
      } else {
        alert("Error fetching user details.");
      }
    } catch (error) {
      alert("Error loading data.");
    }
  };

  const showLikedPlaylists = async () => {
    try {
      const response = await fetch('/api/v3/playlists/liked', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      console.log(data);
  
      if (data.result === "success") {
        const combinedPlaylists = data.list.map(item => {
          const userInfo = data.userMap[item.userNo];
          const categories = data.userCategoryMap[item.userNo] || [];
          const categoryNames = categories.map(cat => cat.categoryName).join(', ');
          const songCount = data.songCountMap[item.userNo] || 0;
  
          return {
            ...item,
            userNickname: userInfo?.userNickname,
            userImage: userInfo?.userImage || '/assets/img/noProfile.png',
            categoriesText: categoryNames,
            songCount,
            userLike: userInfo?.userLike 
          };
        });
  
        console.log(combinedPlaylists); // 최종적으로 사용될 데이터 확인
        setLikedPlaylists(combinedPlaylists);
      } else {
        alert("Failed to load liked playlists.");
      }
    } catch (error) {
      alert("Error loading playlists.");
    }
  };

  const updateUserInfo = async () => {
    const { password, userNickname } = userDetails;

    try {
      let response = await fetch('/api/v3/users/mypage/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ userPassword: password, userNickname }),
      });
      let data = await response.json();

      if (data.result === "success") {
        alert('회원 정보가 수정되었습니다.');
      } else {
        alert('회원 정보 수정에 실패했습니다.');
      }

      // Update categories
      response = await fetch('/api/v3/users/mypage/updatecate', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(selectedCategories),
      });
      data = await response.json();

      if (data.result === "success") {
        alert('카테고리 정보가 수정 되었습니다.');
      } else {
        alert('카테고리 수정에 실패했습니다.');
      }

      await detailMypage();
    } catch (error) {
      alert('Error updating user info.');
    }
  };


  const handleNotLoggedIn = () => {
    setUserInfo(null);
    window.location.href = "/";
};

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light fixed-top">
        <div className="container-fluid">
          <a className="navbar-brand" href="/">
            <img src="/assets/img/songsong_color.jpg" alt="logo" />
          </a>
          <div className="collapse navbar-collapse">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <span className="nav-link">{userDetails.userName}님</span>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/myplaylist">My 플레이리스트</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={() => {
                    Cookies.remove('authToken');
                    alert("로그아웃 되었습니다.");
                    setTimeout(handleNotLoggedIn, 1000);
                }}>로그아웃</a>
            </li>
            </ul>
          </div>
        </div>
      </nav>

      <h2 className="text-center">관리자 기능</h2>
      <div className="list-group mb-4 mt-5">
        <a href="#" className="list-group-item list-group-item-action" onClick={() => setSection('MypageSection')}>회원 정보 및 카테고리 수정</a>
        <a href="#" className="list-group-item list-group-item-action" onClick={() => { setSection('likedPlaylistSection'); showLikedPlaylists(); }}>좋아요❤️ 한 플레이리스트</a>
      </div>

      {section === 'MypageSection' && (
        <div className="mypage-container">
          <div className="row">
            <div className="col-md-3 mt-5 text-center">
              <img src="/assets/img/noProfile.png" alt="프로필 이미지" className="rounded-circle profile-img" />
            </div>
            <div className="col-md-8">
              <form id="userUpdateForm">
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">이름</label>
                  <input type="text" className="form-control" id="name" name="name" value={userDetails.userName || ''} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">이메일</label>
                  <input type="email" className="form-control" id="email" name="email" value={userDetails.userEmail || ''} disabled />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">비밀번호</label>
                  <input type="password" className="form-control" id="password" name="password" onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })} />
                </div>
                <div className="mb-3">
                  <label htmlFor="nickname" className="form-label">닉네임</label>
                  <input type="text" className="form-control" id="nickname" name="nickname" value={userDetails.userNickname || ''} onChange={(e) => setUserDetails({ ...userDetails, userNickname: e.target.value })} />
                </div>

                <div className="mt-5" id="genreButtons">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(id => (
                    <button
                      key={id}
                      type="button"
                      className={`btn genre-btn ${selectedCategories.includes(id) ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedCategories(prev => {
                          if (prev.includes(id)) {
                            return prev.filter(categoryId => categoryId !== id);
                          }
                          return [...prev, id];
                        });
                      }}
                      data-category-id={id}
                    >
                      {['발라드', '힙합', '인디', '락/메탈', '트로트', '댄스', 'R&B', '밴드'][id - 1]}
                    </button>
                  ))}
                </div>

                <button type="button" className="btn btn-primary mt-5" onClick={updateUserInfo}>회원정보 수정</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {section === 'likedPlaylistSection' && (
        <div id="likedPlaylistSection">
          <div className="container playlist-container">
          {likedPlaylists.map(playlist => (
            <div className="card-container" key={playlist.userNo}>
                <a href={`/otherplaylist/${playlist.userNo}`}>
                  <div className="card">
                    <div className="card-body">
                      <img src={playlist.userImage || '/assets/img/noProfile.png'} alt="User Profile Image" />
                      <div className="info-text">😎 {playlist.userNickname}</div>
                      <div className="info-text">💿 {playlist.categoriesText}</div>
                      <div className="info-text">🎵 {playlist.songCount} ❤️ {playlist.userLike}</div>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPage;