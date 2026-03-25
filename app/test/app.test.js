const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const expect = chai.expect;

chai.use(chaiHttp);

describe('Sample App - API Tests', () => {

  describe('GET /', () => {
    it('should return status 200', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return JSON with status running', (done) => {
      chai.request(app)
        .get('/')
        .end((err, res) => {
          expect(res.body).to.have.property('status').equal('running');
          done();
        });
    });
  });

  describe('GET /health', () => {
    it('should return status 200', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it('should return healthy status', (done) => {
      chai.request(app)
        .get('/health')
        .end((err, res) => {
          expect(res.body).to.have.property('status').equal('healthy');
          done();
        });
    });
  });

});

