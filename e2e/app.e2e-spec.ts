import { ColorPickerPage } from './app.po';

describe('color-picker App', () => {
  let page: ColorPickerPage;

  beforeEach(() => {
    page = new ColorPickerPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
