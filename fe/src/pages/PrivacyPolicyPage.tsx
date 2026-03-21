const PrivacyPolicyPage = () => (
  <div className="mx-auto max-w-2xl px-6 py-12 text-sm text-gray-700">
    <h1 className="mb-6 text-2xl font-bold">개인정보처리방침</h1>
    <p className="mb-4">
      Walk2World(이하 "서비스")는 이용자의 개인정보를 중요하게 생각하며, 관련 법령에 따라 개인정보를 처리합니다.
    </p>

    <h2 className="mb-2 mt-8 text-lg font-semibold">1. 수집하는 개인정보</h2>
    <ul className="mb-4 list-disc space-y-1 pl-6">
      <li>소셜 로그인(Google, Kakao) 시 제공되는 이메일, 닉네임, 프로필 이미지</li>
      <li>서비스 이용 과정에서 생성되는 게시글, 위치 기반 활동 데이터, 친구/채팅 정보</li>
      <li>기기 정보, 접속 로그, 오류 로그</li>
    </ul>

    <h2 className="mb-2 mt-8 text-lg font-semibold">2. 이용 목적</h2>
    <ul className="mb-4 list-disc space-y-1 pl-6">
      <li>회원 식별 및 서비스 제공</li>
      <li>커뮤니티, 위치 기반 피드, 채팅 기능 운영</li>
      <li>서비스 품질 개선 및 보안 대응</li>
    </ul>

    <h2 className="mb-2 mt-8 text-lg font-semibold">3. 보유 기간</h2>
    <p className="mb-4">
      회원 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보관이 필요한 정보는 해당 기간 동안 보관 후 파기합니다.
    </p>

    <h2 className="mb-2 mt-8 text-lg font-semibold">4. 제3자 제공 및 처리 위탁</h2>
    <p className="mb-4">원칙적으로 개인정보를 제3자에게 제공하지 않으며, 서비스 운영을 위해 아래 업체를 이용할 수 있습니다.</p>
    <ul className="mb-4 list-disc space-y-1 pl-6">
      <li>Amazon Web Services (인프라 운영)</li>
      <li>Google LLC (소셜 로그인)</li>
      <li>Kakao Corp. (소셜 로그인)</li>
    </ul>

    <h2 className="mb-2 mt-8 text-lg font-semibold">5. 이용자 권리</h2>
    <p className="mb-4">이용자는 개인정보 열람, 정정, 삭제, 처리정지를 요청할 수 있습니다.</p>

    <h2 className="mb-2 mt-8 text-lg font-semibold">6. 문의처</h2>
    <p className="mb-4">
      개인정보 관련 문의는 아래 이메일로 접수해 주세요.
      <br />
      이메일:{" "}
      <a className="text-blue-600 underline" href="mailto:imalex124@gmail.com">
        imalex124@gmail.com
      </a>
    </p>

    <p className="mt-10 text-xs text-gray-400">최종 수정일: 2026년 3월 13일</p>
  </div>
);

export default PrivacyPolicyPage;
