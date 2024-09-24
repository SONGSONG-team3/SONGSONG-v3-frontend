import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../css/login.css';
import Cookies from 'js-cookie';

const LoginPage = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');

  const handleLoginClick = async () => {
    if (validate()) {
      try {
        const response = await fetch("/api/v3/users/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            password: userPassword,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            alert("이메일 또는 비밀번호가 올바르지 않습니다.");
          } else {
            alert("로그인 중 오류가 발생했습니다.");
          }
          return;
        }

        const data = await response.json();

        if (data.success) {
          Cookies.set('authToken', data.token); // 쿠키에 토큰 저장
          window.location.href = "/";
          console.log(data.token);
        } else {
          alert("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
      } catch (error) {
        alert("로그인 중 오류가 발생했습니다.");
      }
    }
  };

  const validate = () => {
    return userEmail.length > 0 && userPassword.length > 0;
  };

  return (
    <div className="container center-content text-center">
      <div className="mb-3">
        <a className="navbar-brand" href="/">
          <img src="/assets/img/songsong.jpg" alt="logo" width="140" height="40" />
        </a>
      </div>

      <form id="loginForm" noValidate>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            id="userEmail"
            placeholder="email"
            name="userEmail"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <input
            type="password"
            className="form-control"
            id="userPassword"
            placeholder="password"
            name="userPassword"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            required
          />
        </div>
      </form>

      <div>
        <button id="btnLogin" className="btn btn-primary" onClick={handleLoginClick}>
          로그인
        </button>
      </div>
    </div>
  );
};

export default LoginPage;