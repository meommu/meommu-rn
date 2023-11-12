type CypressElement = Cypress.Chainable<JQuery<HTMLElement>>;

/**
 * core
 */
export const getTestElement = (testId: string) => {
  return cy.get(`[data-testId="${testId}"]`);
};

/**
 * mixin
 */
export const clearAndWriteInputText = (
  cypressElement: CypressElement,
  text: string
) => {
  cypressElement.clear();
  cypressElement.type(text);
};

/**
 * get
 */
export const getSignUpEmailInput = () => {
  return getTestElement("input-signup-email");
};

export const getSignUpPasswordInput = () => {
  return getTestElement("input-signup-password");
};

export const getSignUpPasswordConfirmInput = () => {
  return getTestElement("input-signup-password-confirm");
};

export const getSignUpKindergartenNameInput = () => {
  return getTestElement("input-signup-kindergarten-name");
};

export const getSignUpKindergartenDirectorNameInput = () => {
  return getTestElement("input-signup-kindergarten-director-name");
};

export const getSignUpPhoneNumberInput = () => {
  return getTestElement("input-signup-phone-number");
};

export const getSignInEmailInput = () => {
  return getTestElement("input-signin-email");
};

export const getSignInPasswordInput = () => {
  return getTestElement("input-signin-password");
};

/**
 * click
 */
export const clickAgreementButton = () => {
  getTestElement("button-agreement").click();
};

export const clickEmailDupChkButton = () => {
  getTestElement("button-email-dup-chk").click();
};

export const clickNextStepButton = () => {
  getTestElement("button-next-step-of-signup").click();
};

export const clickSignInButton = () => {
  getTestElement("button-signin").click();
};

export const clickSettingButtonClick = () => {
  getTestElement("button-setting").click();
};

export const clickLogoutButtonClick = () => {
  getTestElement("button-logout").click();
};

export const clickSignUpText = () => {
  getTestElement("button-signup").click();
};

/**
 * contains
 */
export const chkSwiperIndex = (swiperIndex: number) => {
  cy.contains(`swiperIndex ${swiperIndex}`);
};
