// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
// 기기 및 세션 상태 한국어 매핑
const DEVICE_STATUS_LABELS = {
  compliant: '보안 기준 충족',
  noncompliant: '보안 기준 미충족',
  unknown: '확인 불가',
};

const SESSION_STATUS_LABELS = {
  active: '활성',
  expired: '만료',
  revoked: '철회됨',
  unknown: '확인 불가',
};

const MODE_LABELS = {
  demo: '예제 자료',
  disconnected: '연결 없음',
  unknown: '확인 불가',
};

export function createStudentView() {
  return {
    renderIdentity({ me, devices, sessions }) {
      const container = document.createElement('div');
      container.className = 'student-identity-container';

      // 세 자료(me, devices, sessions) 각각의 모드를 확인하여 중복 없이/누락 없이 안내 표시
      const resources = [
        { label: '내 정보', res: me },
        { label: '기기', res: devices },
        { label: '세션', res: sessions },
      ];

      const modeBox = document.createElement('div');
      modeBox.className = 'student-modes';

      const shownModes = new Set();
      for (const item of resources) {
        const mode = item.res?.mode;
        if (mode && MODE_LABELS[mode] && !shownModes.has(`${mode}-${item.label}`)) {
          shownModes.add(`${mode}-${item.label}`);
          const badge = document.createElement('span');
          badge.className = `student-mode-badge mode-${mode}`;
          badge.textContent = `${item.label}: ${MODE_LABELS[mode]}`;
          modeBox.appendChild(badge);
        }
      }
      if (modeBox.children.length > 0) {
        container.appendChild(modeBox);
      }

      // 1. loading 상태 처리: me, devices, sessions 중 하나라도 loading이면 안내 표시
      if (me?.status === 'loading' || devices?.status === 'loading' || sessions?.status === 'loading') {
        const loadingBox = document.createElement('div');
        loadingBox.className = 'student-status-loading';
        loadingBox.textContent = '불러오는 중';
        container.appendChild(loadingBox);
        return container;
      }

      // 2. error 상태 처리: 오류 발생 시 이전 사용자 정보를 완전히 배제하고 오류 메시지만 렌더링
      if (me?.status === 'error' || devices?.status === 'error' || sessions?.status === 'error') {
        const errorBox = document.createElement('div');
        errorBox.className = 'student-status-error';

        const errors = [];
        if (me?.status === 'error' && me?.error?.message) errors.push(`내 정보: ${me.error.message}`);
        if (devices?.status === 'error' && devices?.error?.message) errors.push(`기기: ${devices.error.message}`);
        if (sessions?.status === 'error' && sessions?.error?.message) errors.push(`세션: ${sessions.error.message}`);

        const errorMsg = errors.length > 0 ? errors.join(', ') : (me?.error?.message || devices?.error?.message || sessions?.error?.message || '확인 불가');
        errorBox.textContent = `연결 실패: ${errorMsg}`;

        container.appendChild(errorBox);
        return container;
      }

      // 3. ok 상태 처리: me.data 사용자/기기/세션 정보 표시
      const identityCard = document.createElement('div');
      identityCard.className = 'student-identity-card';

      const user = me?.data?.user;
      const device = me?.data?.device;
      const session = me?.data?.session;

      // 사용자 정보 표시
      const userRow = document.createElement('div');
      userRow.className = 'student-row student-user-row';
      const userTitle = document.createElement('strong');
      userTitle.textContent = '로그인 사용자: ';
      const userVal = document.createElement('span');
      userVal.textContent = user?.label || user?.id || '확인 불가';
      userRow.appendChild(userTitle);
      userRow.appendChild(userVal);
      identityCard.appendChild(userRow);

      // 현재 기기 정보 및 보안 상태 표시 (한국어 설명 + 원래 status 코드 병기)
      const deviceRow = document.createElement('div');
      deviceRow.className = 'student-row student-device-row';
      const deviceTitle = document.createElement('strong');
      deviceTitle.textContent = '현재 기기: ';
      const deviceVal = document.createElement('span');
      const devStatusCode = device?.status || 'unknown';
      const devStatusText = DEVICE_STATUS_LABELS[devStatusCode] || '확인 불가';
      // 요구사항: 원래 상태 값(compliant, noncompliant 등)도 함께 textContent로 표시
      deviceVal.textContent = `${device?.label || device?.id || '확인 불가'} (${devStatusText} · ${devStatusCode})`;

      // noncompliant 또는 unknown 은 정상처럼 보이지 않도록 별도 표시
      if (devStatusCode !== 'compliant') {
        deviceVal.className = 'student-warn-text';
      }
      deviceRow.appendChild(deviceTitle);
      deviceRow.appendChild(deviceVal);
      identityCard.appendChild(deviceRow);

      // 현재 세션 상태 표시 (한국어 설명 + 원래 status 코드 병기)
      const sessionRow = document.createElement('div');
      sessionRow.className = 'student-row student-session-row';
      const sessionTitle = document.createElement('strong');
      sessionTitle.textContent = '로그인 세션: ';
      const sessionVal = document.createElement('span');
      const sessStatusCode = session?.status || 'unknown';
      const sessStatusText = SESSION_STATUS_LABELS[sessStatusCode] || '확인 불가';
      // 요구사항: 원래 상태 값(active, expired, revoked 등)도 함께 textContent로 표시
      sessionVal.textContent = `${session?.id || '확인 불가'} (${sessStatusText} · ${sessStatusCode})`;

      // active 외의 expired, revoked, unknown 은 정상처럼 보이지 않도록 별도 표시
      if (sessStatusCode !== 'active') {
        sessionVal.className = 'student-warn-text';
      }
      sessionRow.appendChild(sessionTitle);
      sessionRow.appendChild(sessionVal);
      identityCard.appendChild(sessionRow);

      container.appendChild(identityCard);
      return container;
    },
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
