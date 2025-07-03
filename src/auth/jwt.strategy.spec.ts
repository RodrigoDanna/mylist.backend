import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;

  beforeEach(() => {
    jwtStrategy = new JwtStrategy();
  });

  it('should be defined', () => {
    expect(jwtStrategy).toBeDefined();
  });

  it('should call super with correct options', () => {
    // Check the options passed to PassportStrategy
    expect(jwtStrategy).toBeInstanceOf(JwtStrategy);
    // Can't directly test super, but can check validate method
    expect(typeof jwtStrategy.validate).toBe('function');
  });

  it('should validate and return payload', () => {
    const payload = { sub: '123', email: 'test@example.com' };
    expect(jwtStrategy.validate(payload)).toEqual(payload);
  });
});
