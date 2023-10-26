export const enum CODE {
  /**
   * 성공적으로 요청이 처리되거나, 리소스가 생성되었을 경우 코드
   */
  "OK" = "0000",

  /**
   * 이메일이 중복되었을 경우 코드
   */
  "EMAIL_DUP" = "K001",

  /**
   * 잘못된 요청일 경우 코드
   */
  "BAD_REQUEST" = "C400",

  /**
   * 인증에 실패한 경우 코드
   */
  "AUTH_NOT_FOUND" = "A001",

  /**
   * 알수없는 에러가 발생했을 경우
   *
   * TODO: 임의로 설정된 값 변경할 것
   */
  "INTERNAL_SERVER_ERROR" = "S5XX",
}