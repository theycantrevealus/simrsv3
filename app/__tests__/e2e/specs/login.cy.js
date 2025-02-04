const visit = () => cy.visit('/')
const app = () => cy.window()
const getStore = () => app().its('store')
describe('Login Page', () => {
  beforeEach(visit)
  it('Apps load', () => {
    app().its('app')
  })

  it('Cypress is loaded', () => {
    app().its('parent.Cypress').should('be.an', 'object')
  })

  it('Visits the app root url', () => {
    // cy.contains('h1', 'Login')
    cy.get('button#submitButton').as('btnLogin')
    cy.contains('Email').get('#loginEmail').as('emailInput')
    cy.contains('Password').get('#loginPassword').as('passwordInput')

    cy.get('@btnLogin').should('be.visible')
    cy.get('@emailInput').should('be.visible')
    cy.get('@passwordInput').should('be.visible')

    cy.get('@emailInput').type('takashitanaka@horas.com')
    cy.get('@passwordInput').type('123456')
    cy.get('button#submitButton').should('be.enabled')
    cy.get('button#submitButton')
      .click()
      .then(() => {
        // const credential = getStore().its('state.credential.token')
        cy.url().should('include', 'dashboard')
      })
  })
})
