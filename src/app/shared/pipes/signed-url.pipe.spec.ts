import { SignedUrlPipe } from './signed-url.pipe';

describe('SignedUrlPipe', () => {
  it('create an instance', () => {
    const pipe = new SignedUrlPipe();
    expect(pipe).toBeTruthy();
  });
});
