package com.walkworld.api.domain.auth.service;

import com.walkworld.api.domain.auth.dto.req.*;
import com.walkworld.api.domain.auth.dto.res.TokenResDTO;

public interface AuthService {
    TokenResDTO signup(SignupReqDTO request);
    TokenResDTO login(LoginReqDTO request);
    TokenResDTO refresh(RefreshReqDTO request);
    void logout(RefreshReqDTO request);
    void requestPasswordReset(PasswordResetReqDTO request);
    void changePassword(Long userId, ChangePasswordReqDTO request);
    TokenResDTO kakaoLogin(KakaoLoginReqDTO request);
    TokenResDTO googleLogin(GoogleLoginReqDTO request);
}
