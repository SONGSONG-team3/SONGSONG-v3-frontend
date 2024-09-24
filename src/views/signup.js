import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const Signup = () => {
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [userPassword, setUserPassword] = useState('');
    const [userPassword2, setUserPassword2] = useState('');
    const [userNickname, setUserNickname] = useState('');
    const [selectedCategories, setSelectedCategories] = useState(new Set());

    useEffect(() => {
        document.querySelector("#userName").focus();
    }, []);

    const validateUserName = (name) => name.length >= 4;
    
    const validatePassword = (password) => {
        const patternEngAtListOne = /[a-zA-Z]+/;
        const patternSpeAtListOne = /[~!@#$%^&*()_+|<>?:{}]+/;
        const patternNumAtListOne = /[0-9]+/;
        return (
            patternEngAtListOne.test(password) &&
            patternSpeAtListOne.test(password) &&
            patternNumAtListOne.test(password) &&
            password.length >= 8
        );
    };
    
    const validatePassword2 = () => userPassword2 === userPassword;
    
    const validateEmail = (email) => {
        const regexp = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/i;
        return regexp.test(email);
    };

    const handleCategoryClick = (category) => {
        const newCategories = new Set(selectedCategories);
        if (newCategories.has(category)) {
            newCategories.delete(category);
        } else {
            newCategories.add(category);
        }
        setSelectedCategories(newCategories);
    };

    const signup = async () => {
        const categoryMapping = {
            '발라드': 1,
            '힙합': 2,
            '인디': 3,
            '락/메탈': 4,
            '트로트': 5,
            '댄스': 6,
            'R&B': 7,
            '밴드': 8,
        };

        const categoryIds = Array.from(selectedCategories).map(name => categoryMapping[name]);
        
        const fetchOptions = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userDto: {
                    userName,
                    userEmail,
                    userPassword,
                    userNickname,
                    userImage: ""
                },
                categories: categoryIds
            }),
        };

        const response = await fetch("/api/v3/users/signup", fetchOptions);
        const data = await response.json();

        if (data.success) {
            alert('송송🎶 회원가입을 축하합니다.')
            window.location.href = "/";
        } else {
            if (data.msg === "Email already exists") {
                alert('이미 사용 중인 이메일입니다.');
            } else if (data.msg === "Nickname already exists") {
                alert('이미 사용 중인 닉네임입니다.');
            } else {
                alert("서버 오류");
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (
            validateUserName(userName) &&
            validateEmail(userEmail) &&
            validatePassword(userPassword) &&
            validatePassword2() &&
            selectedCategories.size > 0
        ) {
            signup();
        } else {
            alert("입력이 올바르지 않습니다.");
        }
    };

    return (
        <div className="container">
            <div className="content d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
                <img src="/assets/img/noProfile.png" alt="new-image" className="rounded-circle" style={{ width: '250px', height: '250px', marginTop: '60px' }} />
                <div className="form-container">
                    <img src="/assets/img/songsong.jpg" style={{marginLeft:'300px', marginBottom:'50px'}}alt="logo" width="100" height="60" />
                    <form onSubmit={handleSubmit} className="w-100 d-flex flex-column align-items-center">
                        <div className="mb-3">
                            <input type="text" className="form-control" id="userName" placeholder="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <input type="text" className="form-control" id="userEmail" placeholder="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <input type="password" className="form-control" id="userPassword" placeholder="password" value={userPassword} onChange={(e) => setUserPassword(e.target.value)} />
                            <p id="valid" style={{fontSize:'12px'}}>🎶 1개 이상의 특수문자, 대소문자 및 숫자 포함 8자리 이상</p>
                        </div>
                        <div className="mb-3">
                            <input type="password" className="form-control" id="userPassword2" placeholder="confirm password" value={userPassword2} onChange={(e) => setUserPassword2(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <input type="text" className="form-control" id="userNickname" placeholder="nickname" value={userNickname} onChange={(e) => setUserNickname(e.target.value)} />
                        </div>
                        <div className="mb-1 mt-3">
                            <h6>좋아하는 음악 취향을 선택해주세요 💓</h6>
                        </div>
                        <div className="mt-1 mb-3" id="genreButtons">
                            {['발라드', '힙합', '인디', '락/메탈', '트로트', '댄스', 'R&B', '밴드'].map(genre => (
                                <button
                                    type="button"
                                    className={`btn genre-btn ${selectedCategories.has(genre) ? 'selected' : ''}`}
                                    onClick={() => handleCategoryClick(genre)}
                                    key={genre}
                                    style={{ margin: '5px', padding: '10px 20px', borderRadius: '20px' }}
                                >
                                    {genre}
                                </button>
                            ))}
                        </div>
                        <button id="btnSignup" className="btn btn-primary" type="submit" style={{ width: '300px', backgroundColor: '#43486e', borderColor: '#43486e' }}>
                            회원가입
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;
