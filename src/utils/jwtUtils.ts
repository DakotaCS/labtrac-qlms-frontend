// src/utils/jwtUtils.ts

// Decode the JWT to extract the payload
export function decodeJwt(token: string) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error("Invalid JWT token", error);
      return null;
    }
  }
  
  // Check if the token is expired
  export function isTokenExpired(token: string) {
    const decodedToken = decodeJwt(token);
    if (!decodedToken) return true;
    
    const currentTime = Date.now() / 1000;
    return decodedToken.exp < currentTime;
  }
  