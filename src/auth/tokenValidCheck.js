import Cookies from 'js-cookie';

// 토큰 유효성 검사 함수
const tokenValidCheck = () => {
    const token = Cookies.get('authToken');
    
    if (!token) {
        console.log('No token found');
        return false;
    }

    try {
        const parseJwt = (token) => {
            const base64Url = token.split('.')[1];
            const base64 = decodeURIComponent(atob(base64Url).split('').map(c =>
                '%' + ('0' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(base64);
        };

        const decodedToken = parseJwt(token);
        const expirationDate = new Date(decodedToken.exp * 1000);
        const currentDate = new Date();

        // 토큰이 만료되지 않았으면 인증된 상태 반환
        if (expirationDate > currentDate) {
            return true;
        } else {
            console.log('Token has expired');
            return false;
        }
    } catch (error) {
        console.error('Invalid token format or error parsing token', error);
        return false;
    }
}

export default tokenValidCheck;
